import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

/** Демо-роли: ребёнок 7–13 (MTcoin), подросток 14–17 (кешбэк), родитель (Moby Семья) — как в mt-city */
export type Role = 'kid' | 'teen' | 'parent';
export type Child = 'kid' | 'teen';

export type Screen =
    | { id: 'home' }
    | { id: 'reg'; step: number }
    | { id: 'story' }
    | { id: 'childCard'; child: Child }
    | { id: 'deposits' }
    | { id: 'family'; tab?: FamilyTab }
    | { id: 'kopilka' }
    | { id: 'game' }
    | { id: 'transfer'; to?: Child }
    | { id: 'topup' }
    | { id: 'pay' }
    | { id: 'chat' };

export type FamilyTab = 'tasks' | 'control' | 'ops';

export type Sheet =
    | { kind: 'ask' }
    | { kind: 'reply' }
    | { kind: 'products' }
    | { kind: 'more' }
    | { kind: 'teenTasks' }
    | { kind: 'doc'; title: string }
    | { kind: 'deposit' }
    | { kind: 'goal' }
    | { kind: 'childTopup'; child: Child };

export interface Task {
    id: string;
    title: string;
    amt: number;
    who: Child;
    st: 'open' | 'review' | 'paid';
}

export interface Op {
    id: string;
    who: Role;
    title: string;
    sub: string;
    amt: number;
    status?: 'declined' | 'pending';
}

export interface Controls {
    day: number;
    month: number;
    approve: number;
    blocked: boolean;
    cats: Record<string, boolean>;
    feats: Record<string, boolean>;
    login: boolean;
    insurance: boolean;
    pocket: { amt: number; period: 'day' | 'week' | 'month' };
}

export interface State {
    role: Role;
    stacks: Record<Role, Screen[]>;
    sheet: Sheet | null;
    toast: string;
    bal: { parent: number; parentEur: number; kid: number; teen: number };
    coins: number;
    teenSpent: number;
    spentToday: Record<Child, number>;
    kop: Record<Child, { saved: number; target: number; goal: string }>;
    tasks: Task[];
    grades: Record<10 | 9 | 8, number>;
    gradesOn: boolean;
    controls: Record<Child, Controls>;
    ops: Op[];
    request: boolean;
    deposit: number;
}

/** Значения по умолчанию по возрасту — как defaultControls() в mt-city (packages/shared/src/family.ts) */
const controls = (teen: boolean): Controls => ({
    day: teen ? 50 : 20,
    month: teen ? 400 : 150,
    approve: teen ? 30 : 10,
    blocked: false,
    cats: { food: true, transport: true, shops: true, fun: true, games: teen },
    feats: { online: teen, cash: teen, transfers: teen },
    login: true,
    insurance: false,
    pocket: { amt: 10, period: 'week' },
});

const initial = (): State => ({
    role: 'parent',
    stacks: { parent: [{ id: 'home' }], kid: [{ id: 'home' }], teen: [{ id: 'home' }] },
    sheet: null,
    toast: '',
    bal: { parent: 1248.6, parentEur: 5.14, kid: 58.95, teen: 25 },
    coins: 240,
    teenSpent: 31.2,
    spentToday: { kid: 12.4, teen: 11.8 },
    kop: {
        kid: { saved: 86, target: 450, goal: 'Велосипед' },
        teen: { saved: 86, target: 450, goal: 'Наушники' },
    },
    tasks: [
        { id: 't1', title: 'Помыть пол', amt: 4, who: 'kid', st: 'review' },
        { id: 't2', title: 'Пропылесосить в квартире', amt: 3, who: 'kid', st: 'open' },
        { id: 't3', title: 'Вынести мусор', amt: 2, who: 'kid', st: 'paid' },
        { id: 't4', title: 'Помочь с покупками', amt: 5, who: 'teen', st: 'open' },
        { id: 't5', title: 'Погулять с собакой', amt: 3, who: 'teen', st: 'paid' },
    ],
    grades: { 10: 2, 9: 1, 8: 0.5 },
    gradesOn: true,
    controls: { kid: controls(false), teen: controls(true) },
    ops: [
        { id: 'o1', who: 'kid', title: 'Онлайн-казино', sub: 'Отклонено · запрещено для детских карт', amt: -20, status: 'declined' },
        { id: 'o2', who: 'kid', title: 'Cofix · какао', sub: 'сегодня · партнёр, +5% баллами', amt: -4.5 },
        { id: 'o3', who: 'kid', title: 'Карманные деньги', sub: 'пн · автоперевод', amt: 10 },
        { id: 'o4', who: 'teen', title: 'Kinopark', sub: 'вчера · развлечения', amt: -7.5 },
        { id: 'o5', who: 'parent', title: 'PEREVOD BSB', sub: 'вчера · пополнение', amt: 25 },
    ],
    request: true,
    deposit: 3000,
});

