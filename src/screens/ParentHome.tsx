import {
    ArrowsLeftRightIcon,
    BankIcon,
    CaretRightIcon,
    CheckSquareIcon,
    TrayArrowDownIcon,
    UserIcon,
    WalletIcon,
} from '@phosphor-icons/react';
import { KIDS, money, useStore, type Child } from '../store';
import { TabBar } from '../ui/kit';

const STORIES = [
    { title: 'Семья в Moby', mark: 'М', bg: 'linear-gradient(135deg,#2B63F5,#0B2C9C)', fresh: true },
    { title: 'Карманные деньги', mark: 'Br', bg: 'linear-gradient(135deg,#12B89A,#0B5F8C)', fresh: true },
    { title: 'Кешбэк для детей', mark: '%', bg: 'linear-gradient(135deg,#E8317A,#7A3CF0)', fresh: true },
    { title: 'Обменник Moby', mark: '$', bg: 'linear-gradient(135deg,#3D7BFF,#1A2F8C)', fresh: false },
    { title: 'Манички', mark: 'M', bg: 'linear-gradient(135deg,#1FB7E8,#2B63F5)', fresh: false },
];

/** Главная родителя в Moby: баланс, действия, истории, семья */
export function ParentHome() {
    const { s, nav } = useStore();
    const review = s.tasks.filter((t) => t.st === 'review').length;

    return (
        <div className="scr with-tabs">
            <div className="hero">
                <div className="row" style={{ gap: 12 }}>
                    <div className="avatar">
                        <UserIcon size={22} />
                    </div>
                    <b style={{ fontSize: 18 }}>Анна</b>
                </div>
                <div className="row" style={{ gap: 6, marginTop: 12 }}>
                    <span className="chip">MCBE Prime Line BYN</span>
                    <span className="chip">5*5654</span>
                </div>
                <div className="balance">{money(s.bal.parent)} BYN</div>
                <div className="acts">
                    <button className="act" onClick={() => nav.go({ id: 'topup' })}>
                        <TrayArrowDownIcon size={24} />
                        Пополнить
                    </button>
                    <button className="act" onClick={() => nav.go({ id: 'transfer' })}>
                        <ArrowsLeftRightIcon size={24} />
                        Перевести
                    </button>
                    <button className="act" onClick={() => nav.go({ id: 'pay' })}>
                        <WalletIcon size={24} />
                        Оплатить
                    </button>
                </div>
            </div>

            <div className="row" style={{ gap: 12, padding: '16px 20px 4px', overflowX: 'auto', flex: 'none' }}>
                {STORIES.map((st) => (
                    <button
                        key={st.title}
                        onClick={() => nav.go({ id: 'story' })}
                        className="stack"
                        style={{ width: 72, flex: 'none', alignItems: 'center', gap: 6 }}
                    >
                        <span
                            style={{
                                width: 68,
                                height: 68,
                                borderRadius: 22,
                                padding: 3,
                                background: st.fresh ? 'linear-gradient(135deg,#3D7BFF,#E8317A)' : '#3A3D4A',
                            }}
                        >
                            <span
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 19,
                                    border: '3px solid var(--bg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 22,
                                    fontWeight: 800,
                                    background: st.bg,
                                }}
                            >
                                {st.mark}
                            </span>
                        </span>
                        <span style={{ fontSize: 11, lineHeight: 1.25, textAlign: 'center', color: 'var(--muted-2)' }}>
                            {st.title}
                        </span>
                    </button>
                ))}
            </div>

            <div className="stack pad" style={{ gap: 10, paddingTop: 10 }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                    <h2 className="h2">Семья</h2>
                    <button style={{ color: 'var(--link)', fontSize: 14, fontWeight: 600 }} onClick={() => nav.go({ id: 'reg', step: 1 })}>
                        + Добавить ребёнка
                    </button>
                </div>
                <div className="list">
                    {(['kid', 'teen'] as Child[]).map((c) => (
                        <button key={c} className="li" onClick={() => nav.go({ id: 'childCard', child: c })}>
                            <span
                                style={{
                                    width: 52,
                                    height: 34,
                                    borderRadius: 6,
                                    flex: 'none',
                                    background:
                                        c === 'kid'
                                            ? 'linear-gradient(135deg,#2B63F5,#7A3CF0)'
                                            : 'linear-gradient(135deg,#3A3D4A,#111216)',
                                }}
                            />
                            <span className="grow">
                                <b>
                                    {KIDS[c].name}, {c === 'kid' ? '11 лет' : '15 лет'}
                                </b>
                                <span className="sub">
                                    {KIDS[c].card} {KIDS[c].mask}
                                    {s.controls[c].blocked ? ' · заблокирована' : ` · лимит ${s.controls[c].day} BYN/⁠день`}
                                </span>
                            </span>
                            <b>{money(s.bal[c])}</b>
                        </button>
                    ))}
                </div>
                {s.request && (
                    <div className="row" style={{ gap: 10, background: 'var(--accent-soft)', borderRadius: 14, padding: '6px 6px 6px 14px' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF9F2E', flex: 'none' }} />
                        <span className="grow" style={{ fontSize: 13, color: '#DCE5FF' }}>
                            Тимофей просит 15 BYN на «Кино с друзьями»
                        </span>
                        <button className="btn small" onClick={() => nav.sheet({ kind: 'reply' })}>
                            Ответить
                        </button>
                    </div>
                )}
                <div className="list">
                    <button className="li" onClick={() => nav.go({ id: 'family' })}>
                        <span className="ring-ico">
                            <CheckSquareIcon size={22} />
                        </span>
                        <span className="grow">
                            <b>Задания и награды</b>
                            <span className="sub">
                                {review ? `${review} ждёт проверки · ` : ''}оплата за оценки
                            </span>
                        </span>
                        <CaretRightIcon size={18} className="caret" />
                    </button>
                    <button className="li" onClick={() => nav.go({ id: 'deposits' })}>
                        <span className="ring-ico">
                            <BankIcon size={22} />
                        </span>
                        <span className="grow">
                            <b>Вклады и цели</b>
                            <span className="sub">Семейный вклад · цели детей</span>
                        </span>
                        <b>{money(s.deposit)}</b>
                    </button>
                </div>
            </div>
            <TabBar active="home" />
        </div>
    );
}
