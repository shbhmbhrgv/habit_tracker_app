import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { getIcon } from '../utils/iconMap';
import AddHabitModal from './AddHabitModal';
import AddSmartGoalModal from './AddSmartGoalModal';
import GoalDashboardWidget from './GoalDashboardWidget';
import { PlusCircle, Pencil, Trash2, Target } from 'lucide-react';

/* Inline styles for iteration speed, can move to CSS modules later */
const cardStyle = {
    padding: '1.5rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'transform 0.1s ease, border-color 0.2s ease',
    cursor: 'pointer',
};

export default function Dashboard() {
    const { points, habits, logActivity, deleteHabit, history, deleteActivity } = useHabits();
    const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [editHabit, setEditHabit] = useState(null);
    const [editGoal, setEditGoal] = useState(null);

    const goodHabits = habits.filter(h => h.type === 'good');
    const badHabits = habits.filter(h => h.type === 'bad');

    // Filter for TODAY's history and sort newest first
    const recentHistory = [...history]
        .filter(item => {
            const date = new Date(item.timestamp);
            const today = new Date();
            return date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const openEdit = (e, habit) => {
        e.stopPropagation();
        setEditHabit(habit);
        setIsHabitModalOpen(true);
    };

    const openNew = () => {
        setEditHabit(null);
        setIsHabitModalOpen(true);
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (confirm('Delete this habit?')) deleteHabit(id);
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Header / Balance Card */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="glow-text" style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(to right, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Habit Tracker
                    </h1>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Build your streak. Master your day.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => { setEditGoal(null); setIsGoalModalOpen(true); }}
                        style={{
                            padding: '0.75rem 1.5rem', background: 'transparent', color: 'var(--text-primary)',
                            border: '1px solid var(--text-muted)', borderRadius: 'var(--radius-md)', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'
                        }}
                    >
                        <Target size={20} /> Set Goal
                    </button>
                    <button
                        onClick={openNew}
                        style={{
                            padding: '0.75rem 1.5rem', background: 'var(--accent-primary)', color: 'white',
                            border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'
                        }}
                    >
                        <PlusCircle size={20} /> New Habit
                    </button>
                </div>
            </header>

            {/* Smart Goals Widget */}
            <GoalDashboardWidget onEdit={(goal) => { setEditGoal(goal); setIsGoalModalOpen(true); }} />

            {/* Earn Section */}
            <section>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>
                    Earn
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                    {goodHabits.map(habit => {
                        const Icon = getIcon(habit.icon);
                        return (
                            <div
                                key={habit.id}
                                className="glass-panel"
                                onClick={() => logActivity(habit.id)}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--success-glow)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 20px -10px var(--success-glow)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                style={{
                                    padding: '1.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '1rem',
                                    aspectRatio: '1',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{
                                    background: 'rgba(52, 211, 153, 0.1)',
                                    padding: '1rem',
                                    borderRadius: '50%',
                                    color: 'var(--success)',
                                    marginBottom: '0.25rem'
                                }}>
                                    <Icon size={32} strokeWidth={1.5} />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>{habit.name}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>+{habit.value} pts</span>
                                </div>
                                {/* Hover Controls */}
                                <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
                                    <div onClick={(e) => openEdit(e, habit)} style={{ padding: 4, opacity: 0.6, cursor: 'pointer' }} title="Edit"><Pencil size={14} /></div>
                                    <div onClick={(e) => handleDelete(e, habit.id)} style={{ padding: 4, opacity: 0.6, cursor: 'pointer' }} title="Delete"><Trash2 size={14} /></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Spend Section */}
            <section>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>
                    Spend
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                    {badHabits.map(habit => {
                        const Icon = getIcon(habit.icon);
                        return (
                            <div
                                key={habit.id}
                                className="glass-panel"
                                onClick={() => logActivity(habit.id)}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--danger-glow)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 20px -10px var(--danger-glow)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                style={{
                                    padding: '1.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '1rem',
                                    aspectRatio: '1',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    padding: '1rem',
                                    borderRadius: '50%',
                                    color: 'var(--danger)',
                                    marginBottom: '0.25rem'
                                }}>
                                    <Icon size={32} strokeWidth={1.5} />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>{habit.name}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 600 }}>-{habit.cost} pts</span>
                                </div>
                                {/* Hover Controls */}
                                <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
                                    <div onClick={(e) => openEdit(e, habit)} style={{ padding: 4, opacity: 0.6, cursor: 'pointer' }} title="Edit"><Pencil size={14} /></div>
                                    <div onClick={(e) => handleDelete(e, habit.id)} style={{ padding: 4, opacity: 0.6, cursor: 'pointer' }} title="Delete"><Trash2 size={14} /></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* History Preview */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Today's Log</h3>
                </div>
                <div className="glass-panel" style={{ padding: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                    {recentHistory.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>No activity yet today</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {recentHistory.map((item, idx) => (
                                <div key={idx} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    fontSize: '0.9rem', paddingBottom: '0.5rem',
                                    borderBottom: idx !== recentHistory.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ color: item.change > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 500 }}>
                                            {item.change > 0 ? '+' : ''}{item.change}
                                        </span>
                                        <button
                                            onClick={() => deleteActivity(item.id)}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                                            title="Undo/Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <AddHabitModal
                isOpen={isHabitModalOpen}
                onClose={() => setIsHabitModalOpen(false)}
                initialData={editHabit}
            />
            <AddSmartGoalModal
                isOpen={isGoalModalOpen}
                onClose={() => setIsGoalModalOpen(false)}
                initialData={editGoal}
            />
        </div >
    );
}
