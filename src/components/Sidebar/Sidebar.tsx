'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './Sidebar.module.css'
import { createClient } from '@/lib/supabase/client'

/* Supabase/Stitch風のミニマルSVGアイコン */
const icons: Record<string, React.ReactNode> = {
    dashboard: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    ),
    tasks: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
    ),
    projects: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
        </svg>
    ),
    articles: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
        </svg>
    ),
    movies: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
    ),
    learning: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
        </svg>
    ),
    clients: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    businesscards: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
    ),
}

const navItems = [
    { href: '/dashboard', label: 'Dashboard', iconKey: 'dashboard' },
    { href: '/tasks', label: 'Tasks', iconKey: 'tasks' },
    { href: '/projects', label: 'Projects', iconKey: 'projects' },
    { href: '/clients', label: 'Clients', iconKey: 'clients' },
    { href: '/articles', label: 'Articles', iconKey: 'articles' },
    { href: '/movies', label: 'Movies', iconKey: 'movies' },
    { href: '/learning', label: 'Learning', iconKey: 'learning' },
    { href: '/businesscards', label: 'BusinessCards', iconKey: 'businesscards' },
]

interface SidebarProps {
    collapsed: boolean
}

export default function Sidebar({ collapsed }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [userName, setUserName] = useState('User')
    const [userInitial, setUserInitial] = useState('U')

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
                setUserName(name)
                setUserInitial(name.charAt(0).toUpperCase())
            }
        }
        getUser()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
                <div className={styles.logoArea}>
                    <span className={styles.logo}>T</span>
                    {!collapsed && <span className={styles.logoText}>Taskal</span>}
                </div>

                <nav className={styles.nav}>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${pathname.startsWith(item.href) ? styles.active : ''}`}
                        >
                            <span className={styles.navIcon}>{icons[item.iconKey]}</span>
                            {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className={styles.userArea} onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                    <span className={styles.userAvatar}>{userInitial}</span>
                    {!collapsed && <span className={styles.userName}>{userName}</span>}
                    {isUserMenuOpen && (
                        <div className={styles.userMenu}>
                            <Link href="/settings" className={styles.userMenuItem} onClick={() => setIsUserMenuOpen(false)}>
                                Profile Settings
                            </Link>
                            <div className={styles.userMenuDivider} />
                            <button className={styles.userMenuItem} style={{ color: 'var(--color-danger)' }} onClick={handleLogout}>
                                Log out
                            </button>
                        </div>
                    )}
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
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
            </header>

            {/* Mobile Slide Menu */}
            {mobileOpen && (
                <div className={styles.overlay} onClick={() => setMobileOpen(false)}>
                    <div className={styles.slideMenu} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setMobileOpen(false)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                        <nav className={styles.slideNav}>
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`${styles.slideNavItem} ${pathname.startsWith(item.href) ? styles.active : ''}`}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <span className={styles.navIcon}>{icons[item.iconKey]}</span>
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </nav>
                        <div className={styles.slideUser}>
                            <Link href="/settings" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
                                <span className={styles.userAvatar}>{userInitial}</span>
                                <span>{userName}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
