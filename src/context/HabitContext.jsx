import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const HabitContext = createContext();

export function HabitProvider({ children }) {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    const [points, setPoints] = useState(0);
    const [habits, setHabits] = useState([]);
    const [history, setHistory] = useState([]);
    const [resources, setResources] = useState([]);
    const [goals, setGoals] = useState([]); // Old goals (Legacy)
    const [smartGoals, setSmartGoals] = useState([]); // New system

    // Auth & Initial Fetch
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchData();
            else setLoading(false);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) fetchData();
            else setLoading(false);
        });
    }, []);

    const fetchData = async () => {
        setLoading(true);
        // 1. Habits
        const { data: hData } = await supabase.from('habits').select('*').order('created_at', { ascending: true });
        if (hData) setHabits(hData);

        // 2. Activities (for history and points calculation)
        const { data: aData } = await supabase.from('activities').select('*').order('timestamp', { ascending: false }).limit(100);
        if (aData) setHistory(aData);

        // Calculate total points from ALL history (needs separate query or aggregation if history is paginated, but for now simple sum)
        // For scalability, we should use a balance table or RPC, but let's query a sum.
        // Optimization: Just trust the balance table for now or calculate from recent if small app.
        // Let's implement a simple balance check.
        const { data: bData } = await supabase.from('balance').select('points').single();
        if (bData) setPoints(bData.points);
        else {
            // Init balance if not exists
            const user = (await supabase.auth.getUser()).data.user;
            if (user) await supabase.from('balance').insert({ user_id: user.id, points: 0 });
        }

        // 3. Resources
        const { data: rData } = await supabase.from('resources').select('*').order('created_at', { ascending: true });
        if (rData) setResources(rData);

        // 4. Goals
        const { data: gData } = await supabase.from('goals').select('*');
        if (gData) setGoals(gData);

        // 5. Smart Goals
        const { data: sgData } = await supabase.from('smart_goals').select('*');
        if (sgData) setSmartGoals(sgData);

        setLoading(false);
    };

    // --- Actions ---

    const logActivity = async (habitId) => {
        const habit = habits.find(h => h.id === habitId);
        if (!habit || !session) return;

        const change = habit.type === 'good' ? habit.value : -habit.cost;
        const newPoints = points + change;

        // Optiomistic UI update
        setPoints(newPoints);
        const newActivity = {
            id: crypto.randomUUID(), // temp ID until refresh
            habit_id: habit.id,
            name: habit.name,
            change,
            timestamp: new Date().toISOString()
        };
        setHistory(prev => [newActivity, ...prev]);

        // DB Updates
        await supabase.from('activities').insert({
            user_id: session.user.id,
            habit_id: habit.id,
            name: habit.name,
            change
        });

        // Update balance
        const { error } = await supabase.from('balance').upsert({ user_id: session.user.id, points: newPoints, updated_at: new Date() });
        if (error) console.error("Balance update failed", error);
    };

    const addHabit = async (habit) => {
        if (!session) return;
        // Optimistic
        const tempId = crypto.randomUUID();
        setHabits(prev => [...prev, { ...habit, id: tempId }]);

        const { data, error } = await supabase.from('habits').insert({
            user_id: session.user.id,
            ...habit
        }).select().single();

        if (data) {
            setHabits(prev => prev.map(h => h.id === tempId ? data : h));
        }
    };

    const deleteHabit = async (id) => {
        setHabits(prev => prev.filter(h => h.id !== id));
        await supabase.from('habits').delete().eq('id', id);
    };

    const updateHabit = async (id, updates) => {
        setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
        await supabase.from('habits').update(updates).eq('id', id);
    };

    const addResource = async (resource) => {
        if (!session) return;
        const tempId = crypto.randomUUID();
        setResources(prev => [...prev, { ...resource, id: tempId }]);

        const { data } = await supabase.from('resources').insert({
            user_id: session.user.id,
            ...resource
        }).select().single();

        if (data) {
            setResources(prev => prev.map(r => r.id === tempId ? data : r));
        }
    };

    const updateResource = async (id, updates) => {
        setResources(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
        await supabase.from('resources').update(updates).eq('id', id);
    };

    const deleteResource = async (id) => {
        setResources(prev => prev.filter(r => r.id !== id));
        await supabase.from('resources').delete().eq('id', id);
    };

    const addGoal = async (goal) => {
        if (!session) return;
        const tempId = crypto.randomUUID();
        setGoals(prev => [...prev, { ...goal, id: tempId }]);

        const { data } = await supabase.from('goals').insert({
            user_id: session.user.id,
            ...goal
        }).select().single();
        if (data) {
            setGoals(prev => prev.map(g => g.id === tempId ? data : g));
        }
    };

    const deleteGoal = async (id) => {
        setGoals(prev => prev.filter(g => g.id !== id));
        await supabase.from('goals').delete().eq('id', id);
    };

    const addSmartGoal = async (goal) => {
        if (!session) return;
        const tempId = crypto.randomUUID();
        setSmartGoals(prev => [...prev, { ...goal, id: tempId }]);

        const { data } = await supabase.from('smart_goals').insert({
            user_id: session.user.id,
            ...goal
        }).select().single();
        if (data) {
            setSmartGoals(prev => prev.map(g => g.id === tempId ? data : g));
        }
    };

    const updateSmartGoal = async (id, updates) => {
        setSmartGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
        await supabase.from('smart_goals').update(updates).eq('id', id);
    };

    const deleteSmartGoal = async (id) => {
        setSmartGoals(prev => prev.filter(g => g.id !== id));
        await supabase.from('smart_goals').delete().eq('id', id);
    };

    const deleteActivity = async (id) => {
        if (!session) return;
        const activity = history.find(a => a.id === id);
        if (!activity) return;

        // Optimistic Revert
        const newPoints = points - activity.change;
        setPoints(newPoints);
        setHistory(prev => prev.filter(a => a.id !== id));

        // DB Updates
        await supabase.from('activities').delete().eq('id', id);
        await supabase.from('balance').upsert({ user_id: session.user.id, points: newPoints, updated_at: new Date() });
    };

    return (
        <HabitContext.Provider value={{
            session, loading,
            points, habits, history, resources, goals, smartGoals,
            logActivity, addHabit, deleteHabit, updateHabit,
            deleteActivity,
            addResource, updateResource, deleteResource,
            addGoal, deleteGoal, addSmartGoal, deleteSmartGoal, updateSmartGoal
        }}>
            {children}
        </HabitContext.Provider>
    );
}

export const useHabits = () => useContext(HabitContext);
