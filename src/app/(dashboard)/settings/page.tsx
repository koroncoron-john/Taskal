'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from '../tasks/page.module.css'
import { useToast } from '@/components/Toast/Toast'

export default function SettingsPage() {
    const supabase = createClient()
    const router = useRouter()
    const { showToast } = useToast()
    const [email, setEmail] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isGoogleUser, setIsGoogleUser] = useState(false)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setEmail(user.email || '')
                setDisplayName(user.user_metadata?.full_name || user.email?.split('@')[0] || '')
                // Google OAuthユーザー判定
                const provider = user.app_metadata?.provider
                setIsGoogleUser(provider === 'google')
            }
        }
        getUser()
    }, [])

    const handleUpdateProfile = async () => {
        setLoading(true)
        const { error } = await supabase.auth.updateUser({
            data: { full_name: displayName }
        })
        setLoading(false)
        if (error) showToast('プロフィールの更新に失敗しました', 'error')
        else showToast('プロフィールを更新しました', 'success')
    }

    const handleUpdatePassword = async () => {
        if (newPassword !== confirmPassword) {
            showToast('パスワードが一致しません', 'error')
            return
        }
        if (newPassword.length < 6) {
            showToast('パスワードは6文字以上で入力してください', 'error')
            return
        }
        setLoading(true)
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        setLoading(false)
        if (error) showToast('パスワードの更新に失敗しました', 'error')
        else {
            showToast('パスワードを更新しました', 'success')
            setNewPassword('')
            setConfirmPassword('')
        }
    }

    return (
        <div>
            <div className={styles.header}>
                <h1 className="text-page-title">Profile Settings</h1>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 560 }}>
                {/* プロフィール */}
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 20 }}>プロフィール</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label className="text-section-label">Email</label>
                            <input type="email" className="select" value={email} disabled
                                style={{ backgroundImage: 'none', opacity: 0.6, cursor: 'not-allowed' }} />
                            <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 4 }}>メールアドレスは変更できません</p>
                        </div>
                        <div>
                            <label className="text-section-label">Display Name</label>
                            <input type="text" className="select" value={displayName} onChange={e => setDisplayName(e.target.value)}
                                style={{ backgroundImage: 'none', cursor: 'text' }} />
                        </div>
                        <button className="btn btn-primary" onClick={handleUpdateProfile} disabled={loading} style={{ alignSelf: 'flex-start' }}>
                            {loading ? '更新中...' : 'Save'}
                        </button>
                    </div>
                </div>

                {/* パスワード変更 */}
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24, opacity: isGoogleUser ? 0.5 : 1, pointerEvents: isGoogleUser ? 'none' : 'auto' }}>
                    <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: isGoogleUser ? 8 : 20 }}>パスワード変更</h2>
                    {isGoogleUser ? (
                        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                            Googleアカウントでログインしているため、パスワード変更は不要です。
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label className="text-section-label">New Password</label>
                                <input type="password" className="select" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                    placeholder="••••••••" style={{ backgroundImage: 'none', cursor: 'text' }} />
                            </div>
                            <div>
                                <label className="text-section-label">Confirm Password</label>
                                <input type="password" className="select" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••" style={{ backgroundImage: 'none', cursor: 'text' }} />
                            </div>
                            <button className="btn btn-primary" onClick={handleUpdatePassword} disabled={loading} style={{ alignSelf: 'flex-start' }}>
                                {loading ? '更新中...' : 'パスワードを変更'}
                            </button>
                        </div>
                    )}
                </div>

                {/* ログアウト */}
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24 }}>
                    <button
                        onClick={async () => { await supabase.auth.signOut(); router.replace('/login') }}
                        style={{ width: '100%', padding: '14px', background: 'none', border: '1px solid var(--color-danger)', borderRadius: 8, color: 'var(--color-danger)', cursor: 'pointer', fontSize: 15, fontWeight: 600, letterSpacing: '0.05em' }}
                    >
                        LOGOUT
                    </button>
                </div>
            </div>
        </div>
    )
}
