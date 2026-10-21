import { useState } from 'react';
import { CurrencyCircleDollarIcon } from '@phosphor-icons/react';
import { money, useStore } from '../store';
import { TopBar } from '../ui/kit';

/** Вклады и цели: у родителя — семейный вклад, у подростка — свои вклады с 14 лет */
export function Deposits() {
    const { s, nav } = useStore();
    const [tab, setTab] = useState<'dep' | 'goal'>('dep');
    const teen = s.role === 'teen';
    const total = s.deposit + s.kop.kid.saved + s.kop.teen.saved;

    return (
        <div className="scr">
            <TopBar title="Вклады и цели" />
            <div className="pad">
                <div className="tiny">Всего в сбережениях</div>
                <div style={{ fontSize: 32, fontWeight: 800 }}>{money(teen ? s.kop.teen.saved : total)} BYN</div>
                <div className="small pos">+ доход по ставке [X]% годовых</div>
                <div className="row" style={{ gap: 8, marginTop: 16 }}>
                    {(
                        [
                            ['dep', 'Вклады'],
                            ['goal', 'Цели'],
                        ] as const
                    ).map(([id, label]) => (
                        <button key={id} className="pill" aria-pressed={tab === id} onClick={() => setTab(id)} style={{ borderRadius: 20, padding: '0 18px' }}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="stack pad" style={{ gap: 10, paddingTop: 14 }}>
                {tab === 'dep' ? (
                    <>
                        {teen ? (
                            [
                                ['МТБелки Online', 'до 13,2%', 'Безотзывный, до 37 мес. Открываешь сам с 14 лет'],
                                ['Базовый · 3 месяца', '3%', 'Отзывный — можно забрать досрочно'],
                                ['Базовый · 6 месяцев', '4%', 'Отзывный'],
                            ].map(([n, r, sub], i) => (
                                <div key={n} className="card" style={i === 0 ? { background: 'linear-gradient(135deg, #2B63F5, #0B2C9C)' } : undefined}>
                                    <div className="row" style={{ justifyContent: 'space-between' }}>
                                        <b>{n}</b>
                                        <span className="chip">{r} годовых</span>
                                    </div>
                                    <div className="small" style={{ marginTop: 6, color: i === 0 ? '#DCE5FF' : undefined }}>
                                        {sub}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <>
                                <div className="card" style={{ background: 'linear-gradient(135deg, #2B63F5, #0B2C9C)' }}>
                                    <div className="row" style={{ justifyContent: 'space-between' }}>
                                        <b>Семейный вклад</b>
                                        <span className="chip">[X]% годовых</span>
                                    </div>
                                    <div style={{ fontSize: 26, fontWeight: 800, marginTop: 10 }}>{money(s.deposit)} BYN</div>
                                    <div className="small" style={{ color: '#DCE5FF' }}>
                                        Ставка выше на [X]% для участников «Семьи в Moby»
                                    </div>
                                </div>
                                <div className="card row" style={{ gap: 12 }}>
                                    <span className="ring-ico">
                                        <CurrencyCircleDollarIcon size={22} />
                                    </span>
                                    <span className="grow">
                                        <b>Накопительный счёт ребёнка</b>
                                        <div className="tiny">На образование · снятие с вашего согласия</div>
                                    </span>
                                    <b>420,00</b>
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    (['kid', 'teen'] as const)
                        .filter((c) => !teen || c === 'teen')
                        .map((c) => {
                            const k = s.kop[c];
                            return (
                                <button key={c} className="card" style={{ textAlign: 'left' }} onClick={() => nav.go({ id: 'kopilka' })}>
                                    <div className="row" style={{ justifyContent: 'space-between' }}>
                                        <b>{k.goal}</b>
                                        <span className="tiny">{c === 'kid' ? 'Тимофей' : 'Марк'}</span>
                                    </div>
                                    <div style={{ fontSize: 20, fontWeight: 800, marginTop: 8 }}>
                                        {money(k.saved)} <span className="tiny">из {k.target} BYN</span>
                                    </div>
                                    <div className="progress" style={{ marginTop: 10 }}>
                                        <div style={{ width: `${Math.min(100, (k.saved / k.target) * 100)}%` }} />
                                    </div>
                                </button>
                            );
                        })
                )}
            </div>
            <div className="pad" style={{ padding: '20px 20px 24px', marginTop: 'auto' }}>
                <button className="btn block" onClick={() => nav.sheet({ kind: tab === 'dep' ? 'deposit' : 'goal' })}>
                    {tab === 'dep' ? 'Открыть вклад' : 'Новая цель'}
                </button>
            </div>
        </div>
    );
}