const KEY = 'mtb:state:v1';

function load(): State {
    try {
        const raw = localStorage.getItem(KEY);
        if (raw) return { ...initial(), ...JSON.parse(raw), sheet: null, toast: '' };
    } catch {
        // localStorage недоступен — играем без сохранения
    }
    return initial();
}

export const money = (v: number) =>
    v.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

let uid = 0;
const id = () => `${Date.now().toString(36)}${(uid++).toString(36)}`;

function useStoreValue() {
    const [s, setS] = useState<State>(load);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        try {
            localStorage.setItem(KEY, JSON.stringify({ ...s, sheet: null, toast: '' }));
        } catch {
            // без сохранения
        }
    }, [s]);

    const set = useCallback((fn: (s: State) => Partial<State>) => setS((prev) => ({ ...prev, ...fn(prev) })), []);

    const flash = useCallback(
        (toast: string) => {
            set(() => ({ toast }));
            clearTimeout(timer.current);
            timer.current = setTimeout(() => set(() => ({ toast: '' })), 2600);
        },
        [set],
    );

    const nav = useMemo(
        () => ({
            go: (screen: Screen) =>
                set((p) => ({ sheet: null, stacks: { ...p.stacks, [p.role]: [...p.stacks[p.role], screen] } })),
            back: () =>
                set((p) => {
                    const st = p.stacks[p.role];
                    return { sheet: null, stacks: { ...p.stacks, [p.role]: st.length > 1 ? st.slice(0, -1) : st } };
                }),
            home: () => set((p) => ({ sheet: null, stacks: { ...p.stacks, [p.role]: [{ id: 'home' }] } })),
            role: (role: Role) => set(() => ({ role, sheet: null })),
            sheet: (sheet: Sheet | null) => set(() => ({ sheet })),
        }),
        [set],
    );

    /** Движение денег по счёту: меняет баланс и пишет операцию в ленту владельца */
    const move = useCallback(
        (acc: keyof State['bal'], amt: number, title: string, sub: string, status?: Op['status']) =>
            set((p) => {
                const who: Role = acc === 'parentEur' ? 'parent' : acc;
                const spend = amt < 0 && !status ? -amt : 0;
                return {
                    bal: status ? p.bal : { ...p.bal, [acc]: Math.round((p.bal[acc] + amt) * 100) / 100 },
                    ops: [{ id: id(), who, title, sub, amt, status }, ...p.ops].slice(0, 40),
                    teenSpent: who === 'teen' ? p.teenSpent + spend : p.teenSpent,
                    spentToday: who === 'kid' || who === 'teen' ? { ...p.spentToday, [who]: p.spentToday[who] + spend } : p.spentToday,
                };
            }),
        [set],
    );

    const reset = useCallback(() => {
        try {
            localStorage.removeItem(KEY);
        } catch {
            // ничего
        }
        setS(initial());
    }, []);

    return { s, set, flash, nav, move, reset, newId: id };
}

type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
    const value = useStoreValue();
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
    const v = useContext(Ctx);
    if (!v) throw new Error('StoreProvider missing');
    return v;
}

/** Имена детей и их карт — для подписей на экранах */
export const KIDS: Record<Child, { name: string; gen: string; dat: string; age: string; card: string; mask: string; number: string }> = {
    kid: { name: 'Тимофей', gen: 'Тимофея', dat: 'Тимофею', age: '7–13', card: 'Moby Kids', mask: '•• 0427', number: '5310 4417 2093 0427' },
    teen: { name: 'Марк', gen: 'Марка', dat: 'Марку', age: '14–17', card: 'Moby Teen', mask: '•• 5521', number: '4255 7720 1146 5521' },
};

/** Уровни карты Moby Teen — CARD_TIERS из mt-city: кешбэк растёт с тратами за месяц */
export const TIERS = [
    { n: 'Старт', min: 0, cb: 0 },
    { n: 'Бронза', min: 50, cb: 1 },
    { n: 'Серебро', min: 100, cb: 2 },
    { n: 'Золото', min: 200, cb: 3 },
] as const;

export const tierOf = (spent: number) => TIERS.reduce((acc, t, k) => (spent >= t.min ? k : acc), 0);
