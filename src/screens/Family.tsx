import { useState } from 'react';
import {
    CaretLeftIcon,
    CreditCardIcon,
    DropIcon,
    GaugeIcon,
    HandCoinsIcon,
    ListChecksIcon,
    ListIcon,
    PlusCircleIcon,
    ShieldCheckIcon,
    ShoppingCartIcon,
    StudentIcon,
} from '@phosphor-icons/react';
import { KIDS, money, useStore, type Child, type Controls, type FamilyTab } from '../store';
import { Fold, Stepper, Toggle } from '../ui/kit';

const PRESETS = [
    { label: 'Вынести мусор', hint: 'обычно 1–2 BYN', pay: 2 },
    { label: 'Помыть пол', hint: 'обычно 3–5 BYN', pay: 4 },
    { label: 'Пропылесосить', hint: 'обычно 2–4 BYN', pay: 3 },
    { label: 'Своё задание', hint: 'напишите сами', pay: 1 },
];

const CATS: [string, string, string][] = [
    ['food', 'Еда и кафе', 'столовая, кафе, продукты'],
    ['transport', 'Транспорт', 'проезд, такси'],
    ['shops', 'Магазины', 'одежда, канцтовары'],
    ['fun', 'Развлечения', 'кино, парки, кружки'],
    ['games', 'Игры и приложения', 'покупки в играх, подписки'],
];

