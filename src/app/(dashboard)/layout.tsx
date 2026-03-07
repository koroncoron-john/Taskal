'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar/Sidebar'
import styles from './layout.module.css'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [collapsed, setCollapsed] = useState(false)

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
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={collapsed ? { transform: 'scaleX(-1)' } : {}}>
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
