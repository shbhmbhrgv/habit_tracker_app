import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { Book, FileText, Briefcase, Plus, Trash2, CheckCircle } from 'lucide-react';

export default function ResourceTracker({ filterCategory }) {
    const { resources, addResource, updateResource, deleteResource } = useHabits();
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(filterCategory || 'book'); // book, paper, project
    const [total, setTotal] = useState(''); // e.g. pages, milestones
    const [current, setCurrent] = useState('');

    // Update form category if prop changes
    if (filterCategory && category !== filterCategory && !isAdding) {
        setCategory(filterCategory);
    }

    const filteredResources = filterCategory
        ? resources.filter(r => r.category === filterCategory)
        : resources;

    const handleSubmit = (e) => {
        e.preventDefault();
        addResource({
            title,
            category,
            total: parseInt(total) || 100, // Default to percentage if no total
            current: parseInt(current) || 0,
            status: 'active'
        });
        setIsAdding(false);
        setTitle('');
        setTotal('');
        setCurrent('');
    };

    const getIcon = (cat) => {
        switch (cat) {
            case 'book': return Book;
            case 'paper': return FileText;
            case 'project': return Briefcase;
            default: return Book;
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                    {filterCategory ? `${filterCategory}s` : 'Library & Projects'}
                </h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    style={{
                        background: 'var(--accent-primary)', color: 'white',
                        borderRadius: '50%', width: '36px', height: '36px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <Plus size={20} />
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        placeholder="Title (e.g. Pragmatic Programmer)"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        style={{
                            width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--bg-tertiary)', background: 'rgba(0,0,0,0.2)',
                            color: 'white', boxSizing: 'border-box'
                        }}
                        required
                        autoFocus
                    />
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {!filterCategory && (
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', color: 'white', border: 'none' }}
                            >
                                <option value="book">Book</option>
                                <option value="paper">Paper</option>
                                <option value="project">Project</option>
                            </select>
                        )}
                        <input
                            type="number"
                            placeholder="Total (Pages/Steps)"
                            value={total}
                            onChange={e => setTotal(e.target.value)}
                            style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', color: 'white', border: 'none' }}
                        />
                    </div>
                    <button type="submit" style={{ padding: '0.75rem', background: 'var(--success)', color: 'white', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                        Add Resource
                    </button>
                </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredResources.length === 0 && !isAdding && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No {filterCategory || 'resources'} tracked yet. Add one!
                    </div>
                )}

                {filteredResources.map(res => {
                    const Icon = getIcon(res.category);
                    const percent = Math.min(100, Math.round((res.current / res.total) * 100));

                    return (
                        <div key={res.id} className="glass-panel" style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ color: 'var(--accent-primary)' }}><Icon size={20} /></div>
                                    <span style={{ fontWeight: 500 }}>{res.title}</span>
                                </div>
                                <button
                                    onClick={() => deleteResource(res.id)}
                                    style={{ color: 'var(--text-muted)', opacity: 0.6 }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                                <div style={{ width: `${percent}%`, height: '100%', background: percent === 100 ? 'var(--success)' : 'var(--accent-primary)', transition: 'width 0.3s ease' }} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <span>{percent}% Complete ({res.current} / {res.total})</span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => updateResource(res.id, { current: Math.min(res.total, res.current + 1) })}
                                        style={{ background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}
                                    >
                                        +1
                                    </button>
                                    <button
                                        onClick={() => updateResource(res.id, { current: Math.min(res.total, res.current + 10) })}
                                        style={{ background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}
                                    >
                                        +10
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
