'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
    id: number
    message: string
    type: ToastType
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => { } })

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
    }, [])

    const bgColor = (type: ToastType) => {
        if (type === 'success') return 'rgba(22,163,74,0.95)'
        if (type === 'error') return 'rgba(220,38,38,0.95)'
        return 'rgba(37,99,235,0.95)'
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{
                position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
                display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none',
            }}>
                {toasts.map(t => (
                    <div key={t.id} style={{
                        background: bgColor(t.type),
                        color: '#fff',
                        padding: '12px 18px',
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 500,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                        maxWidth: 340,
                        lineHeight: 1.4,
                        animation: 'toastIn 0.3s ease',
                        pointerEvents: 'auto',
                    }}>
                        {t.type === 'success' ? '✅ ' : t.type === 'error' ? '❌ ' : 'ℹ️ '}
                        {t.message}
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes toastIn {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </ToastContext.Provider>
    )
}

export function useToast() {
    return useContext(ToastContext)
}
