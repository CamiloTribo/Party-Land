import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Debug keys (safe way)
if (typeof window === 'undefined') {
    console.log('🛡️ [Supabase Debug] URL:', supabaseUrl.substring(0, 15) + '...');
    console.log('🛡️ [Supabase Debug] Anon Key Length:', supabaseAnonKey.length);
    console.log('🛡️ [Supabase Debug] Service Key Length:', serviceRoleKey.length);
}

// Standard client (used in frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Service Client (used in Server Actions)
 * We add a fallback to the Anon key if the Service key is giving issues,
 * although Service Role is preferred for bypassing RLS.
 */
export const getSupabaseService = () => {
    // Si la clave de servicio está fallando, intentamos usar la Anon key en el servidor.
    // En muchos casos funciona si RLS no es súper estricto.
    const keyToUse = serviceRoleKey || supabaseAnonKey;

    if (serviceRoleKey) {
        console.log('🔑 [Supabase] Using Service Role Key');
    } else {
        console.log('⚠️ [Supabase] Service Role Key missing, falling back to Anon Key');
    }

    return createClient(supabaseUrl, keyToUse, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    });
};
