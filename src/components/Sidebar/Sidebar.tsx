'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import styles from './Sidebar.module.css'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/tasks', label: 'Tasks', icon: '✓' },
    { href: '/projects', label: 'Projects', icon: '📁' },
    { href: '/articles', label: 'Articles', icon: '📝' },
    { href: '/movies', label: 'Movies', icon: '🎬' },
    { href: '/learning', label: 'Learning', icon: '📚' },
    { href: '/businesscards', label: 'BusinessCards', icon: '💼' },
]

export default function Sidebar() {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
                <div className={styles.logoArea}>
                    <span className={styles.logo}>T</span>
                    {!collapsed && <span className={styles.logoText}>Taskal</span>}
                    <button
                        className={styles.collapseBtn}
                        onClick={() => setCollapsed(!collapsed)}
                        aria-label="Toggle sidebar"
                    >
                        {collapsed ? '→' : '←'}
                    </button>
                </div>

                <nav className={styles.nav}>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${pathname.startsWith(item.href) ? styles.active : ''}`}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className={styles.userArea}>
                    <span className={styles.userAvatar}>J</span>
                    {!collapsed && <span className={styles.userName}>Jon</span>}
                </div>
            </aside>

            {/* Mobile Header */}
            <header className={styles.mobileHeader}>
                <span className={styles.mobileLogo}>T</span>
                <span className={styles.mobileTitle}>Taskal</span>
                <button
                    className={styles.hamburger}
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open menu"
                >
                    ☰
                </button>
            </header>

            {/* Mobile Slide Menu */}
            {mobileOpen && (
                <div className={styles.overlay} onClick={() => setMobileOpen(false)}>
                    <div className={styles.slideMenu} onClick={(e) => e.stopPropagation()}>
                        <button
                            className={styles.closeBtn}
                            onClick={() => setMobileOpen(false)}
                        >
                            ✕
                        </button>
                        <nav className={styles.slideNav}>
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`${styles.slideNavItem} ${pathname.startsWith(item.href) ? styles.active : ''}`}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <span className={styles.navIcon}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </nav>
                        <div className={styles.slideUser}>
                            <span className={styles.userAvatar}>J</span>
                            <span>Jon</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
