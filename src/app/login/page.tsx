'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            setError('メールアドレスまたはパスワードが正しくありません')
            setLoading(false)
        } else {
            router.push('/dashboard')
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg)',
            fontFamily: 'var(--font-family)',
        }}>
            <div style={{
                width: '100%',
                maxWidth: 400,
                padding: '48px 40px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 16,
                boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
            }}>
                {/* ロゴ */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'var(--color-brand)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, fontWeight: 800, color: '#fff',
                    }}>T</div>
                    <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>Taskal</span>
                </div>

                <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>
                    ログイン
                </h1>
                <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginBottom: 32 }}>
                    Taskalアカウントにサインインしてください
                </p>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label className="text-section-label" style={{ display: 'block', marginBottom: 6 }}>
                            Email
                        </label>
                        <input
                            type="email"
                            className="select"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            required
                            style={{ backgroundImage: 'none', cursor: 'text', width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label className="text-section-label" style={{ display: 'block', marginBottom: 6 }}>
                            Password
                        </label>
                        <input
                            type="password"
                            className="select"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            style={{ backgroundImage: 'none', cursor: 'text', width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>

                    {error && (
                        <p style={{ fontSize: 13, color: 'var(--color-danger)', margin: 0, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ marginTop: 8, width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? '認証中...' : 'ログイン'}
                    </button>
                </form>
            </div>
        </div>
    )
}
