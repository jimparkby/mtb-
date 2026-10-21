import { useEffect, useRef, useState } from 'react';
import {
    BusIcon,
    CaretRightIcon,
    DeviceMobileIcon,
    GameControllerIcon,
    GraduationCapIcon,
    HouseLineIcon,
    LockSimpleIcon,
    MagnifyingGlassIcon,
    QrCodeIcon,
    ReceiptIcon,
    WifiHighIcon,
    type Icon,
} from '@phosphor-icons/react';
import { money, useStore } from '../store';
import { CardCarousel, cardsOf } from '../ui/cards';
import { Done, Swipe, TopBar, cleanAmount, parseAmount } from '../ui/kit';

interface Provider {
    name: string;
    field: 'phone' | 'account';
    hint: string;
}

interface Category {
    id: string;
    name: string;
    sub: string;
    icon: Icon;
    cat: string;
    providers: Provider[];
    kids?: boolean;
    adultsOnly?: boolean;
}

const CATS: Category[] = [
    { id: 'mobile', name: 'Мобильная связь', sub: 'A1, МТС, life:)', icon: DeviceMobileIcon, cat: 'mobile', kids: true, providers: [
        { name: 'A1', field: 'phone', hint: 'Номер телефона' },
        { name: 'МТС', field: 'phone', hint: 'Номер телефона' },
        { name: 'life:)', field: 'phone', hint: 'Номер телефона' },
    ] },
    { id: 'transport', name: 'Транспорт', sub: 'Проездной, такси', icon: BusIcon, cat: 'transport', kids: true, providers: [
        { name: 'Проездной Минсктранс', field: 'account', hint: 'Номер карты проездного' },
        { name: 'Пополнение транспортной карты', field: 'account', hint: 'Номер карты' },
    ] },
    { id: 'school', name: 'Образование', sub: 'Школьное питание, кружки', icon: GraduationCapIcon, cat: 'food', kids: true, providers: [
        { name: 'Школьное питание', field: 'account', hint: 'Лицевой счёт ученика' },
        { name: 'Школа программирования «Код»', field: 'account', hint: 'Номер договора' },
    ] },
    { id: 'games', name: 'Игры и приложения', sub: 'Steam, App Store, Google Play', icon: GameControllerIcon, cat: 'games', kids: true, providers: [
        { name: 'Пополнение Steam', field: 'account', hint: 'Логин Steam' },
        { name: 'App Store и iTunes', field: 'account', hint: 'Apple ID' },
    ] },
    { id: 'internet', name: 'Интернет и ТВ', sub: 'byfly, Zala, Белтелеком', icon: WifiHighIcon, cat: 'shops', adultsOnly: true, providers: [
        { name: 'byfly', field: 'account', hint: 'Номер договора' },
        { name: 'Zala', field: 'account', hint: 'Номер договора' },
    ] },
    { id: 'housing', name: 'Коммунальные платежи', sub: 'Квартплата, газ, электроэнергия', icon: HouseLineIcon, cat: 'shops', adultsOnly: true, providers: [
        { name: 'Квартплата (ЖКУ)', field: 'account', hint: 'Лицевой счёт' },
        { name: 'Электроэнергия', field: 'account', hint: 'Лицевой счёт' },
        { name: 'Газоснабжение', field: 'account', hint: 'Лицевой счёт' },
    ] },
    { id: 'erip', name: 'Платежи ЕРИП', sub: 'Поиск по всему дереву ЕРИП', icon: ReceiptIcon, cat: 'shops', adultsOnly: true, providers: [
        { name: 'Штрафы ГАИ', field: 'account', hint: 'Номер постановления' },
        { name: 'Налоги', field: 'account', hint: 'УНП или личный номер' },
    ] },
];

const FAVS = [
    { title: 'МТС · +375 29 ***-45-12', cat: 'mobile', provider: 'МТС', value: '+375 (29) 123-45-12' },
    { title: 'Квартплата', cat: 'housing', provider: 'Квартплата (ЖКУ)', value: '0412358' },
];

