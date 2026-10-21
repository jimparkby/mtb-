import { CaretLeftIcon } from '@phosphor-icons/react';
import { useStore } from '../store';

/**
 * Игра Moby из репозитория mt-city, собранная в public/game.
 * 7–13 — отдельная игра (game.html), 14–17 — полное демо с ролью подростка без его демо-панели.
 */
export function Game() {
    const { s, nav } = useStore();
    const teen = s.role === 'teen';

    const prepare = () => {
        if (!teen) return;
        try {
            const key = 'mt-city:ui:v7';
            const saved = JSON.parse(localStorage.getItem(key) || '{}');
            localStorage.setItem(key, JSON.stringify({ ...saved, role: 'teen', bankTab: 'city' }));
        } catch {
            // без сохранения роль останется по умолчанию
        }
    };
    prepare();

    return (
        <div className="scr" style={{ background: '#0f1a46' }}>
            <div className="row" style={{ height: 44, padding: '0 8px', gap: 4, flex: 'none' }}>
                <button className="icon-btn" style={{ color: '#fff' }} onClick={nav.back} aria-label="Назад в Moby">
                    <CaretLeftIcon size={24} weight="bold" />
                </button>
                <b>Moby · игра</b>
            </div>
            <iframe
                title="Игра Moby"
                src={teen ? '/game/index.html' : '/game/game.html'}
                style={{ flex: 1, border: 0, width: '100%' }}
                onLoad={(e) => {
                    // Прячем демо-панель и кнопку «Moby» самой игры — возврат через нашу шапку
                    try {
                        const doc = e.currentTarget.contentDocument;
                        if (doc) {
                            const st = doc.createElement('style');
                            st.textContent = '.demo-bar,.nav-back,.nav-sep{display:none!important}';
                            doc.head.appendChild(st);
                        }
                    } catch {
                        // другой домен — оставляем как есть
                    }
                }}
            />
        </div>
    );
}
