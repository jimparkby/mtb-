import { useState } from 'react';
import { CaretLeftIcon, CheckIcon, IdentificationCardIcon, PiggyBankIcon, ShieldCheckIcon, SparkleIcon, CreditCardIcon, InfoIcon } from '@phosphor-icons/react';
import { useStore } from '../store';
import { Swipe, Toggle, TopBar } from '../ui/kit';

const DESIGNS = [
    { name: 'Космос', bg: 'linear-gradient(135deg, #2B63F5 0%, #0B2C9C 60%, #7A3CF0 100%)' },
    { name: 'Неон', bg: 'linear-gradient(135deg, #E8317A 0%, #7A3CF0 100%)' },
    { name: 'Мята', bg: 'linear-gradient(135deg, #12B89A 0%, #0B5F8C 100%)' },
    { name: 'Графит', bg: 'linear-gradient(135deg, #3A3D4A 0%, #111216 100%)' },
];

function Steps({ n }: { n: number }) {
    return (
        <div className="pad">
            <div className="tiny" style={{ marginBottom: 6 }}>
                Шаг {n} из 4
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 6 }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ height: 4, borderRadius: 2, background: i <= n ? 'var(--accent)' : 'var(--surface-2)' }} />
                ))}
            </div>
        </div>
    );
}

