'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar/Sidebar'
import styles from './layout.module.css'
import { createClient } from '@/lib/supabase/client'
import { ToastProvider } from '@/components/Toast/Toast'
import UpdateBanner from '@/components/UpdateBanner/UpdateBanner'
import { DataProvider } from '@/contexts/DataProvider'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const supabase = createClient()
    const [collapsed, setCollapsed] = useState(false)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        // まずgetSessionでURLハッシュのトークンを処理
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setChecked(true)
            } else {
                router.replace('/login')
            }
        })

        // OAuth後のセッション確立を検知
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setChecked(true)
            } else {
                router.replace('/login')
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    return (
        <DataProvider>
            <ToastProvider>
                <UpdateBanner />
                {checked && (
                    <div className={styles.shell}>
                        <Sidebar collapsed={collapsed} />
                        <main className={`${styles.main} ${collapsed ? styles.mainCollapsed : ''}`}>
                            <div className={styles.contentHeader}>
                                <button
                                    className={styles.collapseBtn}
                                    onClick={() => setCollapsed(!collapsed)}
                                    aria-label="Toggle sidebar"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={collapsed ? { transform: 'scaleX(-1)' } : {}}>
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <line x1="9" y1="3" x2="9" y2="21" />
                                        <polyline points="15 8 12 12 15 16" />
                                    </svg>
                                </button>
                            </div>
                            {children}
                        </main>
                    </div>
                )}
            </ToastProvider>
        </DataProvider>
    )
}
