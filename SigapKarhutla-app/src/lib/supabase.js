import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase env vars belum diset. Salin .env.example ke .env dan isi VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY.',
  )
}

// Placeholder URL keeps createClient() from throwing before env vars are configured,
// so the app shell still renders during early scaffolding.
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-anon-key')