/** Регистрация родителя: пакет → возраст → данные ребёнка → права → цифровая карта → доступ ребёнку */
export function Registration({ step }: { step: number }) {
    const { s, set, nav, flash } = useStore();
    const [age, setAge] = useState<'kid' | 'teen'>('kid');
    const [perm, setPerm] = useState({ online: false, transfers: false, kopilka: true, cash: false, confirm: true });
    const [agree, setAgree] = useState(true);
    const [design, setDesign] = useState(0);
    const [sent, setSent] = useState(false);
    const next = () => nav.go({ id: 'reg', step: step + 1 });
    const doc = (title: string) => nav.sheet({ kind: 'doc', title });

    if (step === 1)
        return (
            <div className="scr">
                <div className="hero" style={{ paddingTop: 4 }}>
                    <div className="row" style={{ justifyContent: 'space-between', marginLeft: -12 }}>
                        <button className="icon-btn" style={{ color: '#fff' }} onClick={nav.back} aria-label="Назад">
                            <CaretLeftIcon size={24} weight="bold" />
                        </button>
                        <span className="chip">Новый пакет</span>
                    </div>
                    <h1 className="h1 display" style={{ fontSize: 28 }}>
                        Семья в Moby
                    </h1>
                    <p style={{ margin: '8px 0 0', color: '#DCE5FF', fontSize: 15, lineHeight: 1.45 }}>
                        Цифровая карта для ребёнка, карманные деньги, цели и игра про финансы — под вашим контролем
                    </p>
                    <div className="row" style={{ gap: 10, marginTop: 16 }}>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,.12)', borderRadius: 16, padding: 12 }}>
                            <b style={{ fontSize: 20 }}>0 BYN</b>
                            <div className="tiny" style={{ color: '#DCE5FF' }}>
                                обслуживание карты ребёнка
                            </div>
                        </div>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,.12)', borderRadius: 16, padding: 12 }}>
                            <b style={{ fontSize: 20 }}>3%</b>
                            <div className="tiny" style={{ color: '#DCE5FF' }}>
                                кешбэк на детские категории
                            </div>
                        </div>
                    </div>
                </div>
                <div className="stack pad" style={{ gap: 10, paddingTop: 18 }}>
                    <h2 className="h2">Что получит семья</h2>
                    {[
                        [CreditCardIcon, 'Цифровая карта ребёнку', 'Сразу в Moby, бесплатный выпуск'],
                        [ShieldCheckIcon, 'Родительский контроль', 'Лимиты, запрет 18+, блокировка'],
                        [SparkleIcon, 'Задания и награды', 'Финграмотность в игре Moby'],
                        [PiggyBankIcon, 'Копилка с целью', 'Карманные деньги и накопления'],
                    ].map(([Ico, t, sub]) => {
                        const I = Ico as typeof CreditCardIcon;
                        return (
                            <div key={t as string} className="card row" style={{ gap: 14 }}>
                                <span className="ring-ico">
                                    <I size={22} />
                                </span>
                                <span>
                                    <b>{t as string}</b>
                                    <div className="tiny">{sub as string}</div>
                                </span>
                            </div>
                        );
                    })}
                </div>
                <div className="stack" style={{ gap: 12, padding: '18px 16px 24px', marginTop: 'auto' }}>
                    <p className="small" style={{ margin: 0, color: 'var(--muted-2)' }}>
                        Я ознакомлен(-а) и согласен(-на) с{' '}
                        <button className="link-btn" style={{ fontSize: 13 }} onClick={() => doc('Условия пакета')}>
                            Условиями пакета «Семья в Moby»
                        </button>
                    </p>
                    <Swipe text={'Проведите пальцем\nдля оформления пакета'} onDone={next} />
                </div>
            </div>
        );

    if (step === 2)
        return (
            <div className="scr">
                <TopBar title="" />
                <Steps n={1} />
                <div className="stack pad" style={{ gap: 12, paddingTop: 24 }}>
                    <h1 className="h1">Сколько лет ребёнку?</h1>
                    <p className="small" style={{ margin: 0, fontSize: 15 }}>
                        От возраста зависит состав пакета и что ребёнок сможет делать сам
                    </p>
                    {(
                        [
                            ['kid', '7–13 лет', 'Детский пакет · Moby Kids', 'Карта с лимитами, карманные деньги, копилка и задания. MTcoin в игре. Все операции видит родитель.'],
                            ['teen', '14–17 лет', 'Подростковый пакет · Moby Teen', 'Онлайн-покупки, переводы друзьям, вклады и кешбэк по уровням карты. Лимиты задаёте вы.'],
                        ] as const
                    ).map(([id, range, title, text]) => (
                        <button key={id} className="choice" aria-pressed={age === id} onClick={() => setAge(id)} style={{ padding: 16 }}>
                            <div className="row" style={{ justifyContent: 'space-between' }}>
                                <b style={{ fontSize: 22 }}>{range}</b>
                                <span
                                    style={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: '50%',
                                        border: age === id ? '7px solid var(--accent)' : '2px solid #4A4D5A',
                                    }}
                                />
                            </div>
                            <b style={{ display: 'block', marginTop: 2 }}>{title}</b>
                            <div className="small" style={{ marginTop: 8 }}>
                                {text}
                            </div>
                        </button>
                    ))}
                    <div className="row" style={{ gap: 10, alignItems: 'flex-start', background: 'var(--accent-soft)', borderRadius: 14, padding: '12px 14px' }}>
                        <InfoIcon size={20} color="var(--accent-text)" style={{ flex: 'none' }} />
                        <span className="small" style={{ color: '#C9D6FF' }}>
                            До 14 лет договор заключает родитель как законный представитель. С 14 лет подросток распоряжается своими доходами с вашего согласия.
                        </span>
                    </div>
                </div>
                <div className="pad" style={{ padding: '20px 20px 24px', marginTop: 'auto' }}>
                    <button className="btn block" onClick={next}>
                        Продолжить
                    </button>
                </div>
            </div>
        );

    if (step === 3)
        return (
            <div className="scr">
                <TopBar title="" />
                <Steps n={2} />
                <div className="stack pad" style={{ gap: 12, paddingTop: 24 }}>
                    <h1 className="h1 display" style={{ fontSize: 24, textTransform: 'uppercase' }}>
                        Данные ребёнка
                    </h1>
                    <p className="small" style={{ margin: 0, fontSize: 15 }}>
                        Из свидетельства о рождении. Мы бережно храним данные и не передаём партнёрам
                    </p>
                    {[
                        ['Фамилия', 'Иванов', 'family-name'],
                        ['Имя', age === 'kid' ? 'Тимофей' : 'Марк', 'given-name'],
                        ['Дата рождения', '', 'bday'],
                        ['Номер свидетельства о рождении', '', 'off'],
                        ['Телефон ребёнка — для входа в Moby', '', 'tel'],
                    ].map(([label, val, ac]) => (
                        <label key={label} className="card stack" style={{ gap: 4, padding: '10px 16px' }}>
                            <span className="tiny">{label}</span>
                            <input
                                defaultValue={val}
                                autoComplete={ac}
                                placeholder={ac === 'bday' ? 'ДД.ММ.ГГГГ' : ac === 'tel' ? '+375 (__) ___-__-__' : ac === 'off' ? 'I-ВМ 123456' : ''}
                                style={{ background: 'none', border: 0, outline: 'none', color: '#fff', fontSize: 16, fontWeight: 600, padding: 0 }}
                            />
                        </label>
                    ))}
                    <button className="row" style={{ gap: 12, padding: '12px 14px', borderRadius: 14, border: '1px dashed #3A3D4A' }} onClick={() => flash('Свидетельство распознано')}>
                        <IdentificationCardIcon size={22} color="var(--accent)" />
                        <span style={{ color: 'var(--muted-2)' }}>Отсканировать свидетельство</span>
                    </button>
                </div>
                <div className="pad" style={{ padding: '20px 20px 24px', marginTop: 'auto' }}>
                    <button className="btn block" onClick={next}>
                        Продолжить
                    </button>
                </div>
            </div>
        );

    if (step === 4)
        return (
            <div className="scr">
                <TopBar title="" />
                <Steps n={3} />
                <div className="stack pad" style={{ gap: 12, paddingTop: 22 }}>
                    <h1 className="h1">Что можно ребёнку</h1>
                    <p className="small" style={{ margin: 0 }}>
                        Изменить можно в любой момент в «Кабинете семьи»
                    </p>
                    <div className="list">
                        {(
                            [
                                ['online', 'Покупки в интернете', 'Только проверенные магазины'],
                                ['transfers', 'Переводы друзьям', 'По номеру телефона'],
                                ['kopilka', 'Открывать копилки', 'Цели и накопления'],
                                ['cash', 'Снятие наличных', 'В банкоматах МТБанка'],
                                ['confirm', 'Крупные покупки — с моим ОК', 'Push-запрос на подтверждение'],
                            ] as const
                        ).map(([k, t, sub]) => (
                            <div key={k} className="li">
                                <span className="grow">
                                    <b>{t}</b>
                                    <span className="sub">{sub}</span>
                                </span>
                                <Toggle on={perm[k]} label={t} onChange={() => setPerm({ ...perm, [k]: !perm[k] })} />
                            </div>
                        ))}
                    </div>
                    <div className="card row" style={{ justifyContent: 'space-between' }}>
                        <span>
                            <b>Лимит трат в день</b>
                            <div className="tiny">Запрет 18+ и азартных игр — всегда</div>
                        </span>
                        <b style={{ fontSize: 17, color: 'var(--accent-text)' }}>{age === 'kid' ? 20 : 50} BYN</b>
                    </div>
                    <label className="row" style={{ gap: 12, alignItems: 'flex-start', fontSize: 13, lineHeight: 1.45, color: 'var(--muted-2)' }}>
                        <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} style={{ width: 22, height: 22, accentColor: 'var(--accent)', margin: 0, flex: 'none' }} />
                        <span>
                            Даю согласие как законный представитель на выпуск карты, доступ ребёнка в Moby и обработку его данных.{' '}
                            <button className="link-btn" style={{ fontSize: 13 }} onClick={() => doc('Согласие и договор')}>
                                Документы
                            </button>
                        </span>
                    </label>
                </div>
                <div className="pad" style={{ padding: '20px 20px 24px', marginTop: 'auto' }}>
                    <button
                        className="btn block"
                        disabled={!agree}
                        onClick={() => {
                            set((p) => ({ controls: { ...p.controls, [age]: { ...p.controls[age], feats: { ...p.controls[age].feats, online: perm.online, transfers: perm.transfers, cash: perm.cash } } } }));
                            next();
                        }}
                    >
                        Подтвердить
                    </button>
                </div>
            </div>
        );

    if (step === 5)
        return (
            <div className="scr">
                <TopBar title="" />
                <Steps n={4} />
                <div className="stack pad" style={{ gap: 14, paddingTop: 22 }}>
                    <div>
                        <h1 className="h1">Цифровая карта</h1>
                        <p className="small" style={{ margin: '6px 0 0' }}>
                            Выберите дизайн — карта появится в Moby сразу после выпуска
                        </p>
                    </div>
                    <div style={{ height: 190, borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: DESIGNS[design].bg }}>
                        <div className="row" style={{ justifyContent: 'space-between' }}>
                            <b style={{ fontSize: 18 }}>MTbank</b>
                            <span className="chip" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>
                                {age === 'kid' ? 'Kids' : 'Teen'} · Digital
                            </span>
                        </div>
                        <b className="display" style={{ fontSize: 54, opacity: 0.9 }}>
                            MT
                        </b>
                        <div className="row" style={{ justifyContent: 'space-between', fontSize: 13 }}>
                            <span>
                                {age === 'kid' ? 'TIMOFEI' : 'MARK'} IVANOV · •• {age === 'kid' ? '0427' : '5521'}
                            </span>
                            <b style={{ fontStyle: 'italic' }}>{age === 'kid' ? 'mastercard' : 'VISA'}</b>
                        </div>
                    </div>
                    <div className="row" style={{ gap: 12, justifyContent: 'center' }} role="radiogroup" aria-label="Дизайн карты">
                        {DESIGNS.map((d, i) => (
                            <button
                                key={d.name}
                                role="radio"
                                aria-checked={design === i}
                                aria-label={d.name}
                                onClick={() => setDesign(i)}
                                style={{ width: 48, height: 48, borderRadius: 14, background: d.bg, border: `3px solid ${design === i ? '#fff' : 'transparent'}` }}
                            />
                        ))}
                    </div>
                    <div className="tiny" style={{ textAlign: 'center' }}>
                        Дизайн «{DESIGNS[design].name}»
                    </div>
                    <div className="list">
                        {[
                            ['Формат', 'Цифровая, сразу в Moby'],
                            ['Оплата', 'Телефоном и онлайн'],
                            ['Выпуск и обслуживание', 'Бесплатно'],
                        ].map(([k, v]) => (
                            <div key={k} className="li" style={{ minHeight: 46, justifyContent: 'space-between' }}>
                                <span className="muted">{k}</span>
                                <b style={{ color: v === 'Бесплатно' ? 'var(--green)' : undefined }}>{v}</b>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="stack" style={{ gap: 12, padding: '18px 16px 24px', marginTop: 'auto' }}>
                    <p className="small" style={{ margin: 0, color: 'var(--muted-2)' }}>
                        Я ознакомлен(-а) и согласен(-на) с{' '}
                        <button className="link-btn" style={{ fontSize: 13, textAlign: 'left' }} onClick={() => doc('Договор о карточке')}>
                            Договором об использовании банковской платежной карточки
                        </button>
                    </p>
                    <Swipe text={'Проведите пальцем\nдля заключения договора'} onDone={next} />
                </div>
            </div>
        );

    return (
        <div className="scr">
            <div className="done" style={{ paddingTop: 60 }}>
                <div className="done-ico">
                    <CheckIcon size={42} weight="bold" />
                </div>
                <h1 className="h1" style={{ marginTop: 22 }}>
                    Готово! Карта выпущена
                </h1>
                <p className="small" style={{ fontSize: 15, maxWidth: 300 }}>
                    Цифровая карта уже в Moby — {age === 'kid' ? 'Тимофей' : 'Марк'} может платить телефоном и онлайн
                </p>
                <div className="card stack" style={{ width: '100%', marginTop: 24, alignItems: 'center', gap: 12, padding: 20 }}>
                    <b>Пригласите {age === 'kid' ? 'Тимофея' : 'Марка'} в Moby</b>
                    <div
                        aria-label="QR-код приглашения"
                        role="img"
                        style={{ width: 148, height: 148, borderRadius: 12, background: '#fff', display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 4, padding: 12 }}
                    >
                        {'1110111101010111100111010110001101110101101111011'.split('').map((b, i) => (
                            <span key={i} style={{ borderRadius: 2, background: b === '1' ? '#16171C' : 'transparent' }} />
                        ))}
                    </div>
                    <span className="small" style={{ textAlign: 'center' }}>
                        Отсканируйте с телефона ребёнка или отправьте ссылку. Код MOBY-4821 действует 24 часа
                    </span>
                </div>
                <div className="stack" style={{ marginTop: 'auto', width: '100%', gap: 10, paddingTop: 20 }}>
                    <button className="btn block" style={{ background: sent ? '#1F7A45' : undefined }} onClick={() => setSent(true)}>
                        {sent ? 'Ссылка отправлена ✓' : 'Отправить ссылку ребёнку'}
                    </button>
                    <button
                        className="btn ghost block"
                        onClick={() => {
                            nav.home();
                            flash(s.role === 'parent' ? 'Пакет «Семья в Moby» оформлен' : '');
                        }}
                    >
                        На главную
                    </button>
                </div>
            </div>
        </div>
    );
}