const FEATS: [string, string, string][] = [
    ['online', 'Покупки в интернете', 'на сайтах и в приложениях'],
    ['cash', 'Снятие наличных', 'в банкоматах МТБанка'],
    ['transfers', 'Переводы друзьям', 'по номеру телефона в Moby'],
];

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Кабинет родителя «Moby Семья»: вкладки Задания / Контроль / Операции со свёрнутыми разделами */
export function Family({ initialTab }: { initialTab?: FamilyTab }) {
    const { s, set, nav, move, flash } = useStore();
    const [tab, setTab] = useState<FamilyTab>(initialTab ?? 'tasks');
    const [kid, setKid] = useState<Child>('kid');
    const [open, setOpen] = useState<string | null>(null);
    const [preset, setPreset] = useState(0);
    const [custom, setCustom] = useState('');
    const [pay, setPay] = useState(2);
    const k = KIDS[kid];
    const c = s.controls[kid];
    const list = s.tasks.filter((t) => t.who === kid);
    const review = list.find((t) => t.st === 'review');
    const fold = (id: string) => ({ open: open === id, onToggle: () => setOpen(open === id ? null : id) });
    const setC = (patch: Partial<Controls>) => set((p) => ({ controls: { ...p.controls, [kid]: { ...p.controls[kid], ...patch } } }));
    const setTask = (id: string, patch: Partial<{ amt: number; st: 'open' | 'review' | 'paid' }>) =>
        set((p) => ({ tasks: p.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));

    const approve = (id: string, amt: number, title: string) => {
        setTask(id, { st: 'paid' });
        move('parent', -amt, `Награда: ${title}`, `${k.name} · задание`);
        move(kid, amt, `Награда за задание`, title);
        if (kid === 'kid') set((p) => ({ coins: p.coins + Math.round(amt * 10) }));
        flash(`Переведено ${money(amt)} BYN ${k.dat}`);
    };

    return (
        <div className="scr">
            <div className="hero" style={{ paddingTop: 4 }}>
                <div className="row" style={{ marginLeft: -12 }}>
                    <button className="icon-btn" style={{ color: '#fff' }} onClick={nav.back} aria-label="Назад">
                        <CaretLeftIcon size={24} weight="bold" />
                    </button>
                    <span className="display grow" style={{ fontSize: 16 }}>
                        Moby Семья
                    </span>
                    <span className="tiny" style={{ color: '#DCE5FF' }}>
                        Кабинет родителя
                    </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, marginTop: 6 }}>
                    {(['kid', 'teen'] as Child[]).map((id) => (
                        <button
                            key={id}
                            aria-pressed={kid === id}
                            onClick={() => {
                                setKid(id);
                                setOpen(null);
                            }}
                            className="row"
                            style={{
                                height: 52,
                                gap: 10,
                                padding: '0 10px',
                                borderRadius: 14,
                                background: kid === id ? 'rgba(255,255,255,.2)' : 'rgba(22,23,28,.3)',
                                border: `1.5px solid ${kid === id ? '#fff' : 'transparent'}`,
                            }}
                        >
                            <span className="avatar" style={{ width: 32, height: 32, borderRadius: 10, fontSize: 14, background: id === 'kid' ? 'var(--pink)' : '#7A3CF0' }}>
                                {KIDS[id].name[0]}
                            </span>
                            <span style={{ textAlign: 'left' }}>
                                <b style={{ display: 'block', fontSize: 15 }}>{KIDS[id].name}</b>
                                <span style={{ fontSize: 11, opacity: 0.8 }}>
                                    {KIDS[id].age} · {KIDS[id].card}
                                </span>
                            </span>
                        </button>
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, marginTop: 8 }}>
                    <div style={{ background: 'rgba(22,23,28,.4)', borderRadius: 14, padding: '10px 12px' }}>
                        <div className="tiny" style={{ color: '#DCE5FF' }}>
                            Ваша карта •• 5654
                        </div>
                        <b style={{ fontSize: 18 }}>{money(s.bal.parent)} BYN</b>
                    </div>
                    <div style={{ background: 'rgba(22,23,28,.4)', borderRadius: 14, padding: '10px 12px' }}>
                        <div className="tiny" style={{ color: '#DCE5FF' }}>
                            {k.card} {k.mask}
                        </div>
                        <b style={{ fontSize: 18 }}>{money(s.bal[kid])} BYN</b>
                    </div>
                </div>
            </div>

            <div className="pad" style={{ paddingTop: 14 }}>
                <div className="tabs">
                    {(
                        [
                            ['tasks', 'Задания'],
                            ['control', 'Контроль'],
                            ['ops', 'Операции'],
                        ] as const
                    ).map(([id, label]) => (
                        <button
                            key={id}
                            aria-pressed={tab === id}
                            onClick={() => {
                                setTab(id);
                                setOpen(null);
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="stack pad" style={{ gap: 10, padding: '16px 20px 28px' }}>
                {tab === 'tasks' && (
                    <>
                        <div className="row" style={{ gap: 8 }}>
                            <span className="display" style={{ fontSize: 17 }}>
                                Ждёт проверки
                            </span>
                            {review && <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--pink)' }} />}
                        </div>
                        {review ? (
                            <div className="stack" style={{ gap: 12, border: '1.5px solid var(--accent)', borderRadius: 18, padding: 14, background: '#1B1D26' }}>
                                <div className="row" style={{ gap: 12 }}>
                                    <DropIcon size={26} color="var(--link)" />
                                    <span className="grow">
                                        <b style={{ fontSize: 16 }}>{review.title}</b>
                                        <div className="tiny">{k.name} нажал «Готово»</div>
                                    </span>
                                    <b style={{ fontSize: 16 }}>{money(review.amt)}</b>
                                </div>
                                <div className="row" style={{ gap: 8 }}>
                                    <button
                                        className="btn ghost"
                                        style={{ flex: 1, minHeight: 46, background: 'var(--surface-2)' }}
                                        onClick={() => {
                                            setTask(review.id, { st: 'open' });
                                            flash(`Задание вернулось ${k.dat}`);
                                        }}
                                    >
                                        Вернуть
                                    </button>
                                    <button className="btn" style={{ flex: 2, minHeight: 46 }} onClick={() => approve(review.id, review.amt, review.title)}>
                                        Принять · {money(review.amt)} BYN
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="small">Нечего проверять. Когда {k.name} нажмёт «Готово», задание появится здесь.</div>
                        )}

                        <Fold title={`Задания: ${k.name}`} icon={<ListIcon size={22} />} {...fold('list')}>
                            {list.map((t) => (
                                <div key={t.id} className="li" style={{ minHeight: 58 }}>
                                    <span className="grow">
                                        <b>{t.title}</b>
                                        <span className="sub" style={{ color: t.st === 'review' ? 'var(--warn)' : t.st === 'paid' ? 'var(--green)' : undefined }}>
                                            {t.st === 'open' ? 'Ждём · оплату можно изменить' : t.st === 'review' ? 'На проверке' : 'Оплачено'}
                                        </span>
                                    </span>
                                    {t.st === 'open' ? (
                                        <Stepper
                                            label="Оплата"
                                            value={money(t.amt)}
                                            onMinus={() => setTask(t.id, { amt: clamp(t.amt - 0.5, 0.5, 20) })}
                                            onPlus={() => setTask(t.id, { amt: clamp(t.amt + 0.5, 0.5, 20) })}
                                        />
                                    ) : (
                                        <b style={{ color: t.st === 'paid' ? 'var(--green)' : undefined }}>{money(t.amt)}</b>
                                    )}
                                </div>
                            ))}
                        </Fold>

                        <Fold title="Новое задание" icon={<PlusCircleIcon size={22} />} {...fold('add')}>
                            <div className="stack" style={{ gap: 10, padding: 14 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
                                    {PRESETS.map((p, i) => (
                                        <button
                                            key={p.label}
                                            className="choice"
                                            aria-pressed={preset === i}
                                            onClick={() => {
                                                setPreset(i);
                                                setPay(p.pay);
                                            }}
                                            style={{ background: preset === i ? undefined : '#1B1D26' }}
                                        >
                                            <b style={{ fontSize: 14, display: 'block' }}>{p.label}</b>
                                            <span className="tiny">{p.hint}</span>
                                        </button>
                                    ))}
                                </div>
                                {preset === 3 && (
                                    <input
                                        className="field"
                                        aria-label="Своё задание"
                                        placeholder="Например: погулять с собакой"
                                        value={custom}
                                        onChange={(e) => setCustom(e.target.value.slice(0, 60))}
                                        style={{ fontSize: 15, height: 48 }}
                                    />
                                )}
                                <div className="row" style={{ justifyContent: 'space-between' }}>
                                    <span>
                                        <b>Оплата</b>
                                        <div className="tiny">{kid === 'kid' ? `+ ${Math.round(pay * 10)} MTcoin в игре` : 'деньги на карту Moby Teen'}</div>
                                    </span>
                                    <Stepper label="Оплата задания" value={money(pay)} onMinus={() => setPay(clamp(pay - 0.5, 0.5, 20))} onPlus={() => setPay(clamp(pay + 0.5, 0.5, 20))} />
                                </div>
                                <button
                                    className="btn"
                                    disabled={preset === 3 && custom.trim().length < 2}
                                    onClick={() => {
                                        const title = preset === 3 ? custom.trim() : PRESETS[preset].label;
                                        set((p) => ({ tasks: [{ id: `t${Date.now()}`, title, amt: pay, who: kid, st: 'open' }, ...p.tasks] }));
                                        setCustom('');
                                        setOpen('list');
                                        flash(`«${title}» отправлено ${k.dat}`);
                                    }}
                                >
                                    Отправить {k.dat} · {money(pay)} BYN
                                </button>
                                <div className="tiny" style={{ textAlign: 'center' }}>
                                    Деньги спишутся, только когда вы примете задание
                                </div>
                            </div>
                        </Fold>

                        <Fold title="Награды за оценки" icon={<StudentIcon size={22} />} {...fold('grades')}>
                            <div className="li">
                                <span className="grow">
                                    <b>Платить за оценки</b>
                                    <span className="sub">из электронного дневника, автоматически</span>
                                </span>
                                <Toggle on={s.gradesOn} label="Платить за оценки" onChange={() => set((p) => ({ gradesOn: !p.gradesOn }))} />
                            </div>
                            {s.gradesOn &&
                                ([10, 9, 8] as const).map((g) => (
                                    <div key={g} className="li">
                                        <span className="tile display" style={{ fontSize: 15 }}>
                                            {g}
                                        </span>
                                        <span className="grow">За оценку {g}</span>
                                        <Stepper
                                            label={`Награда за ${g}`}
                                            value={money(s.grades[g])}
                                            onMinus={() => set((p) => ({ grades: { ...p.grades, [g]: Math.max(0, p.grades[g] - 0.5) } }))}
                                            onPlus={() => set((p) => ({ grades: { ...p.grades, [g]: Math.min(10, p.grades[g] + 0.5) } }))}
                                        />
                                    </div>
                                ))}
                        </Fold>
                    </>
                )}

                {tab === 'control' && (
                    <>
                        <Fold title={`Карта ${k.gen}`} icon={<CreditCardIcon size={22} />} {...fold('card')}>
                            <div className="li">
                                <span className="grow">
                                    <b>
                                        {k.card} {k.mask}
                                    </b>
                                    <span className="sub">Цифровая · {c.blocked ? 'заблокирована' : 'активна'}</span>
                                </span>
                                <button
                                    className="btn small"
                                    style={{ background: c.blocked ? undefined : 'var(--surface-2)' }}
                                    onClick={() => {
                                        setC({ blocked: !c.blocked });
                                        flash(c.blocked ? 'Карта разблокирована' : 'Карта заблокирована');
                                    }}
                                >
                                    {c.blocked ? 'Разблокировать' : 'Заблокировать'}
                                </button>
                            </div>
                        </Fold>
                        <Fold title="Лимиты" icon={<GaugeIcon size={22} />} {...fold('limits')}>
                            {(
                                [
                                    ['day', 'В день', 5, 5, 300],
                                    ['month', 'В месяц', 20, 20, 2000],
                                    ['approve', 'Подтверждать от', 5, 0, 100],
                                ] as const
                            ).map(([key, label, step, lo, hi]) => (
                                <div key={key} className="li">
                                    <b className="grow">{label}</b>
                                    <Stepper
                                        label={label}
                                        value={c[key] ? money(c[key]) : 'не нужно'}
                                        onMinus={() => setC({ [key]: clamp(c[key] - step, lo, hi) })}
                                        onPlus={() => setC({ [key]: clamp(c[key] + step, lo, hi) })}
                                    />
                                </div>
                            ))}
                        </Fold>
                        <Fold title="Категории покупок" icon={<ShoppingCartIcon size={22} />} {...fold('cats')}>
                            {CATS.map(([key, n, h]) => (
                                <div key={key} className="li">
                                    <span className="grow">
                                        <b>{n}</b>
                                        <span className="sub">{h}</span>
                                    </span>
                                    <Toggle on={c.cats[key]} label={n} onChange={() => setC({ cats: { ...c.cats, [key]: !c.cats[key] } })} />
                                </div>
                            ))}
                            <div className="li">
                                <span className="grow">
                                    <b>Азартные игры и 18+</b>
                                    <span className="sub">запрещено для детских карт всегда</span>
                                </span>
                                <Toggle on={false} label="Азартные игры и 18+" locked />
                            </div>
                        </Fold>
                        <Fold title="Что можно делать" icon={<ListChecksIcon size={22} />} {...fold('feats')}>
                            {FEATS.map(([key, n, h]) => (
                                <div key={key} className="li">
                                    <span className="grow">
                                        <b>{n}</b>
                                        <span className="sub">{h}</span>
                                    </span>
                                    <Toggle on={c.feats[key]} label={n} onChange={() => setC({ feats: { ...c.feats, [key]: !c.feats[key] } })} />
                                </div>
                            ))}
                        </Fold>
                        <Fold title="Карманные деньги" icon={<HandCoinsIcon size={22} />} {...fold('pocket')}>
                            <div className="stack" style={{ gap: 10, padding: '12px 16px 14px' }}>
                                <div className="row" style={{ justifyContent: 'space-between' }}>
                                    <span>
                                        <b>
                                            {c.pocket.amt} BYN {{ day: 'каждый день', week: 'каждую неделю', month: 'каждый месяц' }[c.pocket.period]}
                                        </b>
                                        <div className="tiny">Автоперевод с карты •• 5654</div>
                                    </span>
                                    <Stepper
                                        label="Карманные"
                                        value={`${c.pocket.amt}`}
                                        onMinus={() => setC({ pocket: { ...c.pocket, amt: clamp(c.pocket.amt - 1, 1, 100) } })}
                                        onPlus={() => setC({ pocket: { ...c.pocket, amt: clamp(c.pocket.amt + 1, 1, 100) } })}
                                    />
                                </div>
                                <div className="tabs" style={{ background: 'transparent', padding: 0 }}>
                                    {(
                                        [
                                            ['day', 'День'],
                                            ['week', 'Неделя'],
                                            ['month', 'Месяц'],
                                        ] as const
                                    ).map(([id, label]) => (
                                        <button key={id} aria-pressed={c.pocket.period === id} style={{ background: c.pocket.period === id ? undefined : 'var(--surface-2)' }} onClick={() => setC({ pocket: { ...c.pocket, period: id } })}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    className="btn ghost"
                                    style={{ background: 'var(--surface-2)', minHeight: 46 }}
                                    onClick={() => {
                                        move('parent', -c.pocket.amt, 'Карманные деньги', k.name);
                                        move(kid, c.pocket.amt, 'Карманные деньги', 'от мамы');
                                        flash(`Отправлено ${c.pocket.amt} BYN ${k.dat}`);
                                    }}
                                >
                                    Отправить сейчас
                                </button>
                            </div>
                        </Fold>
                        <Fold title="Доступ и защита" icon={<ShieldCheckIcon size={22} />} {...fold('access')}>
                            <div className="li">
                                <span className="grow">
                                    <b>Вход {k.gen} в Moby</b>
                                    <span className="sub">код входа MOBY-4821</span>
                                </span>
                                <Toggle on={c.login} label="Вход в Moby" onChange={() => setC({ login: !c.login })} />
                            </div>
                            <div className="li">
                                <span className="grow">
                                    <b>Страховка ребёнка</b>
                                    <span className="sub">2,00 BYN в месяц · [условия страховки]</span>
                                </span>
                                <Toggle on={c.insurance} label="Страховка ребёнка" onChange={() => setC({ insurance: !c.insurance })} />
                            </div>
                        </Fold>
                    </>
                )}

                {tab === 'ops' && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
                            <div className="card">
                                <div className="tiny">Потрачено сегодня</div>
                                <b style={{ fontSize: 19 }}>{money(s.spentToday[kid])} BYN</b>
                            </div>
                            <div className="card">
                                <div className="tiny">Отклонено покупок</div>
                                <b style={{ fontSize: 19, color: '#FF6B9A' }}>{s.ops.filter((o) => o.who === kid && o.status === 'declined').length}</b>
                            </div>
                        </div>
                        <span className="display" style={{ fontSize: 17, marginTop: 8 }}>
                            Операции
                        </span>
                        <div className="list">
                            {s.ops
                                .filter((o) => o.who === kid)
                                .slice(0, 8)
                                .map((o) => (
                                    <div key={o.id} className="li">
                                        <span className="tile" style={{ color: o.status === 'declined' ? '#FF6B9A' : o.amt > 0 ? 'var(--green)' : undefined, background: o.status === 'declined' ? '#3A1A2A' : undefined }}>
                                            {o.status === 'declined' ? '✕' : o.amt > 0 ? '+' : o.title[0]}
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
                        <div className="tiny">О каждой операции приходит пуш в Moby</div>
                    </>
                )}
            </div>
        </div>
    );
}
