import { useState } from 'react';
import { BankIcon, CaretRightIcon, CopyIcon, CreditCardIcon, HandHeartIcon, MoneyIcon, type Icon } from '@phosphor-icons/react';
import { money, useStore } from '../store';
import { CardCarousel, cardsOf } from '../ui/cards';
import { Done, Swipe, TopBar, cleanAmount, fmtCard, parseAmount } from '../ui/kit';

type Method = 'card' | 'cash' | 'erip';

/** Пополнение как в приложении МТБанка: куда → способ → данные карты → сумма → свайп */
export function Topup() {
    const { s, nav, move, flash } = useStore();
    const child = s.role !== 'parent';
    const [to, setTo] = useState(0);
    const [method, setMethod] = useState<Method | null>(null);
    const [cardNo, setCardNo] = useState('');
    const [exp, setExp] = useState('');
    const [cvc, setCvc] = useState('');
    const [amount, setAmount] = useState('');
    const [done, setDone] = useState(false);
    const card = cardsOf(s, s.role)[to];
    const amt = parseAmount(amount);
    const fee = amt > 0 ? Math.round(amt * 1.5) / 100 : 0;
    const ready = cardNo.replace(/\D/g, '').length === 16 && /^\d{2}\/\d{2}$/.test(exp) && cvc.length === 3 && amt > 0;

    const methods: [Method | 'ask', string, string, Icon][] = [
        ...(child ? [['ask', 'Попросить у мамы', 'Мама получит пуш и переведёт', HandHeartIcon] as [Method | 'ask', string, string, Icon]] : []),
        ['card', 'С карты другого банка', 'Visa, Mastercard, Белкарт', CreditCardIcon],
        ['cash', 'Наличными', 'В банкомате или инфокиоске МТБанка', MoneyIcon],
        ['erip', 'Через ЕРИП', 'В любом банке или на почте', BankIcon],
    ];

    if (done)
        return (
            <div className="scr">
                <TopBar title="Пополнить" />
                <Done
                    title="Карта пополнена"
                    amount={money(amt)}
                    rows={[
                        ['Куда', `${card.name.replace('MCBE ', '')} ${card.mask}`],
                        ['Откуда', `Карта •• ${cardNo.replace(/\D/g, '').slice(-4)}`],
                        ['Комиссия', `${money(fee)} BYN`],
                    ]}
                >
                    <button
                        className="btn block"
                        onClick={() => {
                            nav.back();
                            flash(`Пополнено на ${money(amt)} BYN`);
                        }}
                    >
                        Готово
                    </button>
                </Done>
            </div>
        );

    if (method === 'card')
        return (
            <div className="scr">
                <TopBar title="С карты другого банка" onBack={() => setMethod(null)} />
                <span className="label pad">Куда</span>
                <CardCarousel value={to} onChange={setTo} label="Куда" />
                <span className="label pad" style={{ paddingTop: 22 }}>
                    Откуда
                </span>
                <div style={{ margin: '10px 20px 0', background: 'var(--surface)', borderRadius: 18, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <label>
                        <span className="sr-only">Номер карты</span>
                        <input className="field center" inputMode="numeric" autoComplete="cc-number" placeholder="XXXX XXXX XXXX XXXX" value={cardNo} onChange={(e) => setCardNo(fmtCard(e.target.value))} />
                    </label>
                    <div className="row" style={{ gap: 10 }}>
                        <label className="grow">
                            <span className="sr-only">Срок действия</span>
                            <input
                                className="field center"
                                inputMode="numeric"
                                autoComplete="cc-exp"
                                placeholder="ММ/ГГ"
                                value={exp}
                                onChange={(e) => {
                                    const d = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    setExp(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                                }}
                            />
                        </label>
                        <label className="grow">
                            <span className="sr-only">CVC-код</span>
                            <input
                                className="field center"
                                type="password"
                                inputMode="numeric"
                                autoComplete="cc-csc"
                                placeholder="CVC"
                                value={cvc}
                                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                            />
                        </label>
                    </div>
                </div>
                <label className="stack pad" style={{ gap: 10, paddingTop: 20 }}>
                    <span className="label">Сумма, BYN</span>
                    <input className="field" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(cleanAmount(e.target.value))} />
                </label>
                <div className="pad" style={{ paddingTop: 18, fontSize: 17 }}>
                    Комиссия: {money(fee)} BYN
                </div>
                <div className="pad small" style={{ paddingTop: 6 }}>
                    Данные карты защищены 3-D Secure. [Комиссия — по тарифу банка]
                </div>
                <div style={{ padding: '24px 16px', marginTop: 'auto' }}>
                    <Swipe
                        text={'Проведите пальцем\nдля пополнения'}
                        disabled={!ready}
                        onDone={() => {
                            move(card.key, amt, 'Пополнение с карты', `другой банк •• ${cardNo.replace(/\D/g, '').slice(-4)}`);
                            setDone(true);
                        }}
                    />
                </div>
            </div>
        );

    if (method === 'cash' || method === 'erip')
        return (
            <div className="scr">
                <TopBar title={method === 'cash' ? 'Наличными' : 'Через ЕРИП'} onBack={() => setMethod(null)} />
                <CardCarousel value={to} onChange={setTo} label="Куда" />
                <div className="stack pad" style={{ gap: 12, paddingTop: 20 }}>
                    <div className="card stack" style={{ gap: 12 }}>
                        {(method === 'cash'
                            ? ['Найдите банкомат или инфокиоск МТБанка в разделе «Банк на карте»', 'Вставьте карту или приложите телефон', 'Выберите «Пополнение карты» и внесите наличные', 'Деньги зачислятся сразу']
                            : ['Откройте ЕРИП в любом банке или на почте', 'Банковские, финансовые услуги → Банки, НКФО → МТБанк', 'Пополнение счёта по номеру карты', 'Введите номер карты и сумму']
                        ).map((t, i) => (
                            <div key={t} className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
                                <span className="tile" style={{ width: 28, height: 28, borderRadius: 14, fontSize: 13 }}>
                                    {i + 1}
                                </span>
                                <span style={{ fontSize: 15, lineHeight: 1.45, paddingTop: 3 }}>{t}</span>
                            </div>
                        ))}
                    </div>
                    <button
                        className="btn ghost block"
                        onClick={() => {
                            try {
                                void navigator.clipboard?.writeText(card.mask);
                            } catch {
                                // буфер обмена недоступен
                            }
                            flash('Номер карты скопирован');
                        }}
                    >
                        <CopyIcon size={20} />
                        Скопировать номер карты
                    </button>
                </div>
            </div>
        );

    return (
        <div className="scr">
            <TopBar title="Пополнить" />
            <span className="label pad">Куда</span>
            <CardCarousel value={to} onChange={setTo} label="Куда" />
            <span className="label pad" style={{ paddingTop: 22, paddingBottom: 10 }}>
                Способ
            </span>
            <div className="list" style={{ margin: '0 20px' }}>
                {methods.map(([id, title, sub, Ico]) => (
                    <button key={id} className="li" onClick={() => (id === 'ask' ? nav.sheet({ kind: 'ask' }) : setMethod(id))}>
                        <span className="tile">
                            <Ico size={22} />
                        </span>
                        <span className="grow">
                            <b>{title}</b>
                            <span className="sub">{sub}</span>
                        </span>
                        <CaretRightIcon size={18} className="caret" />
                    </button>
                ))}
            </div>
        </div>
    );
}
