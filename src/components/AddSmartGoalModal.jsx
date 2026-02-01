import { useState, useEffect, useMemo } from 'react';
import { useHabits } from '../context/HabitContext';
import { Target, Calendar, Activity } from 'lucide-react';

export default function AddSmartGoalModal({ isOpen, onClose, initialData = null }) {
    const { habits, addSmartGoal, updateSmartGoal } = useHabits();
    // Memoize to prevent effect loop
    const goodHabits = useMemo(() => habits.filter(h => h.type === 'good'), [habits]);

    const [title, setTitle] = useState(initialData?.title || '');
    const [period, setPeriod] = useState(initialData?.period || 'weekly'); // weekly, monthly, quarterly
    const [targetType, setTargetType] = useState(initialData?.target_type || 'habit'); // habit, points
    const [targetValue, setTargetValue] = useState(initialData?.target_value || 3);
    const [targetId, setTargetId] = useState(initialData?.target_id || (goodHabits.length > 0 ? goodHabits[0].id : ''));

    // Reset form state when modal opens or initialData changes
    useEffect(() => {
        if (isOpen) {
            setTitle(initialData?.title || '');
            setPeriod(initialData?.period || 'weekly');
            setTargetType(initialData?.target_type || 'habit');
            setTargetValue(initialData?.target_value || 3);
            setTargetId(initialData?.target_id || (goodHabits.length > 0 ? goodHabits[0].id : ''));
        }
    }, [isOpen, initialData, goodHabits]);


    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const goalData = {
            title,
            period,
            target_type: targetType,
            target_value: parseInt(targetValue),
            target_id: targetId
        };

        if (initialData) {
            updateSmartGoal(initialData.id, goalData);
        } else {
            addSmartGoal(goalData);
        }
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <div
                className="glass-panel"
                style={{ width: '90%', maxWidth: '400px', padding: '2rem' }}
                onClick={e => e.stopPropagation()}
            >
                <h2 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Target className="text-accent" /> {initialData ? 'Edit Goal' : 'Set New Goal'}
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Goal Title</label>
                        <input
                            value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Run 3 Times a Week"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', border: 'none', color: 'white' }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Time Period</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                            {['weekly', 'monthly', 'quarterly'].map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPeriod(p)}
                                    style={{
                                        padding: '0.5rem', borderRadius: 'var(--radius-sm)',
                                        background: period === p ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                        color: period === p ? 'white' : 'var(--text-muted)',
                                        textTransform: 'capitalize', fontSize: '0.85rem'
                                    }}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Target Type</label>
                        <select
                            value={targetType} onChange={e => setTargetType(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', border: 'none', color: 'white' }}
                        >
                            <option value="habit">Specific Activity Count</option>
                            <option value="points">Total Points Earned</option>
                        </select>
                    </div>

                    {(targetType === 'habit' || targetType === 'points') && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Select Activity</label>
                            <select
                                value={targetId} onChange={e => setTargetId(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', border: 'none', color: 'white' }}
                            >
                                {goodHabits.map(h => (
                                    <option key={h.id} value={h.id}>{h.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            Target Value
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <input
                                type="number"
                                value={targetValue}
                                onChange={e => setTargetValue(e.target.value)}
                                style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', border: 'none', color: 'white' }}
                                min="1"
                            />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                {targetType === 'habit' ? 'times' : 'points'}
                            </span>
                        </div>
                    </div>

                    <button type="submit" style={{ marginTop: '1rem', padding: '1rem', background: 'white', color: 'black', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                        {initialData ? 'Update Goal' : 'Create Goal'}
                    </button>

                </form>
            </div>
        </div>
    );
}
