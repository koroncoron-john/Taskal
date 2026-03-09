'use client'

import { useEffect, useState } from 'react'

export default function UpdateBanner() {
    const [show, setShow] = useState(false)

    useEffect(() => {
        let initialVersion: string | null = null

        const check = async () => {
            try {
                const res = await fetch('/version.txt?t=' + Date.now())
                const ver = (await res.text()).trim()
                if (!initialVersion) {
                    initialVersion = ver
                } else if (ver !== initialVersion) {
                    setShow(true)
                }
            } catch { }
        }

        check()
        const timer = setInterval(check, 5 * 60 * 1000)

        const onVisibility = () => { if (!document.hidden) check() }
        document.addEventListener('visibilitychange', onVisibility)

        return () => {
            clearInterval(timer)
            document.removeEventListener('visibilitychange', onVisibility)
        }
    }, [])

    if (!show) return null

    return (
        <div
            onClick={() => window.location.reload()}
            style={{
                position: 'fixed',
                bottom: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-brand)',
                borderRadius: 10,
                padding: '12px 28px',
                cursor: 'pointer',
                zIndex: 9998,
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--color-text-primary)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
                whiteSpace: 'nowrap',
                transition: 'opacity 0.2s',
                userSelect: 'none',
            }}
        >
            A new version is available — click here to update
        </div>
    )
}
