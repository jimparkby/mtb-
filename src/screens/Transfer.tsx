import { useEffect, useRef, useState } from 'react';
import { CameraIcon } from '@phosphor-icons/react';
import { KIDS, money, useStore, type Child } from '../store';
import { CardCarousel, cardsOf } from '../ui/cards';
import { Done, Swipe, TopBar, cleanAmount, fmtCard, parseAmount } from '../ui/kit';

interface Fav {
    name: string;
    initial: string;
    no: string;
    bg: string;
    child?: Child;
}

const OWN_BANK = /^(5310|4255|5313)/;

/** Перевод как в приложении МТБанка: откуда → куда (номер карты) → сумма → свайп */
export function Transfer({ to }: { to?: Child }) {
    const { s, nav, move, set, flash } = useStore();
    const teen = s.role === 'teen';
    const favs: Fav[] = teen
        ? [
              { name: 'Мама', initial: 'А', no: '5313 0811 2245 5654', bg: '#2B63F5' },
              { name: 'Дима', initial: 'Д', no: '4916 1902 7733 1408', bg: '#7A3CF0' },
          ]
        : [
              { name: 'Тимофей', initial: 'Т', no: KIDS.kid.number, bg: '#E8317A', child: 'kid' },
              { name: 'Марк', initial: 'М', no: KIDS.teen.number, bg: '#7A3CF0', child: 'teen' },
              { name: 'Ольга', initial: 'О', no: '4916 3300 8812 7745', bg: '#12B89A' },
          ];

    const [from, setFrom] = useState(0);
    const [cardNo, setCardNo] = useState(to ? KIDS[to].number : '');
    const [amount, setAmount] = useState('');
    const [showFav, setShowFav] = useState(false);
    const [countries, setCountries] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [done, setDone] = useState<null | { pending: boolean }>(null);
    const [saved, setSaved] = useState(false);
    const t = useRef<ReturnType<typeof setTimeout>>(undefined);
    useEffect(() => () => clearTimeout(t.current), []);

    const card = cardsOf(s, s.role)[from];
    const digits = cardNo.replace(/\D/g, '');
    const fav = favs.find((f) => f.no.replace(/\D/g, '') === digits);
    const own = OWN_BANK.test(digits);
    const amt = parseAmount(amount);
    const fee = digits.length === 16 && !own && amt > 0 ? Math.max(1, Math.round(amt) / 100) : 0;
    const limit = s.controls.teen.approve;
    const needOk = teen && amt > limit;
    const eur = card.cur === 'EUR';
    let warn = '';
    if (teen && !s.controls.teen.feats.transfers) warn = 'Переводы друзьям выключены мамой — попроси разрешение';
    else if (amt + fee > card.bal) warn = 'Недостаточно средств на карте';
    else if (needOk) warn = `Перевод больше ${limit} BYN — мама получит запрос на подтверждение`;
    const blocked = teen && (!s.controls.teen.feats.transfers || s.controls.teen.blocked);
    const ready = digits.length === 16 && amt > 0 && amt + fee <= card.bal && !blocked;

    const confirm = () => {
        const sub = `${fav ? fav.name : 'карта'} •• ${digits.slice(-4)}`;
        if (needOk) {
            move(card.key, -amt, 'Перевод', `${sub} · ждёт маму`, 'pending');
        } else {
            move(card.key, -(amt + fee), 'Перевод', sub);
            if (fav?.child && !eur) {
                move(fav.child, amt, 'Перевод от мамы', 'сейчас');
            }
        }
        setDone({ pending: needOk });
    };

    if (done)
        return (
            <div className="scr">
                <TopBar title="Перевести" />
                <Done
                    title={done.pending ? 'Ждём подтверждения мамы' : 'Перевод выполнен'}
                    amount={money(amt)}
                    rows={[
                        ['Откуда', `${card.name.replace('MCBE ', '')} ${card.mask}`],
                        ['Куда', fav ? `${fav.name} · ${digits.slice(-4)}` : `•• ${digits.slice(-4)}`],
                        ['Комиссия', `${money(fee)} ${card.cur}`],
                    ]}
                >
                    <button className="btn ghost block" onClick={() => setSaved(true)}>
                        {saved ? 'Сохранено в избранные ✓' : 'Сохранить в избранные'}
                    </button>
                    <button
                        className="btn block"
                        onClick={() => {
                            nav.back();
                            flash(done.pending ? `Ждём маму · ${money(amt)} BYN` : `Переведено ${money(amt)} ${card.cur}`);
                        }}
                    >
                        Готово
                    </button>
                </Done>
            </div>
        );

    return (
        <div className="scr">
            <TopBar title="Перевести" />
            <div className="row pad" style={{ justifyContent: 'space-between' }}>
                <span className="label">Откуда</span>
                <button
                    aria-expanded={showFav}
                    onClick={() => setShowFav(!showFav)}
                    style={{ height: 34, padding: '0 12px', borderRadius: 17, background: '#22304F', color: 'var(--link)', fontSize: 15, fontWeight: 500 }}
                >
                    Избранные
                </button>
            </div>
            {showFav && (
                <div className="row" style={{ gap: 12, padding: '12px 20px 0', overflowX: 'auto', flex: 'none' }}>
                    {favs.map((f) => (
                        <button
                            key={f.name}
                            className="stack"
                            style={{ width: 72, alignItems: 'center', gap: 6, fontSize: 12, flex: 'none' }}
                            onClick={() => {
                                setCardNo(f.no);
                                setShowFav(false);
                            }}
                        >
                            <span
                                style={{ width: 56, height: 56, borderRadius: '50%', background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800 }}
                            >
                                {f.initial}
                            </span>
                            {f.name}
                        </button>
                    ))}
                </div>
            )}
            <CardCarousel value={from} onChange={setFrom} label="Откуда" />

            <div className="row pad" style={{ justifyContent: 'space-between', paddingTop: 22, paddingBottom: 10 }}>
                <span className="label">Куда</span>
                <button
                    className="icon-btn"
                    aria-label="Сканировать карту камерой"
                    onClick={() => {
                        setScanning(true);
                        t.current = setTimeout(() => {
                            setScanning(false);
                            setCardNo(favs[0].no);
                        }, 1200);
                    }}
                >
                    <CameraIcon size={28} weight="fill" />
                </button>
            </div>
            <div style={{ margin: '0 20px', background: 'var(--surface)', borderRadius: 18, padding: '28px 22px' }}>
                <label>
                    <span className="sr-only">Номер карты получателя</span>
                    <input
                        className="field center"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="XXXX XXXX XXXX XXXX"
                        value={cardNo}
                        onChange={(e) => setCardNo(fmtCard(e.target.value))}
                        style={{ fontSize: 21 }}
                    />
                </label>
                {digits.length === 16 && (
                    <div style={{ marginTop: 12, textAlign: 'center', fontSize: 14, color: 'var(--green)' }}>
                        {fav ? fav.name : own ? 'Карта МТБанка' : 'Карта другого банка'}
                        {own ? ' · без комиссии' : ''}
                    </div>
                )}
                {scanning && <div style={{ marginTop: 12, textAlign: 'center', fontSize: 14, color: 'var(--accent-text)' }}>Наведите камеру на карту…</div>}
            </div>

            <div className="pad" style={{ paddingTop: 24 }}>
                <button className="link-btn" aria-expanded={countries} onClick={() => setCountries(!countries)}>
                    Доступные страны для перевода
                </button>
                {countries && (
                    <div className="small" style={{ marginTop: 8 }}>
                        Беларусь и другие страны по номеру карты Visa и Mastercard. [Точный список — по тарифам банка]
                    </div>
                )}
            </div>

            <label className="stack pad" style={{ gap: 10, paddingTop: 20 }}>
                <span className="label">Сумма, {card.cur}</span>
                <input className="field" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(cleanAmount(e.target.value))} />
            </label>
            {warn && (
                <div className="pad small" style={{ color: 'var(--warn)', marginTop: 10 }}>
                    {warn}
                </div>
            )}
            <div className="pad" style={{ padding: '20px 20px 0', fontSize: 17 }}>
                Комиссия МТБанка: {money(fee)} {card.cur}
            </div>
            <div style={{ padding: '24px 16px 24px', marginTop: 'auto' }}>
                <Swipe text={'Проведите пальцем\nдля совершения перевода'} disabled={!ready} onDone={confirm} />
            </div>
            {blocked && (
                <div className="pad" style={{ paddingBottom: 20 }}>
                    <button
                        className="btn ghost block"
                        onClick={() => {
                            set(() => ({ request: true }));
                            flash('Просьба включить переводы отправлена маме');
                        }}
                    >
                        Попросить разрешение у мамы
                    </button>
                </div>
            )}
        </div>
    );
}
