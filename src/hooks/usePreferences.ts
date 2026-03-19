'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// 各ページのpreferences型
export interface PagePreferences {
    tasks?: { filterStatus: string; sortOrder: string }
    articles?: { filterStatus: string; sortOrder: string }
    businesscards?: { filterStatus: string; sortKey: string }
}

type PageKey = keyof PagePreferences

/**
 * usePreferences
 * user_metadata に永続化するカスタムフック
 * - loadPreferences(): user_metadataから読み込み
 * - savePreferences(page, prefs): 特定ページの設定を保存（デバウンス500ms）
 */
export function usePreferences() {
    const supabase = createClient()
    const [preferences, setPreferences] = useState<PagePreferences>({})
    const [loaded, setLoaded] = useState(false)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // 初回マウント時にuser_metadataから読み込む
    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            const saved = user?.user_metadata?.preferences as PagePreferences | undefined
            if (saved) setPreferences(saved)
            setLoaded(true)
        }
        load()
    }, [])

    // 特定ページの設定を保存（500msデバウンス）
    const savePreferences = useCallback(<K extends PageKey>(
        page: K,
        prefs: PagePreferences[K]
    ) => {
        setPreferences(prev => {
            const next = { ...prev, [page]: prefs }

            // デバウンス: 500ms後にSupabaseに保存
            if (debounceRef.current) clearTimeout(debounceRef.current)
            debounceRef.current = setTimeout(async () => {
                await supabase.auth.updateUser({
                    data: { preferences: next }
                })
            }, 500)

            return next
        })
    }, [])

    return { preferences, savePreferences, loaded }
}
