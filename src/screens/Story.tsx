import { useState } from 'react';
import { XIcon } from '@phosphor-icons/react';
import { useStore } from '../store';

const SLIDES = [
    { kicker: 'Семья в Moby', title: 'Первая карта — для ребёнка, контроль — у вас', text: 'Оформите детскую цифровую карту за 3 минуты прямо в приложении. Выпуск и обслуживание бесплатны.' },
    { kicker: 'Карманные деньги', title: 'Автоперевод каждую неделю', text: 'Выберите сумму и день — деньги придут сами. Ребёнок учится планировать бюджет.' },
    { kicker: 'Копилка', title: 'Цель на велосипед? Копим вместе', text: 'Ребёнок откладывает с покупок, вы добавляете бонус за выполненные задания.' },
    { kicker: 'Безопасность', title: '18+ и азартные игры — под запретом', text: 'Видите каждую покупку, ставите лимиты и блокируете карту в один тап.' },
];

/** История-сторис: тап справа — дальше, слева — назад */
export function Story() {
    const { nav } = useStore();
    const [i, setI] = useState(0);
    const sl = SLIDES[i];
    return (
        <div className="scr" style={{ background: 'linear-gradient(180deg, #2B63F5 0%, #0B2C9C 55%, #16171C 100%)', padding: '8px 20px 28px' }}>
            <div className="row" style={{ gap: 4 }}>
                {SLIDES.map((_, k) => (
                    <button key={k} aria-label={`Слайд ${k + 1}`} onClick={() => setI(k)} style={{ flex: 1, height: 4, borderRadius: 2, background: k <= i ? '#fff' : 'rgba(255,255,255,.3)' }} />
                ))}
            </div>
            <div className="row" style={{ justifyContent: 'space-between', marginTop: 12 }}>
                <span className="row" style={{ gap: 8 }}>
                    <span className="avatar" style={{ width: 32, height: 32, borderRadius: 10, fontSize: 14 }}>
                        М
                    </span>
                    <b>Moby</b>
                </span>
                <button className="icon-btn" style={{ color: '#fff' }} aria-label="Закрыть" onClick={nav.back}>
                    <XIcon size={24} weight="bold" />
                </button>
            </div>
            <div className="stack" style={{ flex: 1, justifyContent: 'center', gap: 16, position: 'relative' }}>
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#9FBBFF' }}>{sl.kicker}</span>
                <h1 className="display" style={{ margin: 0, fontSize: 30, lineHeight: 1.15 }}>
                    {sl.title}
                </h1>
                <p style={{ margin: 0, fontSize: 17, lineHeight: 1.5, color: '#DCE5FF' }}>{sl.text}</p>
                <button aria-label="Назад" onClick={() => setI(Math.max(0, i - 1))} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '35%' }} />
                <button aria-label="Дальше" onClick={() => (i < SLIDES.length - 1 ? setI(i + 1) : nav.back())} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '65%' }} />
            </div>
            <button className="btn block" style={{ background: '#fff', color: 'var(--accent-deep)' }} onClick={() => nav.go({ id: 'reg', step: 1 })}>
                Оформить пакет
            </button>
        </div>
    );
}
