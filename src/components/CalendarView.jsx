import { useState, useMemo } from 'react';
import { useHabits } from '../context/HabitContext';
import { ChevronLeft, ChevronRight, Target } from 'lucide-react';

export default function CalendarView() {
    const { history, goals, addGoal, deleteGoal } = useHabits();
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Helper to get days in month
    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Aggregate history by day string "YYYY-MM-DD"
    const dailyData = useMemo(() => {
        const data = {};
        history.forEach(item => {
            const date = new Date(item.timestamp);
            const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            if (!data[key]) data[key] = { points: 0, items: [] };
            data[key].items.push(item);
            data[key].points += item.change;
        });
        return data;
    }, [history]);

    // Goal for this month
    const currentGoal = goals.find(g => g.month === month && g.year === year);
    const monthPoints = useMemo(() => {
        let sum = 0;
        Object.keys(dailyData).forEach(key => {
            const [DataYear, DataMonth] = key.split('-').map(Number);
            if (DataYear === year && DataMonth === month) {
                sum += dailyData[key].points;
            }
        });
        return sum;
    }, [dailyData, year, month]);

    const handleSetGoal = (e) => {
        e.preventDefault();
        const target = parseInt(e.target.goal.value);
        if (target) {
            if (currentGoal) deleteGoal(currentGoal.id); // Simple replace
            addGoal({ month, year, targetPoints: target });
        }
    };

    const changeMonth = (delta) => {
        setCurrentDate(new Date(year, month + delta, 1));
    };

    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Header controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => changeMonth(-1)} style={{ padding: '0.5rem', opacity: 0.7 }}><ChevronLeft /></button>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{monthName} {year}</h2>
                <button onClick={() => changeMonth(1)} style={{ padding: '0.5rem', opacity: 0.7 }}><ChevronRight /></button>
            </div>

            {/* Goal Section */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <Target size={16} /> Monthly Goal
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--accent-primary)' }}>
                        {monthPoints} / {currentGoal ? currentGoal.targetPoints : '---'}
                    </span>
                </div>

                {currentGoal ? (
                    <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${Math.min(100, Math.max(0, (monthPoints / currentGoal.targetPoints) * 100))}%`,
                            height: '100%',
                            background: 'var(--accent-primary)',
                            transition: 'width 0.5s ease',
                            boxShadow: '0 0 10px var(--accent-glow)'
                        }} />
                    </div>
                ) : (
                    <form onSubmit={handleSetGoal} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            name="goal"
                            type="number"
                            placeholder="Set target points (e.g. 1000)"
                            style={{
                                flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: 'none',
                                background: 'var(--bg-tertiary)', color: 'white'
                            }}
                        />
                        <button type="submit" style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>Set</button>
                    </form>
                )}
            </div>

            {/* Calendar Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{d}</div>
                ))}

                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const key = `${year}-${month}-${day}`;
                    const data = dailyData[key];
                    const hasData = data && data.items.length > 0;
                    const isPositive = data && data.points >= 0;

                    return (
                        <div
                            key={day}
                            className="calendar-day" // for hover effects
                            style={{
                                aspectRatio: '1',
                                borderRadius: 'var(--radius-sm)',
                                background: hasData
                                    ? (isPositive ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)')
                                    : 'var(--bg-secondary)',
                                border: hasData
                                    ? (isPositive ? '1px solid var(--success-glow)' : '1px solid var(--danger-glow)')
                                    : '1px solid transparent',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'relative',
                                cursor: 'pointer'
                            }}
                            title={hasData ? `${data.points} pts\n${data.items.length} activities` : ''}
                        >
                            <span style={{ fontSize: '0.9rem', color: hasData ? 'var(--text-primary)' : 'var(--text-muted)' }}>{day}</span>
                            {hasData && (
                                <span style={{ fontSize: '0.7rem', color: isPositive ? 'var(--success)' : 'var(--danger)' }}>
                                    {data.points > 0 ? '+' : ''}{data.points}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
