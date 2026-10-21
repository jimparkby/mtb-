import { useEffect, useRef, useState } from 'react';
import { CellSignalFullIcon, NavigationArrowIcon } from '@phosphor-icons/react';
import { useStore, type Role } from './store';
import { ParentHome } from './screens/ParentHome';
import { KidHome, TeenHome } from './screens/ChildHome';
import { Registration } from './screens/Registration';
import { Story } from './screens/Story';
import { ChildCard } from './screens/ChildCard';
import { Deposits } from './screens/Deposits';
import { Family } from './screens/Family';
import { Kopilka } from './screens/Kopilka';
import { Game } from './screens/Game';
import { Transfer } from './screens/Transfer';
import { Topup } from './screens/Topup';
import { Pay } from './screens/Pay';
import { Chat } from './screens/Chat';
import { Sheets } from './screens/Sheets';

const ROLES: [Role, string, string][] = [
    ['kid', '7–13 лет', 'Тимофей · MTcoin'],
    ['teen', '14–17 лет', 'Марк · кешбэк'],
    ['parent', 'Родитель', 'Анна · Moby Семья'],
];

export default function App() {
    const { s, nav, reset } = useStore();
    const box = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    // Телефон 408×862 вписывается в окно; на узком экране занимает его целиком
    useEffect(() => {
        const fit = () => {
            const bar = document.querySelector('.demo-bar')?.clientHeight ?? 70;
            setScale(Math.min(1, (window.innerHeight - bar - 40) / 862, (window.innerWidth - 24) / 408));
        };
        fit();
        window.addEventListener('resize', fit);
        return () => window.removeEventListener('resize', fit);
    }, []);

    const screen = s.stacks[s.role][s.stacks[s.role].length - 1];
    const dark = screen.id !== 'home' || s.role !== 'parent';

    return (
        <div className="stage">
            <div className="demo-bar">
                <div className="segmented" role="group" aria-label="Чей телефон">
                    {ROLES.map(([id, label, sub]) => (
                        <button key={id} aria-pressed={s.role === id} onClick={() => nav.role(id)}>
                            <b>{label}</b>
                            <span>{sub}</span>
                        </button>
                    ))}
                </div>
                {s.role === 'parent' && (
                    <button
                        className="tool"
                        onClick={() => {
                            nav.home();
                            nav.go({ id: 'reg', step: 1 });
                        }}
                    >
                        Регистрация родителя
                    </button>
                )}
                <button className="tool link" onClick={reset}>
                    Сбросить демо
                </button>
            </div>

            <div className="phone-wrap">
                <div className="phone-box" ref={box} style={{ width: 408 * scale, height: 862 * scale }}>
                    <div className="phone" style={{ transform: `scale(${scale})` }}>
                        <div className="statusbar" style={{ background: dark ? 'var(--bg)' : 'var(--accent)' }}>
                            <span className="row" style={{ gap: 4 }}>
                                11:49
                                <NavigationArrowIcon size={13} weight="fill" style={{ transform: 'scaleX(-1)' }} />
                            </span>
                            <span className="row" style={{ gap: 6 }}>
                                <CellSignalFullIcon size={16} weight="fill" />
                                <span style={{ fontSize: 13 }}>LTE</span>
                                <span className="battery">74</span>
                            </span>
                        </div>
                        <div className="screen">
                            <Route />
                            <Sheets />
                            {s.toast && (
                                <div className="toast" role="status">
                                    {s.toast}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Route() {
    const { s } = useStore();
    const sc = s.stacks[s.role][s.stacks[s.role].length - 1];
    switch (sc.id) {
        case 'home':
            return s.role === 'parent' ? <ParentHome /> : s.role === 'kid' ? <KidHome /> : <TeenHome />;
        case 'reg':
            return <Registration step={sc.step} />;
        case 'story':
            return <Story />;
        case 'childCard':
            return <ChildCard child={sc.child} />;
        case 'deposits':
            return <Deposits />;
        case 'family':
            return <Family initialTab={sc.tab} />;
        case 'kopilka':
            return <Kopilka />;
        case 'game':
            return <Game />;
        case 'transfer':
            return <Transfer />;
        case 'topup':
            return <Topup />;
        case 'pay':
            return <Pay />;
        case 'chat':
            return <Chat />;
    }
}
