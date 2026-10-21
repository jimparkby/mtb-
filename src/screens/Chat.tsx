import { useEffect, useRef, useState } from 'react';
import { ArrowRightIcon } from '@phosphor-icons/react';
import { useStore } from '../store';
import { TopBar } from '../ui/kit';

function answer(q: string) {
    const t = q.toLowerCase();
    if (t.includes('лимит')) return 'Лимиты ставит родитель: у 7–13 лет — 20 BYN в день, у 14–17 — 50 BYN. Изменить можно в «Кабинете семьи» → «Контроль» → «Лимиты».';
    if (t.includes('потер') || t.includes('заблок')) return 'Карту можно заблокировать в Moby одной кнопкой — деньги останутся на счёте. Новая цифровая карта появится сразу.';
    if (t.includes('копил')) return 'Копилка приносит 8% годовых. Пополнять можно с карты, а с 14 лет — и снимать самому.';
    if (t.includes('задан') || t.includes('оцен')) return 'Задания и награды за оценки родитель настраивает в «Кабинете семьи». Деньги приходят после проверки.';
    if (t.includes('кешб')) return 'Кешбэк у Moby Teen растёт с тратами: 1% от 50 BYN в месяц, 2% от 100, 3% от 200.';
    if (t.includes('перев')) return 'Переводы по номеру карты — в разделе «Перевести». На карты МТБанка без комиссии.';
    return 'Спасибо! Передал вопрос специалисту — ответим здесь в течение пары минут.';
}

/** Чат с банком: быстрые вопросы и ответы помощника */
export function Chat() {
    const { s } = useStore();
    const [draft, setDraft] = useState('');
    const [msgs, setMsgs] = useState([{ me: false, text: 'Здравствуйте! Я помощник Moby. Спросите про карту, лимиты, копилку или задания.' }]);
    const end = useRef<HTMLDivElement>(null);
    const t = useRef<ReturnType<typeof setTimeout>>(undefined);
    useEffect(() => () => clearTimeout(t.current), []);
    // В фигурных скобках: scrollIntoView в новых браузерах возвращает Promise, а React ждёт от эффекта только функцию
    useEffect(() => {
        end.current?.scrollIntoView({ behavior: 'smooth' });
    }, [msgs]);

    const send = (text: string) => {
        const v = text.trim();
        if (!v) return;
        setDraft('');
        setMsgs((m) => [...m, { me: true, text: v }]);
        clearTimeout(t.current);
        t.current = setTimeout(() => setMsgs((m) => [...m, { me: false, text: answer(v) }]), 700);
    };
    const quick =
        s.role === 'parent'
            ? ['Как поменять лимит?', 'Задания и оценки', 'Потеряна карта']
            : s.role === 'teen'
              ? ['Как растёт кешбэк?', 'Копилка', 'Потерял карту']
              : ['Что такое копилка?', 'Мои задания', 'Потерял карту'];

    return (
        <div className="scr" style={{ overflow: 'hidden' }}>
            <TopBar title="Чат" />
            <div className="stack" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 16px', gap: 8 }}>
                {msgs.map((m, i) => (
                    <div key={i} className={`bubble ${m.me ? 'me' : ''}`}>
                        {m.text}
                    </div>
                ))}
                <div ref={end} />
            </div>
            <div className="row" style={{ gap: 8, padding: '8px 16px', overflowX: 'auto', flex: 'none' }}>
                {quick.map((q) => (
                    <button key={q} onClick={() => send(q)} style={{ flex: 'none', height: 36, padding: '0 12px', borderRadius: 18, border: '1px solid var(--accent)', color: 'var(--accent-text)', fontSize: 13, fontWeight: 600 }}>
                        {q}
                    </button>
                ))}
            </div>
            <form
                className="row"
                style={{ gap: 8, padding: '6px 16px 20px', flex: 'none' }}
                onSubmit={(e) => {
                    e.preventDefault();
                    send(draft);
                }}
            >
                <input
                    aria-label="Новое сообщение"
                    placeholder="Новое сообщение"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    style={{ flex: 1, height: 48, borderRadius: 24, border: 0, background: 'var(--surface)', color: '#fff', fontSize: 15, padding: '0 18px', outline: 'none' }}
                />
                <button
                    type="submit"
                    aria-label="Отправить"
                    style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: draft.trim() ? 'var(--accent)' : 'var(--surface-2)' }}
                >
                    <ArrowRightIcon size={22} weight="bold" />
                </button>
            </form>
        </div>
    );
}
