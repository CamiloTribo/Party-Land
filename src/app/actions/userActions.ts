'use server';

import { getSupabaseService } from '~/lib/supabase';
import { revalidatePath } from 'next/cache';

/**
 * Server Action to update user tokens.
 */
export async function updateUserTokensAction(fid: number, tokens: number, reason: string = 'generic update') {
    console.log(`[SERVER] 🪙 FID: ${fid} | TOKENS: ${tokens} | REASON: ${reason}`);

    try {
        const supabase = getSupabaseService();
        const { data, error } = await supabase
            .from('users')
            .update({
                tokens,
                updated_at: new Date().toISOString()
            })
            .eq('fid', fid)
            .select();

        if (error) {
            console.error(`[SERVER] ❌ Error updating tokens for FID ${fid}:`, error.message);
            return { success: false, error: error.message };
        }

        console.log(`[SERVER] ✅ Success for FID ${fid}. New balance: ${tokens}`);
        revalidatePath('/');
        return { success: true, data };
    } catch (e: any) {
        console.error(`[SERVER] 💥 Crash updating tokens for FID ${fid}:`, e.message);
        return { success: false, error: e.message };
    }
}

/**
 * Server Action to add an unlocked skin.
 */
export async function addUnlockedSkinAction(fid: number, skinId: string) {
    console.log(`[SERVER] 🎭 FID: ${fid} | UNLOCKING SKIN: ${skinId}`);

    try {
        const supabase = getSupabaseService();
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('unlocked_skins')
            .eq('fid', fid)
            .single();

        if (fetchError) {
            console.error(`[SERVER] ❌ Error fetching skins for FID ${fid}:`, fetchError.message);
            return { success: false, error: fetchError.message };
        }

        const currentSkins = Array.isArray(user.unlocked_skins) ? user.unlocked_skins : ['classic'];
        if (!currentSkins.includes(skinId)) {
            const newSkins = [...currentSkins, skinId];
            const { error: updateError } = await supabase
                .from('users')
                .update({ unlocked_skins: newSkins, updated_at: new Date().toISOString() })
                .eq('fid', fid);

            if (updateError) {
                console.error(`[SERVER] ❌ Error updating skins for FID ${fid}:`, updateError.message);
                return { success: false, error: updateError.message };
            }
            console.log(`[SERVER] ✅ Skin ${skinId} unlocked for FID ${fid}`);
        }
        revalidatePath('/');
        return { success: true };
    } catch (e: any) {
        console.error(`[SERVER] 💥 Crash updating skins for FID ${fid}:`, e.message);
        return { success: false, error: e.message };
    }
}

/**
 * Server Action to add an unlocked theme.
 */
export async function addUnlockedThemeAction(fid: number, themeId: string) {
    console.log(`[SERVER] 🎨 FID: ${fid} | UNLOCKING THEME: ${themeId}`);

    try {
        const supabase = getSupabaseService();
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('unlocked_themes')
            .eq('fid', fid)
            .single();

        if (fetchError) return { success: false, error: fetchError.message };

        const currentThemes = Array.isArray(user.unlocked_themes) ? user.unlocked_themes : [];
        if (!currentThemes.includes(themeId)) {
            const newThemes = [...currentThemes, themeId];
            await supabase
                .from('users')
                .update({ unlocked_themes: newThemes, updated_at: new Date().toISOString() })
                .eq('fid', fid);
            console.log(`[SERVER] ✅ Theme ${themeId} unlocked for FID ${fid}`);
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
    console.log(`[SERVER] ⚙️ FID: ${fid} | PREFS:`, preferences);

    try {
        const supabase = getSupabaseService();
        const { error } = await supabase
            .from('users')
            .update({ ...preferences, updated_at: new Date().toISOString() })
            .eq('fid', fid);

        if (error) return { success: false, error: error.message };
        console.log(`[SERVER] ✅ Preferences updated for FID ${fid}`);
        revalidatePath('/');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
