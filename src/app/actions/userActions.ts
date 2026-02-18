'use server';

import { getSupabaseService } from '~/lib/supabase';
import { revalidatePath } from 'next/cache';

/**
 * Helper to log and handle database errors
 */
const handleDBError = (fid: number, operation: string, error: any) => {
    console.error(`[DB_ERROR] ❌ ${operation} failed for FID ${fid}:`, error.message || error);
    // Si recibimos "Invalid API key", es un problema de configuración de Supabase
    if (error.message?.includes('Invalid API key')) {
        console.error('🔴 CRITICAL: The Supabase Service Role Key is rejected. Check .env.local and Supabase Dashboard.');
    }
    return { success: false, error: error.message };
};

/**
 * Server Action to update user tokens using a DELTA.
 */
export async function updateUserTokensAction(fid: number, delta: number, reason: string) {
    console.log(`[SERVER_SYNC] 🪙 Incrementing ${delta} for FID ${fid}. Reason: ${reason}`);

    try {
        const supabase = getSupabaseService();

        // 1. Get current tokens
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('tokens')
            .eq('fid', fid)
            .single();

        if (fetchError) return handleDBError(fid, 'Fetch tokens', fetchError);

        const newTotal = (user.tokens || 0) + delta;

        // 2. Update to new total
        const { data, error: updateError } = await supabase
            .from('users')
            .update({ tokens: Math.max(0, newTotal), updated_at: new Date().toISOString() })
            .eq('fid', fid)
            .select()
            .single();

        if (updateError) return handleDBError(fid, 'Update tokens', updateError);

        console.log(`[SERVER_SYNC] ✅ SUCCESS. FID ${fid} tokens: ${data.tokens}`);
        revalidatePath('/');
        return { success: true, tokens: data.tokens };
    } catch (e: any) {
        return handleDBError(fid, 'Exception in tokens', e);
    }
}

/**
 * Purchase a skin (Atomic deducting + unlocking).
 */
export async function purchaseSkinAction(fid: number, skinId: string, cost: number) {
    console.log(`[SERVER_SHOP] 🎭 Purchase ${skinId} for FID ${fid} (Cost: ${cost})`);

    try {
        const supabase = getSupabaseService();
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('tokens, unlocked_skins')
            .eq('fid', fid)
            .single();

        if (fetchError) return handleDBError(fid, 'Fetch user record', fetchError);

        if (user.tokens < cost) {
            console.warn(`[SERVER_SHOP] ⚠️ FID ${fid} has insufficient tokens (${user.tokens} < ${cost})`);
            return { success: false, error: 'Insufficient tokens' };
        }

        const currentSkins = Array.isArray(user.unlocked_skins) ? user.unlocked_skins : ['classic'];
        if (currentSkins.includes(skinId)) {
            console.log(`[SERVER_SHOP] ✅ User already owns ${skinId}`);
            return { success: true };
        }

        const { error: updateError } = await supabase
            .from('users')
            .update({
                tokens: user.tokens - cost,
                unlocked_skins: [...currentSkins, skinId],
                updated_at: new Date().toISOString()
            })
            .eq('fid', fid);

        if (updateError) return handleDBError(fid, 'Apply purchase', updateError);

        console.log(`[SERVER_SHOP] ✅ Purchase complete for ${skinId}`);
        revalidatePath('/');
        return { success: true };
    } catch (e: any) {
        return handleDBError(fid, 'Exception in shop', e);
    }
}

/**
 * Purchase a theme.
 */
export async function purchaseThemeAction(fid: number, themeId: string, cost: number) {
    try {
        const supabase = getSupabaseService();
        const { data: user, error: fetchError } = await supabase.from('users').select('tokens, unlocked_themes').eq('fid', fid).single();
        if (fetchError) return handleDBError(fid, 'Fetch user for theme', fetchError);
        if (user.tokens < cost) return { success: false, error: 'Insufficient tokens' };

        const currentThemes = Array.isArray(user.unlocked_themes) ? user.unlocked_themes : [];
        if (currentThemes.includes(themeId)) return { success: true };

        const { error: updateError } = await supabase.from('users').update({
            tokens: user.tokens - cost,
            unlocked_themes: [...currentThemes, themeId],
            updated_at: new Date().toISOString()
        }).eq('fid', fid);

        if (updateError) return handleDBError(fid, 'Apply theme purchase', updateError);

        console.log(`[SERVER_SHOP] ✅ Theme ${themeId} purchased`);
        revalidatePath('/');
        return { success: true };
    } catch (e: any) {
        return handleDBError(fid, 'Exception in themes', e);
    }
}

/**
 * Simple preferences update.
 */
export async function updatePreferencesAction(fid: number, preferences: { selected_skin?: string, selected_theme?: string }) {
    try {
        const supabase = getSupabaseService();
        const { error } = await supabase.from('users').update({ ...preferences, updated_at: new Date().toISOString() }).eq('fid', fid);
        if (error) return handleDBError(fid, 'Update preferences', error);
        revalidatePath('/');
        return { success: true };
    } catch (e: any) {
        return handleDBError(fid, 'Exception in prefs', e);
    }
}
