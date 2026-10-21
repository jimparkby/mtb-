import { useRef, useState, type ReactNode } from 'react';
import {
    BuildingsIcon,
    CaretDownIcon,
    CaretLeftIcon,
    CaretRightIcon,
    ChatsIcon,
    CheckIcon,
    DotsThreeOutlineIcon,
    HouseIcon,
    CardsIcon,
    UsersThreeIcon,
    XIcon,
} from '@phosphor-icons/react';
import { useStore } from '../store';

export function TopBar({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
    const { nav } = useStore();
    return (
        <div className="topbar">
            <button className="icon-btn" onClick={onBack ?? nav.back} aria-label="Назад">
                <CaretLeftIcon size={26} weight="bold" />
            </button>
            <span className="title grow">{title}</span>
            {right}
        </div>
    );
}

export function Toggle({
    on,
    onChange,
    label,
    locked,
}: {
    on: boolean;
    onChange?: () => void;
    label: string;
    locked?: boolean;
}) {
    return <button className="toggle" role="switch" aria-checked={on} aria-label={label} disabled={locked} onClick={onChange} />;
}

export function Stepper({
    value,
    onMinus,
    onPlus,
    label,
}: {
    value: string;
    onMinus: () => void;
    onPlus: () => void;
    label: string;
}) {
    return (
        <div className="stepper">
            <button onClick={onMinus} aria-label={`${label}: меньше`}>
                −
            </button>
            <b>{value}</b>
            <button onClick={onPlus} aria-label={`${label}: больше`}>
                +
            </button>
        </div>
    );
}

export function Fold({
    title,
    icon,
    open,
    onToggle,
    children,
}: {
    title: string;
    icon: ReactNode;
    open: boolean;
    onToggle: () => void;
    children: ReactNode;
}) {
    return (
        <div className="fold" data-open={open}>
            <button className="fold-head" aria-expanded={open} onClick={onToggle}>
                <span className="ico">{icon}</span>
                <span className="t">{title}</span>
                <CaretDownIcon size={20} className="fold-caret" />
            </button>
            {open && <div className="fold-body">{children}</div>}
        </div>
    );
}

export function Sheet({ title, children, onClose }: { title: string; children: ReactNode; onClose?: () => void }) {
    const { nav } = useStore();
    const close = onClose ?? (() => nav.sheet(null));
    return (
        <>
            <div className="backdrop" onClick={close} />
            <div className="sheet" role="dialog" aria-label={title}>
                <div className="grip" />
                <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span className="h2" style={{ fontSize: 20 }}>
                        {title}
                    </span>
                    <button className="icon-btn plain" onClick={close} aria-label="Закрыть">
                        <XIcon size={18} weight="bold" />
                    </button>
                </div>
                {children}
            </div>
        </>
    );
}

/** Свайп-подтверждение как в приложении МТБанка: тянем кружок до конца дорожки */
export function Swipe({ text, disabled, onDone }: { text: string; disabled?: boolean; onDone: () => void }) {
    const [x, setX] = useState(0);
    const [drag, setDrag] = useState(false);
    const ref = useRef<{ start: number; max: number; moved: boolean; scale: number } | null>(null);
    const moved = useRef(false);

    const finish = () => {
        setX(0);
        onDone();
    };

    return (
        <div className="swipe">
            <div className="swipe-text">{text}</div>
            <div className="swipe-goal" />
            <button
                className="swipe-knob"
                disabled={disabled}
                aria-label={text.replace('\n', ' ')}
                style={{ transform: `translateX(${x}px)`, transition: drag ? 'none' : 'transform .25s' }}
                onPointerDown={(e) => {
                    if (disabled) return;
                    // Телефон в демо масштабируется — переводим экранные пиксели в пиксели дорожки
                    const track = e.currentTarget.parentElement!;
                    const scale = track.getBoundingClientRect().width / track.offsetWidth || 1;
                    ref.current = { start: e.clientX, max: track.offsetWidth - 60, moved: false, scale };
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setDrag(true);
                }}
                onPointerMove={(e) => {
                    const r = ref.current;
                    if (!r) return;
                    const dx = (e.clientX - r.start) / r.scale;
                    if (Math.abs(dx) > 3) r.moved = true;
                    setX(Math.max(0, Math.min(r.max, dx)));
                }}
                onPointerUp={() => {
                    const r = ref.current;
                    if (!r) return;
                    ref.current = null;
                    moved.current = r.moved;
                    setDrag(false);
                    if (x > r.max * 0.85) finish();
                    else setX(0);
                }}
                onPointerCancel={() => {
                    ref.current = null;
                    setDrag(false);
                    setX(0);
                }}
                onClick={() => {
                    // Нажатие без перетаскивания тоже подтверждает — для клавиатуры и скринридеров
                    if (moved.current) {
                        moved.current = false;
                        return;
                    }
                    if (!disabled) finish();
                }}
            >
                <CaretRightIcon size={22} weight="bold" />
            </button>
        </div>
    );
}

export function Done({ title, amount, rows, children }: { title: string; amount?: string; rows: [string, string][]; children: ReactNode }) {
    return (
        <div className="done">
            <div className="done-ico">
                <CheckIcon size={42} weight="bold" />
            </div>
            <div className="h1" style={{ marginTop: 22, fontSize: 24 }}>
                {title}
            </div>
            {amount && (
                <div style={{ fontSize: 34, fontWeight: 800, marginTop: 8 }}>
                    {amount} <span className="muted" style={{ fontSize: 18 }}>BYN</span>
                </div>
            )}
            <div className="kv">
                {rows.map(([k, v]) => (
                    <div key={k}>
                        <span>{k}</span>
                        <span>{v}</span>
                    </div>
                ))}
            </div>
            <div className="stack" style={{ marginTop: 'auto', width: '100%', gap: 10, paddingTop: 20 }}>
                {children}
            </div>
        </div>
    );
}

/** Нижнее меню Moby: у родителя «Moby» ведёт в кабинет семьи, у ребёнка — в игру */
export function TabBar({ active }: { active: 'home' | 'moby' }) {
    const { s, nav } = useStore();
    const parent = s.role === 'parent';
    const review = s.tasks.filter((t) => t.st === 'review').length;
    return (
        <nav className="tabbar" aria-label="Меню Moby">
            <button aria-current={active === 'home' ? 'page' : undefined} onClick={nav.home}>
                <HouseIcon size={24} weight={active === 'home' ? 'fill' : 'regular'} />
                Главная
            </button>
            <button onClick={() => nav.sheet({ kind: 'products' })}>
                <CardsIcon size={24} />
                Продукты
            </button>
            <button
                className="moby"
                aria-current={active === 'moby' ? 'page' : undefined}
                onClick={() => nav.go(parent ? { id: 'family' } : { id: 'game' })}
            >
                {parent ? <UsersThreeIcon size={24} weight="duotone" /> : <BuildingsIcon size={24} weight="duotone" />}
                Moby
                {parent && review > 0 && <span className="count">{review}</span>}
            </button>
            <button onClick={() => nav.go({ id: 'chat' })}>
                <ChatsIcon size={24} />
                Чат
            </button>
            <button onClick={() => nav.sheet({ kind: 'more' })}>
                <DotsThreeOutlineIcon size={24} />
                Ещё
            </button>
        </nav>
    );
}

export const fmtCard = (v: string) =>
    v
        .replace(/\D/g, '')
        .slice(0, 16)
        .replace(/(\d{4})(?=\d)/g, '$1 ');

export const parseAmount = (v: string) => parseFloat(v.replace(',', '.')) || 0;
export const cleanAmount = (v: string) => v.replace(/[^\d.,]/g, '').slice(0, 9);
