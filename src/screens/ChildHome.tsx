import {
    ArrowsLeftRightIcon,
    BroomIcon,
    BuildingsIcon,
    CaretRightIcon,
    CheckSquareIcon,
    DropIcon,
    HandHeartIcon,
    PiggyBankIcon,
    PercentIcon,
    StarIcon,
    TrashIcon,
    WalletIcon,
    type Icon,
} from '@phosphor-icons/react';
import { KIDS, TIERS, money, tierOf, useStore } from '../store';
import { TabBar } from '../ui/kit';

const TASK_ICONS: Record<string, Icon> = { 'Помыть пол': DropIcon, 'Пропылесосить в квартире': BroomIcon, 'Вынести мусор': TrashIcon };

function Banner({ sub }: { sub: string }) {
    const { nav } = useStore();
    return (
        <button className="banner" onClick={() => nav.go({ id: 'game' })} aria-label="Открыть игру Moby">
            <span className="tile">
                <BuildingsIcon size={28} weight="duotone" />
            </span>
            <span className="grow">
                <span style={{ display: 'block', fontSize: 17, fontWeight: 800, letterSpacing: 0.5 }} className="display">
                    MOBY
                </span>
                <span style={{ display: 'block', fontSize: 13, color: '#DCD3F5', marginTop: 2 }}>{sub}</span>
            </span>
            <CaretRightIcon size={22} />
        </button>
    );
}

/** Приложение ребёнка 7–13: MTcoin, задания от мамы, копилка, вход в игру */
export function KidHome() {
    const { s, set, nav, flash } = useStore();
    const c = s.controls.kid;
    const left = Math.max(0, c.day - s.spentToday.kid);
    const tasks = s.tasks.filter((t) => t.who === 'kid');
    const kop = s.kop.kid;

    return (
        <div className="scr with-tabs">
            <div className="hero">
                <div className="row" style={{ gap: 12 }}>
                    <div className="avatar">Т</div>
                    <div className="grow">
                        <b style={{ fontSize: 18 }}>Тимофей</b>
                        <div className="tiny" style={{ color: '#DCE5FF' }}>
                            Moby Kids · {KIDS.kid.mask}
                            {c.blocked ? ' · заблокирована' : ''}
                        </div>
                    </div>
                    <button className="hero-pill" style={{ color: 'var(--yellow)' }} onClick={() => nav.go({ id: 'game' })}>
                        <StarIcon size={16} weight="fill" />
                        {s.coins} MTcoin
                    </button>
                </div>
                <div className="balance">{money(s.bal.kid)} BYN</div>
                <div className="small" style={{ color: '#DCE5FF' }}>
                    Сегодня можно ещё {money(left)} из {c.day} BYN
                </div>
                <div className="acts">
                    <button className="act" onClick={() => nav.sheet({ kind: 'ask' })}>
                        <HandHeartIcon size={24} />
                        Попросить
                    </button>
                    <button className="act" onClick={() => nav.go({ id: 'kopilka' })}>
                        <PiggyBankIcon size={24} />В копилку
                    </button>
                    <button className="act" onClick={() => nav.go({ id: 'pay' })}>
                        <WalletIcon size={24} />
                        Оплатить
                    </button>
                </div>
            </div>

            <div className="stack pad" style={{ gap: 12, paddingTop: 14 }}>
                <Banner sub="Квесты недели 2 из 5" />
                <div className="row" style={{ justifyContent: 'space-between', marginTop: 4 }}>
                    <h2 className="h2">Задания от мамы</h2>
                    <button style={{ color: 'var(--link)', fontWeight: 600, fontSize: 14 }} onClick={() => nav.go({ id: 'game' })}>
                        Все в игре
                    </button>
                </div>
                <div className="list">
                    {tasks.map((t) => {
                        const Ico = TASK_ICONS[t.title] ?? CheckSquareIcon;
                        return (
                            <div key={t.id} className="li">
                                <span className="tile" style={{ color: t.st === 'paid' ? '#6C6F7C' : undefined }}>
                                    <Ico size={20} />
                                </span>
                                <span className="grow">
                                    <b style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</b>
                                    <span className="sub pos">
                                        +{money(t.amt)} BYN · +{Math.round(t.amt * 10)} MTcoin
                                    </span>
                                </span>
                                {t.st === 'open' && (
                                    <button
                                        className="btn small"
                                        onClick={() => {
                                            set((p) => ({ tasks: p.tasks.map((x) => (x.id === t.id ? { ...x, st: 'review' } : x)) }));
                                            flash('Отправлено маме на проверку');
                                        }}
                                    >
                                        Готово
                                    </button>
                                )}
                                {t.st === 'review' && <span className="badge warn">На проверке</span>}
                                {t.st === 'paid' && <span className="badge ok">Оплачено</span>}
                            </div>
                        );
                    })}
                </div>
                <button className="card row" style={{ gap: 12, textAlign: 'left' }} onClick={() => nav.go({ id: 'kopilka' })}>
                    <span className="tile" style={{ background: 'linear-gradient(135deg,#3ECF6E,#1D6B3A)', color: '#fff' }}>
                        <PiggyBankIcon size={22} />
                    </span>
                    <span className="grow">
                        <span className="row" style={{ justifyContent: 'space-between' }}>
                            <b>Копилка «{kop.goal}»</b>
                            <span className="tiny">
                                {Math.round(kop.saved)} из {kop.target}
                            </span>
                        </span>
                        <span className="progress" style={{ display: 'block', marginTop: 8, height: 6 }}>
                            <span style={{ display: 'block', height: '100%', width: `${Math.min(100, (kop.saved / kop.target) * 100)}%`, background: 'var(--green-2)' }} />
                        </span>
                    </span>
                </button>
            </div>
            <TabBar active="home" />
        </div>
    );
}

