import { createClient } from '@supabase/supabase-js';

// Avoid hardcoding keys.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
        console.warn('⚠️ [Supabase] Missing URL or Anon Key in Node environment.');
    }
} else {
    console.log('✅ [Supabase] Client configuration detected');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Use this for backend/scripts only
export const getSupabaseService = () => {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
        console.error('❌ [Supabase] Missing SUPABASE_SERVICE_ROLE_KEY! Backend calls will fail.');
    } else {
        console.log('✅ [Supabase] service_role key detected');
    }
    return createClient(supabaseUrl || '', serviceKey || '');
};
