'use server';

import { getSupabaseService } from '~/lib/supabase';
import { revalidatePath } from 'next/cache';

/**
 * Server Action to update user tokens.
 */
export async function updateUserTokensAction(fid: number, tokens: number, reason: string = 'generic update') {
    // LOG CRÍTICO - Si esto no sale en Vercel, la acción no se está llamando
    console.log('--- SERVER ACTION TRIGGERED ---');
    console.log(`[DATABASE_SYNC] FID: ${fid} | TARGET_TOKENS: ${tokens} | REASON: ${reason}`);

    try {
        const supabase = getSupabaseService();

        // Usamos update con select para confirmar el cambio
        const { data, error } = await supabase
            .from('users')
            .update({
                tokens,
                updated_at: new Date().toISOString()
            })
            .eq('fid', fid)
            .select();

        if (error) {
            console.error(`[DATABASE_SYNC] ❌ Error for FID ${fid}:`, error.message);
            return { success: false, error: error.message };
        }

        if (!data || data.length === 0) {
            console.warn(`[DATABASE_SYNC] ⚠️ No row updated for FID ${fid}. User might not exist.`);
            return { success: false, error: 'User not found' };
        }

        console.log(`[DATABASE_SYNC] ✅ SUCCESS. FID ${fid} now has ${data[0].tokens} tokens.`);
        revalidatePath('/');
        return { success: true, data: data[0] };
    } catch (e: any) {
        console.error(`[DATABASE_SYNC] 💥 FATAL CRASH:`, e.message);
        return { success: false, error: e.message };
    }
}

/**
 * Server Action to add an unlocked skin.
 */
export async function addUnlockedSkinAction(fid: number, skinId: string) {
    console.log(`[SERVER_SKIN] Unlocking ${skinId} for FID ${fid}`);
    try {
        const supabase = getSupabaseService();
        const { data: user } = await supabase.from('users').select('unlocked_skins').eq('fid', fid).single();
        const currentSkins = user?.unlocked_skins || ['classic'];
        if (!currentSkins.includes(skinId)) {
            await supabase.from('users').update({
                unlocked_skins: [...currentSkins, skinId],
                updated_at: new Date().toISOString()
            }).eq('fid', fid);
            console.log(`[SERVER_SKIN] ✅ OK`);
        }
        revalidatePath('/');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * Server Action to add an unlocked theme.
 */
export async function addUnlockedThemeAction(fid: number, themeId: string) {
    try {
        const supabase = getSupabaseService();
        const { data: user } = await supabase.from('users').select('unlocked_themes').eq('fid', fid).single();
        const currentThemes = user?.unlocked_themes || [];
        if (!currentThemes.includes(themeId)) {
            await supabase.from('users').update({
                unlocked_themes: [...currentThemes, themeId],
                updated_at: new Date().toISOString()
            }).eq('fid', fid);
        }
        revalidatePath('/');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * Server Action to update preferred skin/theme.
 */
export async function updatePreferencesAction(fid: number, preferences: { selected_skin?: string, selected_theme?: string }) {
    try {
        const supabase = getSupabaseService();
        await supabase.from('users').update({ ...preferences, updated_at: new Date().toISOString() }).eq('fid', fid);
        revalidatePath('/');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
