import { createClient } from '@supabase/supabase-js';

// Avoid hardcoding keys. Use ! to tell TS they exist, but we check them at runtime.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ [Supabase] Missing URL or Anon Key. Database features may fail.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Use this for backend/scripts only
export const getSupabaseService = () => {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
        console.error('❌ [Supabase] Missing SUPABASE_SERVICE_ROLE_KEY! Backend calls will fail.');
    }
    return createClient(supabaseUrl || '', serviceKey || '');
};
