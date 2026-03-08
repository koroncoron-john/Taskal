'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar/Sidebar'
import styles from './layout.module.css'
import { createClient } from '@/lib/supabase/client'

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
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.replace('/login')
            } else {
                setChecked(true)
            }
        }
        checkAuth()
    }, [])

    if (!checked) return null

    return (
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
    )
}
