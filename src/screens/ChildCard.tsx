import type React from 'react';
import { ClockIcon, LockSimpleIcon, PlusIcon, SlidersHorizontalIcon } from '@phosphor-icons/react';
import { KIDS, money, useStore, type Child } from '../store';
import { TopBar } from '../ui/kit';

/** Карта ребёнка глазами родителя: баланс, пополнение, лимиты, блокировка, операции */
export function ChildCard({ child }: { child: Child }) {
    const { s, set, nav, flash } = useStore();
    const k = KIDS[child];
    const c = s.controls[child];
    const ops = s.ops.filter((o) => o.who === child).slice(0, 5);
    const spent = s.spentToday[child];
    const toggleBlock = () => {
        set((p) => ({ controls: { ...p.controls, [child]: { ...p.controls[child], blocked: !c.blocked } } }));
        flash(c.blocked ? 'Карта разблокирована' : `Карта заблокирована. ${k.name} получил уведомление`);
    };

    return (
        <div className="scr">
            <TopBar title={k.name} />
            <div className="pad">
                <div
                    style={{
                        height: 180,
                        borderRadius: 20,
                        padding: 18,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        background: child === 'kid' ? 'linear-gradient(135deg, #2B63F5 0%, #0B2C9C 60%, #7A3CF0 100%)' : 'linear-gradient(135deg, #3A3D4A, #111216)',
                        opacity: c.blocked ? 0.45 : 1,
                    }}
                >
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                        <b>MTbank</b>
                        <span className="tiny" style={{ color: '#fff', fontWeight: 700 }}>
                            {c.blocked ? 'Заблокирована' : 'Активна'}
                        </span>
                    </div>
                    <b style={{ fontSize: 30 }}>{money(s.bal[child])} BYN</b>
                    <span style={{ fontSize: 14 }}>
                        {k.card} {k.mask} · цифровая
                    </span>
                </div>
            </div>

            <div className="pad" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8, marginTop: 14 }}>
                {(
                    [
                    ['Пополнить', <PlusIcon key="p" size={22} />, () => nav.go({ id: 'transfer', to: child })],
                    ['Карманные', <ClockIcon key="c" size={22} />, () => nav.go({ id: 'family', tab: 'control' })],
                    ['Лимиты', <SlidersHorizontalIcon key="l" size={22} />, () => nav.go({ id: 'family', tab: 'control' })],
                    [c.blocked ? 'Разблок.' : 'Блок', <LockSimpleIcon key="b" size={22} />, toggleBlock],
                    ] as [string, React.ReactNode, () => void][]
                ).map(([label, ico, fn], i) => (
                    <button key={label as string} className="stack" style={{ alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted-2)' }} onClick={fn as () => void}>
                        <span
                            style={{
                                width: 52,
                                height: 52,
                                borderRadius: 16,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: i === 3 && c.blocked ? 'var(--red)' : 'var(--surface)',
                                color: i === 3 ? (c.blocked ? '#fff' : '#FF6B76') : 'var(--accent)',
                            }}
                        >
                            {ico}
                        </span>
                        {label as string}
                    </button>
                ))}
            </div>

            <div className="card" style={{ margin: '16px 20px 0' }}>
                <div className="row" style={{ justifyContent: 'space-between', fontSize: 14 }}>
                    <span className="muted">Потрачено сегодня</span>
                    <b>
                        {money(spent)} из {c.day} BYN
                    </b>
                </div>
                <div className="progress" style={{ marginTop: 10 }}>
                    <div style={{ width: `${Math.min(100, (spent / c.day) * 100)}%` }} />
                </div>
                <div className="tiny" style={{ marginTop: 8 }}>
                    Карманные: {c.pocket.amt} BYN {{ day: 'каждый день', week: 'каждую неделю', month: 'каждый месяц' }[c.pocket.period]}
                </div>
            </div>

            <h2 className="h2 pad" style={{ margin: '18px 0 6px' }}>
                Операции
            </h2>
            <div className="list" style={{ margin: '0 20px 24px' }}>
                {ops.map((o) => (
                    <div key={o.id} className="li">
                        <span className="tile" style={{ color: o.status === 'declined' ? '#FF6B9A' : o.amt > 0 ? 'var(--green)' : undefined }}>
                            {o.amt > 0 ? '+' : o.title[0]}
                        </span>
                        <span className="grow">
                            <b>{o.title}</b>
                            <span className="sub" style={{ color: o.status ? '#FF6B9A' : undefined }}>
                                {o.sub}
                            </span>
                        </span>
                        <b style={{ color: o.status === 'declined' ? '#6C6F7C' : o.amt > 0 ? 'var(--green)' : undefined, textDecoration: o.status === 'declined' ? 'line-through' : undefined }}>
                            {o.amt > 0 ? '+' : '−'}
                            {money(Math.abs(o.amt))}
                        </b>
                    </div>
                ))}
            </div>
        </div>
    );
}
