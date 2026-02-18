'use server';

import { getSupabaseService } from '~/lib/supabase';
import { revalidatePath } from 'next/cache';

/**
 * Server Action to update user tokens.
 * This ensures the update is logged and handled on the server side.
 */
export async function updateUserTokensAction(fid: number, tokens: number, reason: string = 'generic update') {
    console.log(`[Server Action] 🪙 Updating tokens for FID: ${fid}. New value: ${tokens}. Reason: ${reason}`);

    const supabase = getSupabaseService();

    const { data, error } = await supabase
        .from('users')
        .update({
            tokens,
            updated_at: new Date().toISOString()
        })
        .eq('fid', fid)
        .select()
        .single();

    if (error) {
        console.error(`[Server Action] ❌ Error updating tokens for FID: ${fid}:`, error);
        throw new Error('Failed to update tokens');
    }

    console.log(`[Server Action] ✅ Tokens updated successfully for FID: ${fid}. Row:`, data);
    revalidatePath('/');
    return data;
}

/**
 * Server Action to add an unlocked skin.
 */
export async function addUnlockedSkinAction(fid: number, skinId: string) {
    console.log(`[Server Action] 🎭 Unlocking skin "${skinId}" for FID: ${fid}`);

    const supabase = getSupabaseService();

    // First get current skins
    const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('unlocked_skins')
        .eq('fid', fid)
        .single();

    if (fetchError) {
        console.error(`[Server Action] ❌ Error fetching skins for FID: ${fid}:`, fetchError);
        throw new Error('Failed to fetch skins');
    }

    const currentSkins = Array.isArray(user.unlocked_skins) ? user.unlocked_skins : ['classic'];
    if (!currentSkins.includes(skinId)) {
        const newSkins = [...currentSkins, skinId];

        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({
                unlocked_skins: newSkins,
                updated_at: new Date().toISOString()
            })
            .eq('fid', fid)
            .select()
            .single();

        if (updateError) {
            console.error(`[Server Action] ❌ Error updating skins for FID: ${fid}:`, updateError);
            throw new Error('Failed to update skins');
        }

        console.log(`[Server Action] ✅ Skin "${skinId}" unlocked for FID: ${fid}`);
        revalidatePath('/');
        return updatedUser;
    }

    return user;
}

/**
 * Server Action to add an unlocked theme.
 */
export async function addUnlockedThemeAction(fid: number, themeId: string) {
    console.log(`[Server Action] 🎨 Unlocking theme "${themeId}" for FID: ${fid}`);

    const supabase = getSupabaseService();

    // First get current themes
    const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('unlocked_themes')
        .eq('fid', fid)
        .single();

    if (fetchError) {
        console.error(`[Server Action] ❌ Error fetching themes for FID: ${fid}:`, fetchError);
        throw new Error('Failed to fetch themes');
    }

    const currentThemes = Array.isArray(user.unlocked_themes) ? user.unlocked_themes : [];
    if (!currentThemes.includes(themeId)) {
        const newThemes = [...currentThemes, themeId];

        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({
                unlocked_themes: newThemes,
                updated_at: new Date().toISOString()
            })
            .eq('fid', fid)
            .select()
            .single();

        if (updateError) {
            console.error(`[Server Action] ❌ Error updating themes for FID: ${fid}:`, updateError);
            throw new Error('Failed to update themes');
        }

        console.log(`[Server Action] ✅ Theme "${themeId}" unlocked for FID: ${fid}`);
        revalidatePath('/');
        return updatedUser;
    }

    return user;
}

/**
 * Server Action to update preferred skin/theme.
 */
export async function updatePreferencesAction(fid: number, preferences: { selected_skin?: string, selected_theme?: string }) {
    console.log(`[Server Action] ⚙️ Updating preferences for FID: ${fid}:`, preferences);

    const supabase = getSupabaseService();

    const { data, error } = await supabase
        .from('users')
        .update({
            ...preferences,
            updated_at: new Date().toISOString()
        })
        .eq('fid', fid)
        .select()
        .single();

    if (error) {
        console.error(`[Server Action] ❌ Error updating preferences for FID: ${fid}:`, error);
        throw new Error('Failed to update preferences');
    }

    console.log(`[Server Action] ✅ Preferences updated for FID: ${fid}`);
    revalidatePath('/');
    return data;
}
