import { useState } from 'react';
import { ArrowDownIcon, ArrowsLeftRightIcon, ArrowUpRightIcon, ArrowDownLeftIcon, CaretRightIcon, EyeIcon, EyeSlashIcon, PlusIcon } from '@phosphor-icons/react';
import { money, useStore } from '../store';
import { Toggle } from '../ui/kit';

/** Копилка: 8% годовых для всех; до 14 лет снятие — через маму, с 14 — сам, плюс переход во вклад */
export function Kopilka() {
    const { s, set, nav, move, flash } = useStore();
    const who = s.role === 'teen' ? 'teen' : 'kid';
    const teen = who === 'teen';
    const k = s.kop[who];
    const [hide, setHide] = useState(false);
    const [auto, setAuto] = useState(true);
    const pct = Math.min(100, Math.round((k.saved / k.target) * 100));
    const C = 2 * Math.PI * 56;
    const ops = s.ops.filter((o) => o.who === who && o.title.startsWith('Копилка')).slice(0, 3);

    const topUp = () => {
        if (s.bal[who] < 5) return flash('На карте меньше 5 BYN');
        move(who, -5, 'Копилка: пополнение', 'с карты');
        set((p) => ({ kop: { ...p.kop, [who]: { ...p.kop[who], saved: p.kop[who].saved + 5 } }, coins: teen ? p.coins : p.coins + 10 }));
        flash(teen ? '+5 BYN в копилке' : '+5 BYN в копилке · +10 MTcoin');
    };
    const withdraw = () => {
        if (!teen) {
            set(() => ({ request: true }));
            return flash('Просьба снять деньги отправлена маме');
        }
        const v = Math.min(10, k.saved);
        if (!v) return flash('В копилке пусто');
        move(who, v, 'Копилка: снятие', 'на карту');
        set((p) => ({ kop: { ...p.kop, [who]: { ...p.kop[who], saved: p.kop[who].saved - v } } }));
        flash(`${money(v)} BYN вернулись на карту`);
    };

    return (
        <div className="scr">
            <div className="hero" style={{ paddingTop: 0 }}>
                <div className="row" style={{ marginLeft: -12 }}>
                    <button className="icon-btn" style={{ color: '#fff' }} onClick={nav.back} aria-label="Назад">
                        <CaretRightIcon size={24} weight="bold" style={{ transform: 'scaleX(-1)' }} />
                    </button>
                    <b style={{ fontSize: 18 }}>Копилка</b>
                </div>
                <div className="row" style={{ gap: 18, marginTop: 6 }}>
                    <div style={{ position: 'relative', width: 132, height: 132, flex: 'none' }}>
                        <svg width="132" height="132" viewBox="0 0 132 132" aria-hidden="true">
                            <circle cx="66" cy="66" r="56" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="12" />
                            <circle cx="66" cy="66" r="56" fill="none" stroke="#FFD23F" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(C * pct) / 100} ${C}`} transform="rotate(-90 66 66)" />
                        </svg>
                        <div className="stack" style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
                            <b style={{ fontSize: 26 }}>{pct}%</b>
                            <span className="tiny" style={{ color: '#DCE5FF' }}>
                                цели
                            </span>
                        </div>
                    </div>
                    <div className="stack" style={{ gap: 4 }}>
                        <span className="small" style={{ color: '#DCE5FF' }}>
                            Цель · {k.goal}
                        </span>
                        <span className="row" style={{ gap: 4 }}>
                            <b style={{ fontSize: 28 }}>{hide ? '••••' : money(k.saved)} BYN</b>
                            <button className="icon-btn" style={{ color: '#DCE5FF', width: 36, height: 36 }} onClick={() => setHide(!hide)} aria-label="Скрыть или показать баланс">
                                {hide ? <EyeIcon size={20} /> : <EyeSlashIcon size={20} />}
                            </button>
                        </span>
                        <span className="small" style={{ color: '#DCE5FF' }}>
                            из {k.target} BYN · ещё {money(Math.max(0, k.target - k.saved))}
                        </span>
                        <span className="chip" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                            8% годовых
                        </span>
                    </div>
                </div>
                <div className="acts">
                    <button className="act" onClick={topUp}>
                        <PlusIcon size={22} />
                        Пополнить
                    </button>
                    <button className="act" onClick={withdraw}>
                        <ArrowDownIcon size={22} />
                        {teen ? 'Снять' : 'Попросить'}
                    </button>
                    <button className="act" onClick={() => (teen ? nav.go({ id: 'deposits' }) : flash('Переводы с копилки — с 14 лет'))}>
                        <ArrowsLeftRightIcon size={22} />
                        Перевести
                    </button>
                </div>
            </div>

            <div className="stack pad" style={{ gap: 12, paddingTop: 16 }}>
                <h2 className="h2">Операции</h2>
                <div className="list">
                    {ops.length === 0 && <div className="li small">Пока нет операций — пополни копилку</div>}
                    {ops.map((o) => (
                        <div key={o.id} className="li">
                            <span className="tile">{o.amt < 0 ? <ArrowUpRightIcon size={18} /> : <ArrowDownLeftIcon size={18} />}</span>
                            <span className="grow">
                                <b>{o.amt < 0 ? 'Пополнение с карты' : 'Снятие на карту'}</b>
                                <span className="sub">сейчас</span>
                            </span>
                            <b style={{ color: o.amt < 0 ? 'var(--green)' : undefined }}>
                                {o.amt < 0 ? '+' : '−'}
                                {money(Math.abs(o.amt))}
                            </b>
                        </div>
                    ))}
                </div>
                <div className="list">
                    <div className="li">
                        <span className="grow">
                            <b>Автопополнение</b>
                            <span className="sub">10% от карманных денег</span>
                        </span>
                        <Toggle on={auto} label="Автопополнение" onChange={() => setAuto(!auto)} />
                    </div>
                    <button className="li" onClick={() => (teen ? nav.go({ id: 'deposits' }) : nav.sheet({ kind: 'goal' }))}>
                        <span className="grow">
                            <b>{teen ? 'Перевести во вклад' : 'Сменить цель'}</b>
                            <span className="sub">{teen ? '«МТБелки Online» — до 13,2% годовых' : `Сейчас: ${k.goal.toLowerCase()} за ${k.target} BYN`}</span>
                        </span>
                        <CaretRightIcon size={18} className="caret" />
                    </button>
                </div>
            </div>
        </div>
    );
}
