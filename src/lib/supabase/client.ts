import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://bdjuviusnstkwonbwoln.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_e3dW0q78L0H08N6Tey2GcA_ZcTYohQJ'
    )
}