/** Приложение подростка 14–17: кешбэк по уровням карты, вклады, переводы */
export function TeenHome() {
    const { s, nav } = useStore();
    const c = s.controls.teen;
    const i = tierOf(s.teenSpent);
    const cur = TIERS[i];
    const next = TIERS[i + 1];
    const pct = next ? ((s.teenSpent - cur.min) / (next.min - cur.min)) * 100 : 100;
    const newTasks = s.tasks.filter((t) => t.who === 'teen' && t.st === 'open');

    return (
        <div className="scr with-tabs">
            <div className="hero">
                <div className="row" style={{ gap: 12 }}>
                    <div className="avatar">М</div>
                    <div className="grow">
                        <b style={{ fontSize: 18 }}>Марк</b>
                        <div className="tiny" style={{ color: '#DCE5FF' }}>
                            Moby Teen · {KIDS.teen.mask}
                            {c.blocked ? ' · заблокирована' : ''}
                        </div>
                    </div>
                    <span className="hero-pill" style={{ color: 'var(--green-2)' }}>
                        <PercentIcon size={16} weight="bold" />
                        Кешбэк {cur.cb}%
                    </span>
                </div>
                <div className="balance">{money(s.bal.teen)} BYN</div>
                <div className="small" style={{ color: '#DCE5FF' }}>
                    Сегодня можно ещё {money(Math.max(0, c.day - s.spentToday.teen))} из {c.day} BYN
                </div>
                <div className="acts">
                    <button className="act" onClick={() => nav.sheet({ kind: 'ask' })}>
                        <HandHeartIcon size={24} />
                        Попросить
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

            <div className="stack pad" style={{ gap: 12, paddingTop: 14 }}>
                <Banner sub="Квесты и уроки про деньги" />
                <div className="card">
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                        <div>
                            <div className="tiny">Уровень карты</div>
                            <b style={{ fontSize: 17 }}>{cur.n}</b>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div className="tiny">Следующий</div>
                            <b style={{ fontSize: 17, color: 'var(--green-2)' }}>{next ? `${next.n} · ${next.cb}%` : 'Максимум'}</b>
                        </div>
                    </div>
                    <div className="progress" style={{ marginTop: 12 }}>
                        <div style={{ width: `${pct}%`, background: 'var(--green-2)' }} />
                    </div>
                    <div className="small" style={{ marginTop: 8, color: 'var(--muted-2)' }}>
                        {next ? `Потрать картой ещё ${money(next.min - s.teenSpent)} BYN за месяц` : 'У тебя максимальный кешбэк 3%'}
                    </div>
                </div>
                <div className="list">
                    <button className="li" onClick={() => nav.sheet({ kind: 'teenTasks' })}>
                        <span className="tile">
                            <CheckSquareIcon size={20} />
                        </span>
                        <span className="grow">
                            <b>Задания от мамы</b>
                            <span className="sub pos">
                                {newTasks.length ? `${newTasks.length} новое · +${money(newTasks[0].amt)} BYN` : 'Все сделаны'}
                            </span>
                        </span>
                        <CaretRightIcon size={18} className="caret" />
                    </button>
                    <button className="li" onClick={() => nav.go({ id: 'kopilka' })}>
                        <span className="tile" style={{ background: 'linear-gradient(135deg,#3ECF6E,#1D6B3A)', color: '#fff' }}>
                            <PiggyBankIcon size={20} />
                        </span>
                        <span className="grow">
                            <b>Копилка</b>
                            <span className="sub">{money(s.kop.teen.saved)} BYN · 8% годовых</span>
                        </span>
                        <CaretRightIcon size={18} className="caret" />
                    </button>
                    <button className="li" onClick={() => nav.go({ id: 'deposits' })}>
                        <span className="tile" style={{ background: 'linear-gradient(135deg,#FF9A3D,#E0218A)', color: '#fff' }}>
                            %
                        </span>
                        <span className="grow">
                            <b>Вклады в BYN</b>
                            <span className="sub">С 14 лет открываешь сам · от 3%</span>
                        </span>
                        <CaretRightIcon size={18} className="caret" />
                    </button>
                </div>
            </div>
            <TabBar active="home" />
        </div>
    );
}
