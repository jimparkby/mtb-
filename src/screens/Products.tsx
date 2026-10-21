import { useState, type ReactNode } from 'react';
import {
    BriefcaseIcon,
    BuildingsIcon,
    CardsIcon,
    CaretDownIcon,
    CaretRightIcon,
    CreditCardIcon,
    PiggyBankIcon,
    PlusSquareIcon,
    VaultIcon,
    WalletIcon,
    type Icon,
} from '@phosphor-icons/react';
import { KIDS, money, useStore, type Child, type Screen } from '../store';
import { CardCarousel, cardsOf } from '../ui/cards';
import { TabBar } from '../ui/kit';

/** Вкладка «Продукты» как в приложении МТБанка: карусель карт, разделы со строками и кнопка «Оформить» */
export function Products() {
    const { s, nav, flash } = useStore();
    const [card, setCard] = useState(0);
    const [cardsOpen, setCardsOpen] = useState(false);
    const role = s.role;

    // Карты и счета: свои карты, у родителя ещё и карты детей
    const accounts: { label: string; sub: string; art: string; to?: Screen }[] = [
        ...cardsOf(s, role).map((c) => ({ label: c.name, sub: `${c.mask} · ${money(c.bal)} ${c.cur}`, art: c.art })),
        ...(role === 'parent'
            ? (['kid', 'teen'] as Child[]).map((c) => ({
                  label: `Карта ${KIDS[c].gen}`,
                  sub: `${KIDS[c].card} ${KIDS[c].mask} · ${money(s.bal[c])} BYN`,
                  art: cardsOf(s, c)[0].art,
                  to: { id: 'childCard', child: c } as Screen,
              }))
            : []),
    ];

    const kop = role === 'parent' ? null : s.kop[role];

    return (
        <div className="scr with-tabs">
            <div style={{ paddingTop: 8 }}>
                <CardCarousel value={card} onChange={setCard} label="Ваши карты" />
            </div>

            <div className="stack" style={{ padding: '18px 20px 0' }}>
                <ProductRow
                    Ico={CardsIcon}
                    title="Карты и счета"
                    sub="Ваши карты и счета"
                    expanded={cardsOpen}
                    onClick={() => setCardsOpen(!cardsOpen)}
                />
                {cardsOpen && (
                    <div className="list" style={{ margin: '0 0 8px 48px' }}>
                        {accounts.map((a) => (
                            <button
                                key={a.label}
                                className="li"
                                style={{ cursor: a.to ? undefined : 'default' }}
                                onClick={() => a.to && nav.go(a.to)}
                            >
                                <span style={{ width: 40, height: 26, borderRadius: 5, background: a.art, flex: 'none', border: '1px solid #3A3D4A' }} />
                                <span className="grow">
                                    <b style={{ fontSize: 14 }}>{a.label}</b>
                                    <span className="sub">{a.sub}</span>
                                </span>
                                {a.to && <CaretRightIcon size={16} className="caret" />}
                            </button>
                        ))}
                    </div>
                )}

                {role === 'parent' && (
                    <>
                        <ProductRow Ico={WalletIcon} title="Кредиты" sub="Ваши кредитные продукты" onClick={() => flash('Кредитных продуктов пока нет')} />
                        <ProductRow Ico={VaultIcon} title="Вклады" sub="Ваши сбережения и вклады" onClick={() => nav.go({ id: 'deposits' })} />
                    </>
                )}
                {kop && (
                    <ProductRow
                        Ico={PiggyBankIcon}
                        title="Копилка"
                        sub={`Цель «${kop.goal}» · ${money(kop.saved)} из ${money(kop.target)} BYN`}
                        onClick={() => nav.go({ id: 'kopilka' })}
                    />
                )}
                {role === 'teen' && <ProductRow Ico={VaultIcon} title="Вклады" sub="С 14 лет открываешь сам" onClick={() => nav.go({ id: 'deposits' })} />}
                {role === 'kid' && <ProductRow Ico={BuildingsIcon} title="Игра Moby" sub="Город, квесты и задания" onClick={() => nav.go({ id: 'game' })} />}

                <div style={{ height: 1, background: 'var(--line)', margin: '10px 0' }} />

                {role === 'parent' ? (
                    <>
                        <ProductRow
                            Ico={BriefcaseIcon}
                            title="Заявки на продукты"
                            sub="Ваши заявки на кредитные и иные продукты банка"
                            onClick={() => flash('Активных заявок нет')}
                        />
                        <ProductRow Ico={CreditCardIcon} title="Семья в Moby" sub="Детская карта, задания и копилка" onClick={() => nav.go({ id: 'story' })} />
                    </>
                ) : (
                    <ProductRow Ico={BriefcaseIcon} title="Попросить у мамы" sub="Деньги на карту или в копилку" onClick={() => nav.sheet({ kind: 'ask' })} />
                )}
            </div>

            {role !== 'kid' && (
                <div style={{ padding: '18px 20px 0', marginTop: 'auto' }}>
                    <button
                        className="row"
                        style={{
                            width: '100%',
                            height: 60,
                            justifyContent: 'center',
                            gap: 10,
                            borderRadius: 22,
                            background: 'var(--surface)',
                            fontSize: 18,
                            fontWeight: 500,
                        }}
                        onClick={() => (role === 'parent' ? nav.go({ id: 'reg', step: 1 }) : nav.sheet({ kind: 'deposit' }))}
                    >
                        <PlusSquareIcon size={26} />
                        <span style={{ textDecoration: 'underline', textUnderlineOffset: 4 }}>Оформить</span>
                    </button>
                </div>
            )}
            <TabBar active="products" />
        </div>
    );
}

function ProductRow({
    Ico,
    title,
    sub,
    onClick,
    expanded,
}: {
    Ico: Icon;
    title: string;
    sub: ReactNode;
    onClick: () => void;
    expanded?: boolean;
}) {
    return (
        <button
            className="row"
            style={{ gap: 16, padding: '12px 0', alignItems: 'flex-start', width: '100%' }}
            aria-expanded={expanded}
            onClick={onClick}
        >
            <Ico size={30} color="var(--accent)" style={{ flex: 'none', marginTop: 2 }} />
            <span className="grow">
                <b style={{ display: 'block', fontSize: 17, fontWeight: 700 }}>{title}</b>
                <span style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginTop: 4, lineHeight: 1.35 }}>{sub}</span>
            </span>
            {expanded !== undefined && (
                <CaretDownIcon
                    size={18}
                    className="caret"
                    style={{ marginTop: 6, transform: expanded ? 'rotate(180deg)' : undefined, transition: 'transform .2s' }}
                />
            )}
        </button>
    );
}
