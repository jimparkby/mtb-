import { useState } from 'react';
import { BuildingsIcon, CaretDownIcon, CaretRightIcon, CheckSquareIcon, CreditCardIcon, SparkleIcon, type Icon } from '@phosphor-icons/react';
import { money, useStore, type Screen } from '../store';
import { Sheet, Stepper } from '../ui/kit';

/** Все шторки поверх экрана: просьбы, меню «Продукты» и «Ещё», задания подростка, договор, вклад и цель */
export function Sheets() {
    const { s } = useStore();
    if (!s.sheet) return null;
    switch (s.sheet.kind) {
        case 'ask':
            return <Ask />;
        case 'reply':
            return <Reply />;
        case 'more':
            return <More />;
        case 'teenTasks':
            return <TeenTasks />;
        case 'doc':
            return <Doc title={s.sheet.title} />;
        case 'deposit':
        case 'goal':
            return <Saving kind={s.sheet.kind} />;
        default:
            return null;
    }
}

function Ask() {
    const { set, nav, flash } = useStore();
    const [amt, setAmt] = useState(10);
    const [why, setWhy] = useState(0);
    const reasons = ['Кино', 'Еда', 'Подарок другу', 'Другое'];
    return (
        <Sheet title="Попросить у мамы">
            <div className="stack" style={{ gap: 6 }}>
                <span className="tiny">На что</span>
                <div className="pills">
                    {reasons.map((r, i) => (
                        <button key={r} className="pill" aria-pressed={why === i} onClick={() => setWhy(i)}>
                            {r}
                        </button>
                    ))}
                </div>
            </div>
            <div className="card row" style={{ justifyContent: 'space-between' }}>
                <span className="muted">Сумма</span>
                <Stepper label="Сумма" value={`${amt} BYN`} onMinus={() => setAmt(Math.max(1, amt - 1))} onPlus={() => setAmt(Math.min(200, amt + 1))} />
            </div>
            <div className="pills">
                {[5, 10, 15, 25].map((v) => (
                    <button key={v} className="pill" aria-pressed={amt === v} onClick={() => setAmt(v)}>
                        {v} BYN
                    </button>
                ))}
            </div>
            <button
                className="btn block"
                onClick={() => {
                    set(() => ({ request: true }));
                    nav.sheet(null);
                    flash(`Мама получила просьбу: ${amt} BYN на «${reasons[why]}»`);
                }}
            >
                Отправить просьбу
            </button>
        </Sheet>
    );
}

function Reply() {
    const { set, nav, move, flash } = useStore();
    return (
        <Sheet title="Просьба Тимофея">
            <div className="small" style={{ fontSize: 15, color: 'var(--muted-2)' }}>
                Тимофей просит <b style={{ color: '#fff' }}>15 BYN</b> на «Кино с друзьями». Деньги придут на карту Moby Kids сразу.
            </div>
            <div className="row" style={{ gap: 8 }}>
                <button
                    className="btn ghost"
                    style={{ flex: 1 }}
                    onClick={() => {
                        set(() => ({ request: false }));
                        nav.sheet(null);
                        flash('Просьба отклонена');
                    }}
                >
                    Отказать
                </button>
                <button
                    className="btn"
                    style={{ flex: 2 }}
                    onClick={() => {
                        move('parent', -15, 'Перевод Тимофею', 'по просьбе · кино');
                        move('kid', 15, 'Перевод от мамы', 'кино с друзьями');
                        set(() => ({ request: false }));
                        nav.sheet(null);
                        flash('Переведено 15,00 BYN Тимофею');
                    }}
                >
                    Перевести 15 BYN
                </button>
            </div>
        </Sheet>
    );
}

function More() {
    const { s, nav } = useStore();
    const [safety, setSafety] = useState(false);
    const row = (label: string, sub: string, screen: Screen, Ico: Icon) => ({ label, sub, screen, Ico });
    const rows =
        s.role === 'parent'
            ? [
                  row('Кабинет семьи', 'Задания, контроль, операции', { id: 'family' }, CheckSquareIcon),
                  row('Истории', 'Что нового в Moby', { id: 'story' }, SparkleIcon),
                  row('Платежи', 'Связь, коммунальные, ЕРИП', { id: 'pay' }, CreditCardIcon),
              ]
            : [row('Игра Moby', 'Квесты недели', { id: 'game' }, BuildingsIcon), row('Платежи', 'Связь, проезд, школа', { id: 'pay' }, CreditCardIcon)];

    return (
        <Sheet title="Ещё">
            <div className="list">
                {rows.map((r) => (
                    <button key={r.label} className="li" onClick={() => nav.go(r.screen)}>
                        <span className="tile">
                            <r.Ico size={20} />
                        </span>
                        <span className="grow">
                            <b>{r.label}</b>
                            <span className="sub">{r.sub}</span>
                        </span>
                        <CaretRightIcon size={18} className="caret" />
                    </button>
                ))}
            </div>
            {(
                <div className="fold" data-open={safety}>
                    <button className="fold-head" aria-expanded={safety} onClick={() => setSafety(!safety)}>
                        <span className="grow" style={{ fontWeight: 700 }}>
                            Потерял карту или звонят «из банка»?
                        </span>
                        <CaretDownIcon size={18} className="fold-caret" />
                    </button>
                    {safety && (
                        <div className="small" style={{ padding: '0 16px 14px', color: 'var(--muted-2)' }}>
                            1. Заблокируйте карту в Moby — деньги останутся на счёте.
                            <br />
                            2. Новая цифровая карта появится сразу.
                            <br />
                            3. Никому не называйте код из SMS — банк его никогда не спрашивает.
                        </div>
                    )}
                </div>
            )}
        </Sheet>
    );
}

