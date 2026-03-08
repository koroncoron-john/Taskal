import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    // NEXT_PUBLIC_変数はクライアントサイドで常に利用可能
    // ビルド時はforce-dynamicで保護済みのため!アサーションで問題なし
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
    )
}
