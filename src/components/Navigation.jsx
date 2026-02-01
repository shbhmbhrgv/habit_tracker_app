import { LayoutDashboard, Calendar, Book, FileText, Briefcase } from 'lucide-react';

export default function Navigation({ activeTab, onTabChange }) {
    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'progress', label: 'Calendar', icon: Calendar },
        { id: 'books', label: 'Bookshelf', icon: Book },
        { id: 'papers', label: 'Papers', icon: FileText },
        { id: 'projects', label: 'Projects', icon: Briefcase },
    ];

    return (
        <nav style={{
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center'
        }}>
            {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        style={{
                            background: 'transparent',
                            color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.9rem',
                            fontWeight: isActive ? 600 : 400,
                            padding: '0.5rem',
                            borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                            borderRadius: 0 // explicit for link style
                        }}
                    >
                        {/* Hide icons on mobile for cleaner look if needed, but keep for now */}
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
