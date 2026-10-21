import { useStore, money, type Role, type State } from '../store';

export type Account = 'parent' | 'parentEur' | 'kid' | 'teen';

export interface CardInfo {
    key: Account;
    owner: Role;
    name: string;
    bal: number;
    cur: string;
    mask: string;
    exp: string;
    brand: 'mastercard' | 'visa';
    art: string;
}

/** Карты, с которых роль может платить или переводить */
export function cardsOf(s: State, role: Role): CardInfo[] {
    if (role === 'kid')
        return [{ key: 'kid', owner: 'kid', name: 'MOBY KIDS', bal: s.bal.kid, cur: 'BYN', mask: '5*0427', exp: '12/29', brand: 'mastercard', art: 'linear-gradient(135deg,#2B63F5,#7A3CF0)' }];
    if (role === 'teen')
        return [{ key: 'teen', owner: 'teen', name: 'MOBY TEEN', bal: s.bal.teen, cur: 'BYN', mask: '4*5521', exp: '12/29', brand: 'visa', art: 'linear-gradient(135deg,#3A3D4A,#111216)' }];
    return [
        { key: 'parent', owner: 'parent', name: 'MCBE PRIME LINE BYN', bal: s.bal.parent, cur: 'BYN', mask: '5*5654', exp: '05/29', brand: 'mastercard', art: 'linear-gradient(135deg,#1A1B21,#3A3D4A)' },
        { key: 'parentEur', owner: 'parent', name: 'MCBE PRIME LINE EUR', bal: s.bal.parentEur, cur: 'EUR', mask: '5*1187', exp: '05/29', brand: 'mastercard', art: 'linear-gradient(135deg,#1A1B21,#3A3D4A)' },
    ];
}

/** Карусель карт «Откуда / Куда» как в приложении МТБанка */
export function CardCarousel({ value, onChange, label }: { value: number; onChange: (i: number) => void; label: string }) {
    const { s } = useStore();
    const cards = cardsOf(s, s.role);
    return (
        <div>
            <div
                role="radiogroup"
                aria-label={label}
                className="row"
                style={{ gap: 12, overflowX: 'auto', scrollSnapType: 'x mandatory', padding: '12px 20px 4px', scrollbarWidth: 'none', alignItems: 'stretch' }}
            >
                {cards.map((c, i) => (
                    <button
                        key={c.key}
                        role="radio"
                        aria-checked={value === i}
                        onClick={() => onChange(i)}
                        style={{
                            flex: 'none',
                            width: cards.length > 1 ? 318 : 350,
                            scrollSnapAlign: 'center',
                            padding: '18px 18px 14px',
                            borderRadius: 18,
                            background: 'var(--surface)',
                            border: `1.5px solid ${value === i ? 'var(--accent)' : 'transparent'}`,
                        }}
                    >
                        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.3 }}>{c.name}</span>
                            <span style={{ width: 96, height: 60, borderRadius: 6, background: c.art }} />
                        </div>
                        <div style={{ fontSize: 30, fontWeight: 600, marginTop: 14 }}>
                            {money(c.bal)} <span style={{ fontWeight: 300 }}>{c.cur}</span>
                        </div>
                        <div
                            className="row"
                            style={{ justifyContent: 'space-between', borderTop: '1px solid #3A3D4A', margin: '14px -18px 0', padding: '12px 18px 0', fontSize: 14, color: 'var(--muted-2)' }}
                        >
                            <span>
                                {c.mask} · {c.exp}
                            </span>
                            <span style={{ fontWeight: 800, fontStyle: 'italic', color: c.brand === 'visa' ? '#4A6CF0' : '#F79E1B' }}>
                                {c.brand === 'visa' ? 'VISA' : 'mastercard'}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
            {cards.length > 1 && (
                <div className="row" style={{ justifyContent: 'center', gap: 6, paddingTop: 10 }} aria-hidden="true">
                    {cards.map((c, i) => (
                        <span key={c.key} style={{ height: 6, width: value === i ? 18 : 6, borderRadius: 3, background: value === i ? 'var(--muted-2)' : '#6C6F7C' }} />
                    ))}
                </div>
            )}
        </div>
    );
}
