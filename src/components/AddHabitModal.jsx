import { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import { Brain, Dumbbell, Utensils, Moon, Briefcase, Coffee, Music, Sun, Heart, Smile } from 'lucide-react';

const ICONS = [
    { name: 'Brain', icon: Brain },
    { name: 'Dumbbell', icon: Dumbbell },
    { name: 'Utensils', icon: Utensils },
    { name: 'Moon', icon: Moon },
    { name: 'Briefcase', icon: Briefcase },
    { name: 'Coffee', icon: Coffee },
    { name: 'Music', icon: Music },
    { name: 'Sun', icon: Sun },
    { name: 'Heart', icon: Heart },
    { name: 'Smile', icon: Smile },
];

export default function AddHabitModal({ isOpen, onClose, initialData }) {
    const { addHabit, updateHabit } = useHabits();

    const [name, setName] = useState('');
    const [type, setType] = useState('good');
    const [value, setValue] = useState(10);
    const [cost, setCost] = useState(10);
    const [icon, setIcon] = useState('Brain');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setType(initialData.type);
            if (initialData.type === 'good') setValue(initialData.value);
            else setCost(initialData.cost);
            setIcon(initialData.icon);
        } else {
            // Reset defaults
            setName('');
            setType('good');
            setValue(10);
            setCost(10);
            setIcon('Brain');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (initialData) {
            updateHabit(initialData.id, {
                name,
                type,
                value: type === 'good' ? parseInt(value) : null,
                cost: type === 'bad' ? parseInt(cost) : null,
                icon
            });
        } else {
            addHabit({
                name,
                type,
                value: type === 'good' ? parseInt(value) : null,
                cost: type === 'bad' ? parseInt(cost) : null,
                icon
            });
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
                <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>{initialData ? 'Edit Habit' : 'Create New Habit'}</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Habit Name</label>
                        <input
                            value={name} onChange={e => setName(e.target.value)}
                            placeholder="e.g. Morning Meditation"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', border: 'none', color: 'white' }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Type</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="button"
                                onClick={() => setType('good')}
                                style={{
                                    flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                                    background: type === 'good' ? 'var(--success)' : 'var(--bg-tertiary)',
                                    opacity: type === 'good' ? 1 : 0.5
                                }}>Good (Earn)</button>
                            <button type="button"
                                onClick={() => setType('bad')}
                                style={{
                                    flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                                    background: type === 'bad' ? 'var(--danger)' : 'var(--bg-tertiary)',
                                    opacity: type === 'bad' ? 1 : 0.5
                                }}>Bad (Spend)</button>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            {type === 'good' ? 'Points Reward' : 'Points Cost'}
                        </label>
                        <input
                            type="number"
                            value={type === 'good' ? value : cost}
                            onChange={e => type === 'good' ? setValue(e.target.value) : setCost(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', border: 'none', color: 'white' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Icon</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                            {ICONS.map(i => {
                                const Icon = i.icon;
                                return (
                                    <button
                                        key={i.name}
                                        type="button"
                                        onClick={() => setIcon(i.name)}
                                        style={{
                                            padding: '0.5rem', aspectRatio: '1', borderRadius: 'var(--radius-sm)',
                                            background: icon === i.name ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                    >
                                        <Icon size={20} />
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <button type="submit" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                        {initialData ? 'Update Habit' : 'Create Habit'}
                    </button>

                </form>
            </div>
        </div>
    );
}