function TeenTasks() {
    const { s, set, flash } = useStore();
    const tasks = s.tasks.filter((t) => t.who === 'teen');
    return (
        <Sheet title="Задания от мамы">
            <div className="small">Сделай и нажми «Готово» — мама проверит и переведёт деньги на карту</div>
            <div className="list">
                {tasks.map((t) => (
                    <div key={t.id} className="li">
                        <span className="grow">
                            <b>{t.title}</b>
                            <span className="sub pos">+{money(t.amt)} BYN на карту</span>
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
                ))}
            </div>
        </Sheet>
    );
}

function Doc({ title }: { title: string }) {
    const { nav } = useStore();
    return (
        <Sheet title={title}>
            <div className="stack small" style={{ gap: 10, fontSize: 14, color: 'var(--muted-2)' }}>
                <p style={{ margin: 0 }}>1. Предмет. [Текст договора предоставит банк.]</p>
                <p style={{ margin: 0 }}>2. Карта выпускается к счёту родителя как законного представителя ребёнка. С 14 лет подросток распоряжается своими доходами с согласия родителя.</p>
                <p style={{ margin: 0 }}>3. Родитель устанавливает лимиты и ограничения и может изменить их в любой момент в Moby.</p>
                <p style={{ margin: 0 }}>4. Операции в категориях азартных игр и 18+ по детским картам запрещены.</p>
            </div>
            <button className="btn block" onClick={() => nav.sheet(null)}>
                Понятно
            </button>
        </Sheet>
    );
}

function Saving({ kind }: { kind: 'deposit' | 'goal' }) {
    const { s, set, nav, move, flash } = useStore();
    const who = s.role === 'parent' ? 'parent' : s.role;
    const options = kind === 'deposit' ? ['3 мес · 3%', '6 мес · 4%', '12 мес · до 13,2%'] : ['Телефон', 'Лагерь', 'Наушники', 'Велосипед'];
    const [opt, setOpt] = useState(0);
    const [amt, setAmt] = useState(kind === 'deposit' ? 100 : 300);
    const bal = s.bal[who];
    const tooMuch = kind === 'deposit' && amt > bal;
    return (
        <Sheet title={kind === 'deposit' ? 'Открыть вклад' : 'Новая цель'}>
            <div className="stack" style={{ gap: 6 }}>
                <span className="tiny">{kind === 'deposit' ? 'Срок и ставка' : 'На что копим'}</span>
                <div className="pills">
                    {options.map((o, i) => (
                        <button key={o} className="pill" aria-pressed={opt === i} onClick={() => setOpt(i)}>
                            {o}
                        </button>
                    ))}
                </div>
            </div>
            <div className="card row" style={{ justifyContent: 'space-between' }}>
                <span className="muted">{kind === 'deposit' ? 'Сумма вклада' : 'Сколько нужно'}</span>
                <Stepper label="Сумма" value={`${amt} BYN`} onMinus={() => setAmt(Math.max(10, amt - 10))} onPlus={() => setAmt(Math.min(5000, amt + 10))} />
            </div>
            {tooMuch && <div className="small" style={{ color: 'var(--warn)' }}>На карте только {money(bal)} BYN</div>}
            <button
                className="btn block"
                disabled={tooMuch}
                onClick={() => {
                    if (kind === 'deposit') {
                        move(who, -amt, 'Открытие вклада', options[opt]);
                        if (who === 'parent') set((p) => ({ deposit: p.deposit + amt }));
                        flash(`Вклад открыт · ${amt} BYN`);
                    } else {
                        const c = who === 'parent' ? 'kid' : who;
                        set((p) => ({ kop: { ...p.kop, [c]: { ...p.kop[c], goal: options[opt], target: amt } } }));
                        flash(`Новая цель: ${options[opt]} за ${amt} BYN`);
                    }
                    nav.sheet(null);
                }}
            >
                {kind === 'deposit' ? `Открыть вклад · ${amt} BYN` : 'Создать цель'}
            </button>
        </Sheet>
    );
}