const fmtPhone = (v: string) => {
    let d = v.replace(/\D/g, '');
    if (!d.startsWith('375')) d = '375' + d.replace(/^375?/, '');
    d = d.slice(0, 12);
    const p = [d.slice(3, 5), d.slice(5, 8), d.slice(8, 10), d.slice(10, 12)];
    let out = '+375';
    if (p[0]) out += ` (${p[0]}`;
    if (p[0].length === 2) out += ')';
    if (p[1]) out += ` ${p[1]}`;
    if (p[2]) out += `-${p[2]}`;
    if (p[3]) out += `-${p[3]}`;
    return out;
};

/** Оплата как в приложении МТБанка: поиск, избранные, категории ЕРИП, QR; для детей — лимиты и запреты родителя */
export function Pay() {
    const { s, nav, move, flash } = useStore();
    const child = s.role === 'parent' ? null : s.role;
    const ctl = child ? s.controls[child] : null;
    const [q, setQ] = useState('');
    const [cat, setCat] = useState<Category | null>(null);
    const [prov, setProv] = useState<Provider | null>(null);
    const [value, setValue] = useState('');
    const [amount, setAmount] = useState('');
    const [from, setFrom] = useState(0);
    const [qr, setQr] = useState<'scan' | 'found' | null>(null);
    const [done, setDone] = useState<null | 'ok' | 'pending'>(null);
    const t = useRef<ReturnType<typeof setTimeout>>(undefined);
    useEffect(() => () => clearTimeout(t.current), []);

    const card = cardsOf(s, s.role)[from];
    const amt = qr === 'found' ? 4.5 : parseAmount(amount);
    const leftToday = ctl ? Math.max(0, ctl.day - s.spentToday[child!]) : Infinity;
    const needOk = !!ctl && amt > ctl.approve;
    const cats = CATS.filter((c) => (child ? c.kids : true));
    const ql = q.trim().toLowerCase();
    const found = ql
        ? cats.flatMap((c) => c.providers.filter((p) => p.name.toLowerCase().includes(ql) || c.name.toLowerCase().includes(ql)).map((p) => ({ c, p })))
        : [];
    const locked = (c: Category) => !!ctl && ctl.cats[c.cat] === false;

    let warn = '';
    if (ctl?.blocked) warn = 'Карта заблокирована мамой';
    else if (amt > card.bal) warn = 'Недостаточно средств на карте';
    else if (ctl && amt > leftToday) warn = `Превышен дневной лимит: можно ещё ${money(leftToday)} BYN`;
    else if (needOk) warn = `Больше ${ctl!.approve} BYN — оплату подтвердит мама`;
    const valueOk = prov?.field === 'phone' ? value.replace(/\D/g, '').length === 12 : value.trim().length >= 3;
    const ready = (qr === 'found' || (prov && valueOk)) && amt > 0 && amt <= card.bal && !ctl?.blocked && !(ctl && amt > leftToday);

    const title = qr === 'found' ? 'Cofix · Минск, пр. Независимости' : prov ? prov.name : '';
    const pay = () => {
        if (needOk) move(card.key, -amt, title, 'ждёт подтверждения мамы', 'pending');
        else move(card.key, -amt, title, qr === 'found' ? 'оплата по QR' : value);
        setDone(needOk ? 'pending' : 'ok');
    };

    const open = (c: Category, p?: Provider, v = '') => {
        if (locked(c)) {
            flash('Эту категорию мама запретила в «Контроле»');
            return;
        }
        setCat(c);
        setProv(p ?? null);
        setValue(v);
        setAmount('');
    };

    if (done)
        return (
            <div className="scr">
                <TopBar title="Оплатить" />
                <Done
                    title={done === 'pending' ? 'Ждём подтверждения мамы' : 'Оплачено'}
                    amount={money(amt)}
                    rows={[
                        ['Получатель', title],
                        ...(qr === 'found' ? [] : ([[prov?.field === 'phone' ? 'Телефон' : 'Счёт', value]] as [string, string][])),
                        ['С карты', `${card.name.replace('MCBE ', '')} ${card.mask}`],
                        ['Комиссия', '0,00 BYN'],
                    ]}
                >
                    <button
                        className="btn block"
                        onClick={() => {
                            nav.back();
                            flash(done === 'pending' ? 'Запрос отправлен маме' : `Оплачено ${money(amt)} BYN`);
                        }}
                    >
                        Готово
                    </button>
                </Done>
            </div>
        );

    if (qr)
        return (
            <div className="scr">
                <TopBar title="Оплата по QR" onBack={() => setQr(null)} />
                {qr === 'scan' ? (
                    <div className="stack" style={{ alignItems: 'center', gap: 16, padding: '30px 20px' }}>
                        <div style={{ width: 260, height: 260, borderRadius: 28, border: '3px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0E0F13' }}>
                            <QrCodeIcon size={120} color="#3A3D4A" />
                        </div>
                        <div className="small" style={{ textAlign: 'center' }}>
                            Наведите камеру на QR-код на кассе
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="card" style={{ margin: '10px 20px 0' }}>
                            <div className="tiny">Получатель</div>
                            <b style={{ fontSize: 17 }}>{title}</b>
                            <div className="tiny" style={{ marginTop: 10 }}>
                                Сумма к оплате
                            </div>
                            <b style={{ fontSize: 28 }}>4,50 BYN</b>
                        </div>
                        <span className="label pad" style={{ paddingTop: 18 }}>
                            С карты
                        </span>
                        <CardCarousel value={from} onChange={setFrom} label="С карты" />
                        {warn && (
                            <div className="pad small" style={{ color: 'var(--warn)', marginTop: 10 }}>
                                {warn}
                            </div>
                        )}
                        <div style={{ padding: '24px 16px', marginTop: 'auto' }}>
                            <Swipe text={'Проведите пальцем\nдля оплаты'} disabled={!ready} onDone={pay} />
                        </div>
                    </>
                )}
            </div>
        );

    if (cat && prov)
        return (
            <div className="scr">
                <TopBar title={prov.name} onBack={() => setProv(null)} />
                <span className="label pad">С карты</span>
                <CardCarousel value={from} onChange={setFrom} label="С карты" />
                <label className="stack pad" style={{ gap: 10, paddingTop: 22 }}>
                    <span className="label">{prov.hint}</span>
                    <input
                        className="field"
                        inputMode={prov.field === 'phone' ? 'tel' : 'text'}
                        placeholder={prov.field === 'phone' ? '+375 (__) ___-__-__' : prov.hint}
                        value={value}
                        onChange={(e) => setValue(prov.field === 'phone' ? fmtPhone(e.target.value) : e.target.value.slice(0, 24))}
                    />
                </label>
                <label className="stack pad" style={{ gap: 10, paddingTop: 18 }}>
                    <span className="label">Сумма, BYN</span>
                    <input className="field" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(cleanAmount(e.target.value))} />
                </label>
                <div className="pills pad" style={{ paddingTop: 12 }}>
                    {[5, 10, 20].map((v) => (
                        <button key={v} className="pill" aria-pressed={amt === v} onClick={() => setAmount(String(v))}>
                            {v} BYN
                        </button>
                    ))}
                </div>
                {warn && (
                    <div className="pad small" style={{ color: 'var(--warn)', marginTop: 12 }}>
                        {warn}
                    </div>
                )}
                <div className="pad" style={{ paddingTop: 16, fontSize: 17 }}>
                    Комиссия: 0,00 BYN
                </div>
                <div style={{ padding: '24px 16px', marginTop: 'auto' }}>
                    <Swipe text={'Проведите пальцем\nдля оплаты'} disabled={!ready} onDone={pay} />
                </div>
            </div>
        );

    if (cat)
        return (
            <div className="scr">
                <TopBar title={cat.name} onBack={() => setCat(null)} />
                <div className="list" style={{ margin: '4px 20px 0' }}>
                    {cat.providers.map((p) => (
                        <button key={p.name} className="li" onClick={() => open(cat, p)}>
                            <span className="tile">
                                <cat.icon size={20} />
                            </span>
                            <span className="grow">
                                <b>{p.name}</b>
                                <span className="sub">{p.hint}</span>
                            </span>
                            <CaretRightIcon size={18} className="caret" />
                        </button>
                    ))}
                </div>
            </div>
        );

    return (
        <div className="scr">
            <TopBar title="Платежи" />
            <div className="pad">
                <label className="row" style={{ gap: 10, height: 48, borderRadius: 24, background: 'var(--surface)', padding: '0 16px' }}>
                    <MagnifyingGlassIcon size={20} color="var(--muted)" />
                    <span className="sr-only">Поиск услуги</span>
                    <input
                        placeholder="Поиск услуги"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        style={{ flex: 1, background: 'none', border: 0, outline: 'none', color: '#fff', fontSize: 16 }}
                    />
                </label>
            </div>

            {ql ? (
                <div className="list" style={{ margin: '14px 20px 0' }}>
                    {found.length === 0 && <div className="li small">Ничего не нашли. Попробуйте «МТС» или «проезд».</div>}
                    {found.map(({ c, p }) => (
                        <button key={p.name} className="li" onClick={() => open(c, p)}>
                            <span className="tile">
                                <c.icon size={20} />
                            </span>
                            <span className="grow">
                                <b>{p.name}</b>
                                <span className="sub">{c.name}</span>
                            </span>
                            <CaretRightIcon size={18} className="caret" />
                        </button>
                    ))}
                </div>
            ) : (
                <>
                    <div className="pad" style={{ paddingTop: 14 }}>
                        <button
                            className="btn block"
                            onClick={() => {
                                setQr('scan');
                                t.current = setTimeout(() => setQr('found'), 1400);
                            }}
                        >
                            <QrCodeIcon size={22} />
                            Оплатить по QR-коду
                        </button>
                    </div>
                    {!child && (
                        <>
                            <span className="label pad" style={{ paddingTop: 22, paddingBottom: 10 }}>
                                Избранные платежи
                            </span>
                            <div className="row" style={{ gap: 10, padding: '0 20px', overflowX: 'auto', flex: 'none' }}>
                                {FAVS.map((f) => {
                                    const c = CATS.find((x) => x.id === f.cat)!;
                                    return (
                                        <button
                                            key={f.title}
                                            className="card stack"
                                            style={{ flex: 'none', width: 170, gap: 8, textAlign: 'left' }}
                                            onClick={() => open(c, c.providers.find((p) => p.name === f.provider), f.value)}
                                        >
                                            <span className="tile">
                                                <c.icon size={20} />
                                            </span>
                                            <b style={{ fontSize: 14 }}>{f.title}</b>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                    <span className="label pad" style={{ paddingTop: 22, paddingBottom: 10 }}>
                        {child ? 'Что можно оплатить' : 'Категории'}
                    </span>
                    <div className="list" style={{ margin: '0 20px 24px' }}>
                        {cats.map((c) => (
                            <button key={c.id} className="li" onClick={() => open(c)}>
                                <span className="tile">
                                    <c.icon size={20} />
                                </span>
                                <span className="grow">
                                    <b>{c.name}</b>
                                    <span className="sub">{locked(c) ? 'Запрещено мамой в «Контроле»' : c.sub}</span>
                                </span>
                                {locked(c) ? <LockSimpleIcon size={18} color="var(--muted)" /> : <CaretRightIcon size={18} className="caret" />}
                            </button>
                        ))}
                    </div>
                    {ctl && (
                        <div className="pad small" style={{ paddingBottom: 24 }}>
                            Сегодня можно потратить ещё {money(leftToday)} BYN. Покупки дороже {ctl.approve} BYN подтверждает мама.
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
