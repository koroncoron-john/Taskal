'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from '../tasks/page.module.css'

export default function SettingsPage() {
    const supabase = createClient()
    const [email, setEmail] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setEmail(user.email || '')
                setDisplayName(user.user_metadata?.full_name || user.email?.split('@')[0] || '')
            }
        }
        getUser()
    }, [])

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 4000)
    }

    const handleUpdateProfile = async () => {
        setLoading(true)
        const { error } = await supabase.auth.updateUser({
            data: { full_name: displayName }
        })
        setLoading(false)
        if (error) showMessage('error', 'プロフィールの更新に失敗しました')
        else showMessage('success', 'プロフィールを更新しました')
    }

    const handleUpdatePassword = async () => {
        if (newPassword !== confirmPassword) {
            showMessage('error', 'パスワードが一致しません')
            return
        }
        if (newPassword.length < 6) {
            showMessage('error', 'パスワードは6文字以上で入力してください')
            return
        }
        setLoading(true)
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        setLoading(false)
        if (error) showMessage('error', 'パスワードの更新に失敗しました')
        else {
            showMessage('success', 'パスワードを更新しました')
            setNewPassword('')
            setConfirmPassword('')
        }
    }

    return (
        <div>
            <div className={styles.header}>
                <h1 className="text-page-title">Profile Settings</h1>
            </div>

            {message && (
                <div style={{
                    padding: '12px 24px', marginBottom: 16, borderRadius: 'var(--border-radius)', fontWeight: 500, fontSize: 14,
                    background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)',
                    color: message.type === 'success' ? '#22c55e' : 'var(--color-danger)',
                }}>
                    {message.type === 'success' ? '✅' : '⚠️'} {message.text}
                </div>
            )}

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
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 20 }}>パスワード変更</h2>
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
                </div>
            </div>
        </div>
    )
}
