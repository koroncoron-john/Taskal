'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
)

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()
    const [mode, setMode] = useState<'login' | 'signup'>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) {
                setError('メールアドレスまたはパスワードが正しくありません')
                setLoading(false)
            } else {
                router.push('/dashboard')
            }
        } else {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: displayName } }
            })
            if (error) {
                setError(error.message)
                setLoading(false)
            } else {
                setSuccess('確認メールを送信しました。メールを確認してアカウントを有効化してください。')
                setLoading(false)
            }
        }
    }

    const handleGoogleLogin = async () => {
        setGoogleLoading(true)
        setError('')
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${location.origin}/dashboard`,
                }
            })
            if (error) {
                setError('Googleログインに失敗しました: ' + error.message)
                setGoogleLoading(false)
            }
            // 成功時はGoogleにリダイレクトされるのでloadingはそのまま
        } catch (e: any) {
            setError('Googleログインエラー: ' + (e?.message || JSON.stringify(e)))
            setGoogleLoading(false)
        }
    }

    const switchMode = (newMode: 'login' | 'signup') => {
        setMode(newMode)
        setError('')
        setSuccess('')
        setEmail('')
        setPassword('')
        setDisplayName('')
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            background: 'var(--color-bg)',
            fontFamily: 'var(--font-family)',
            padding: '16px',
            paddingTop: 'clamp(64px, 10vw, 128px)',
        }}>
            <div style={{
                width: '100%',
                maxWidth: 400,
                padding: '48px clamp(16px, 5vw, 40px)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 16,
                boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
            }}>
                {/* ロゴ */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'var(--color-brand)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, fontWeight: 800, color: '#fff',
                    }}>T</div>
                    <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>Taskal</span>
                </div>

                {/* ログイン / 新規登録 タブ */}
                <div style={{
                    display: 'flex',
                    background: 'var(--color-bg)',
                    borderRadius: 8,
                    padding: 4,
                    marginBottom: 28,
                    gap: 4,
                }}>
                    {(['login', 'signup'] as const).map(m => (
                        <button
                            key={m}
                            onClick={() => switchMode(m)}
                            style={{
                                flex: 1,
                                padding: '8px 0',
                                fontSize: 13,
                                fontWeight: mode === m ? 600 : 400,
                                background: mode === m ? 'var(--color-brand)' : 'transparent',
                                color: mode === m ? '#fff' : 'var(--color-text-tertiary)',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            {m === 'login' ? 'ログイン' : '新規登録'}
                        </button>
                    ))}
                </div>

                {/* Google認証ボタン */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        padding: '10px 16px',
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 500,
                        color: 'var(--color-text-primary)',
                        cursor: googleLoading ? 'not-allowed' : 'pointer',
                        opacity: googleLoading ? 0.7 : 1,
                        marginBottom: 20,
                        transition: 'all 0.15s',
                    }}
                >
                    <GoogleIcon />
                    {googleLoading ? '接続中...' : 'Googleで続ける'}
                </button>

                {/* 区切り線 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                    <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>または</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                </div>

                {/* フォーム */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {mode === 'signup' && (
                        <div>
                            <label className="text-section-label" style={{ display: 'block', marginBottom: 6 }}>Display Name</label>
                            <input
                                type="text"
                                className="select"
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                placeholder="お名前"
                                style={{ backgroundImage: 'none', cursor: 'text', width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>
                    )}
                    <div>
                        <label className="text-section-label" style={{ display: 'block', marginBottom: 6 }}>Email</label>
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
                        <label className="text-section-label" style={{ display: 'block', marginBottom: 6 }}>Password</label>
                        <input
                            type="password"
                            className="select"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            style={{ backgroundImage: 'none', cursor: 'text', width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>

                    {error && (
                        <p style={{ fontSize: 13, color: 'var(--color-danger)', margin: 0, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>
                            ⚠️ {error}
                        </p>
                    )}
                    {success && (
                        <p style={{ fontSize: 13, color: '#22c55e', margin: 0, padding: '8px 12px', background: 'rgba(34,197,94,0.08)', borderRadius: 8 }}>
                            ✅ {success}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ marginTop: 4, width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? '処理中...' : mode === 'login' ? 'ログイン' : 'アカウント作成'}
                    </button>
                </form>
            </div>
        </div>
    )
}
