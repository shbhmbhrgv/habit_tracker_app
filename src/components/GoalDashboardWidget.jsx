import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { TrendingUp, Trash2, Pencil, Calendar, BarChart2 } from 'lucide-react';

export default function GoalDashboardWidget({ onEdit }) {
    const { smartGoals, history, deleteSmartGoal } = useHabits();
    const [activeTab, setActiveTab] = useState('weekly');

    // --- Helper Functions ---

    const getProgress = (goal) => {
        const now = new Date();
        let startDate = new Date();

        if (goal.period === 'weekly') {
            const day = startDate.getDay();
            const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
            startDate.setDate(diff);
            startDate.setHours(0, 0, 0, 0);
        } else if (goal.period === 'monthly') {
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
        } else if (goal.period === 'quarterly') {
            const month = Math.floor(now.getMonth() / 3) * 3;
            startDate.setMonth(month, 1);
            startDate.setHours(0, 0, 0, 0);
        }

        const relevantHistory = history.filter(h => {
            const hDate = new Date(h.timestamp);
            return hDate >= startDate; // Date logic remains same
        });

        let filteredHistory = relevantHistory;
        if (goal.target_type === 'habit' || goal.target_type === 'points') {
            if (goal.target_id) {
                filteredHistory = relevantHistory.filter(h => h.habit_id === goal.target_id);
            }
        }

        let current = 0;
        if (goal.target_type === 'habit') {
            current = filteredHistory.length;
        } else if (goal.target_type === 'points') {
            current = filteredHistory.reduce((sum, h) => sum + (h.change > 0 ? h.change : 0), 0);
        }

        return { current, percent: Math.min(100, (current / goal.target_value) * 100), filteredHistory, startDate };
    };

    // --- Renderers ---

    const renderWeekly = (goal, current, percent, startDate) => {
        const now = new Date();
        const daysLeft = 7 - (now.getDay() || 7);
        const isWarning = daysLeft <= 2 && percent < 50;

        return (
            <div style={{ marginTop: '0.1rem' }}>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                    <div style={{
                        width: `${percent}%`, height: '100%',
                        background: percent >= 100 ? 'var(--success)' : (isWarning ? 'var(--warning)' : 'var(--accent-primary)'),
                        transition: 'width 0.5s ease'
                    }} />
                </div>
                {/* Optional: Add days left as tiny text below if needed, or keep it minimal */}
            </div>
        );
    };

    const renderMonthly = (goal, filteredHistory) => {
        // Mini Heatmap: Last 30 days
        const days = Array.from({ length: 30 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (29 - i));
            return d;
        });

        return (
            <div style={{ display: 'flex', gap: '3px', marginTop: '0.25rem', justifyContent: 'flex-start' }}>
                {days.map((d, i) => {
                    const hasActivity = filteredHistory.some(h => {
                        const hDate = new Date(h.timestamp);
                        return hDate.getDate() === d.getDate() && hDate.getMonth() === d.getMonth();
                    });
                    return (
                        <div key={i} style={{
                            width: '4px', height: '12px', borderRadius: '1px',
                            background: hasActivity ? 'var(--success)' : 'rgba(255,255,255,0.1)',
                            opacity: hasActivity ? 1 : 0.3
                        }} title={d.toLocaleDateString()} />
                    );
                })}
            </div>
        );
    };

    const renderQuarterly = (goal, filteredHistory, startDate) => {
        // Simple Sparkline: Activity counts per week for 12 weeks
        // This is a simplified visual
        const weeks = 12;
        const data = new Array(weeks).fill(0);

        // Bucket history into weeks relative to start date
        filteredHistory.forEach(h => {
            const hDate = new Date(h.timestamp);
            const diffTime = Math.abs(hDate - startDate);
            const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
            if (diffWeeks < weeks) data[diffWeeks]++;
        });

        const max = Math.max(...data, 1);

        return (
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '20px', gap: '3px', marginTop: '0.25rem' }}>
                {data.map((val, i) => (
                    <div key={i} style={{
                        flex: 1,
                        height: `${Math.max(10, (val / max) * 100)}%`, // Ensure at least some height for visibility
                        background: val > 0 ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                        borderRadius: '1px',
                    }} />
                ))}
            </div>
        );
    };


    const filteredGoals = smartGoals.filter(g => g.period === activeTab);

    if (smartGoals.length === 0) return null;

    return (
        <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <TrendingUp size={18} /> Goal Tracker
                </h3>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
                    {['weekly', 'monthly', 'quarterly'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.8rem', textTransform: 'capitalize',
                                background: activeTab === tab ? 'var(--bg-tertiary)' : 'transparent',
                                color: activeTab === tab ? 'white' : 'var(--text-muted)',
                                border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                fontWeight: activeTab === tab ? 600 : 400
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {filteredGoals.length === 0 ? (
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No {activeTab} goals set.
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {filteredGoals.map(goal => {
                            const { current, percent, filteredHistory, startDate } = getProgress(goal);
                            const isComplete = percent >= 100;

                            return (
                                <div key={goal.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {/* Header Row */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>{goal.title}</h4>
                                            <div style={{
                                                fontSize: '0.8rem',
                                                color: isComplete ? 'var(--success)' : 'var(--text-muted)',
                                                background: isComplete ? 'rgba(52, 211, 153, 0.1)' : 'rgba(255,255,255,0.05)',
                                                padding: '2px 8px', borderRadius: '4px'
                                            }}>
                                                {current} / {goal.target_value}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', opacity: 0.5 }}>
                                            <button onClick={() => onEdit(goal)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Pencil size={12} /></button>
                                            <button onClick={() => deleteSmartGoal(goal.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Trash2 size={12} /></button>
                                        </div>
                                    </div>

                                    {/* Visual Row */}
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        {activeTab === 'weekly' && renderWeekly(goal, current, percent, startDate)}
                                        {activeTab === 'monthly' && renderMonthly(goal, filteredHistory)}
                                        {activeTab === 'quarterly' && renderQuarterly(goal, filteredHistory, startDate)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
}
