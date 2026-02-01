import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        const { error } = await supabase.auth.signInWithOtp({ email })
        if (error) {
            alert(error.error_description || error.message)
        } else {
            setSent(true)
        }
        setLoading(false)
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Sign in via magic link to sync your data across devices.</p>

                {sent ? (
                    <div style={{ color: 'var(--success)' }}>
                        Check your email for the login link!
                    </div>
                ) : (
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            type="email"
                            placeholder="Your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                padding: '1rem', borderRadius: 'var(--radius-sm)',
                                background: 'var(--bg-tertiary)', border: 'none', color: 'white'
                            }}
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '1rem',
                                background: 'var(--accent-primary)',
                                color: 'white',
                                borderRadius: 'var(--radius-sm)',
                                fontWeight: 600,
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Sending link...' : 'Send Magic Link'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
