import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';


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

    return createClient(supabaseUrl, keyToUse, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    });
};
