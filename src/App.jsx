import { useState } from 'react';
import { HabitProvider, useHabits } from './context/HabitContext';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import ResourceTracker from './components/ResourceTracker';
import CalendarView from './components/CalendarView';
import Auth from './components/Auth';
import { config } from './config';
import './App.css';

function MainApp() {
  const { session, loading, signOut } = useHabits();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  if (!session) return <Auth />;

  // Access Control
  console.log('Current User Email:', session?.user?.email);
  console.log('Allowed Email Config:', config.allowedEmail);

  if (config.allowedEmail && session.user.email !== config.allowedEmail) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <h2>Access Denied</h2>
        <p>You are not authorized to view this application.</p>
        <button onClick={signOut} style={{ padding: '0.5rem 1rem' }}>Sign Out</button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header style={{
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--bg-tertiary)'
      }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Daily Flow</h1>
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </header>

      <main style={{ minHeight: '400px' }}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'progress' && <CalendarView />}
        {(activeTab === 'books' || activeTab === 'papers' || activeTab === 'projects') && (
          <ResourceTracker filterCategory={activeTab === 'books' ? 'book' : activeTab === 'papers' ? 'paper' : 'project'} />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <HabitProvider>
      <MainApp />
    </HabitProvider>
  )
}

export default App;
