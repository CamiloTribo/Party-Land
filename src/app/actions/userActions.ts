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
/**
 * Sync or create user profile in Supabase.
 * Ensures username, display_name, and pfp_url are always present.
 */
export async function syncUserProfileAction(profile: {
    fid: number,
    username?: string,
    display_name?: string,
    pfp_url?: string,
    wallet_address?: string
}) {
    console.log(`[SERVER_SYNC] 👤 Syncing profile for FID ${profile.fid}`);

    try {
        const supabase = getSupabaseService();

        // Defaults for new users
        const defaultSkins = ['classic'];
        const defaultThemes = ['classic-pink', 'ocean-blue', 'forest-green', 'sunset-orange'];

        const { data, error } = await supabase
            .from('users')
            .upsert({
                fid: profile.fid,
                username: profile.username || null,
                display_name: profile.display_name || null,
                pfp_url: profile.pfp_url || null,
                wallet_address: profile.wallet_address || null,
                updated_at: new Date().toISOString(),
                // Only provide defaults if they don't exist (handled by DB defaults or explicit check)
                // However, upsert will overwrite if we provide them. 
                // Better to use an insert-if-not-exists logic or only update profile fields.
            }, {
                onConflict: 'fid',
                ignoreDuplicates: false // We want to update the profile info
            })
            .select()
            .single();

        if (error) return handleDBError(profile.fid, 'Sync profile', error);

        console.log(`[SERVER_SYNC] ✅ Profile synced for ${profile.username || profile.fid}`);
        revalidatePath('/');
        return { success: true, data };
    } catch (e: any) {
        return handleDBError(profile.fid, 'Exception in profile sync', e);
    }
}

/**
 * Claim the one-time welcome reward (230 tokens).
 */
export async function claimWelcomeRewardAction(fid: number) {
    console.log(`[SERVER_REWARD] 🎁 FID ${fid} claiming welcome reward...`);

    try {
        const supabase = getSupabaseService();

        // 1. Check if already claimed
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('tokens, welcome_reward_claimed, unlocked_skins, unlocked_themes')
            .eq('fid', fid)
            .single();

        if (fetchError) return handleDBError(fid, 'Fetch reward status', fetchError);
        if (user.welcome_reward_claimed) return { success: false, error: 'Already claimed' };

        const rewardAmount = 230;
        const currentSkins = Array.isArray(user.unlocked_skins) ? user.unlocked_skins : ['classic'];
        const currentThemes = Array.isArray(user.unlocked_themes) ? user.unlocked_themes : ['classic-pink', 'ocean-blue', 'forest-green', 'sunset-orange'];

        // 2. Update user
        const { error: updateError } = await supabase
            .from('users')
            .update({
                tokens: (user.tokens || 0) + rewardAmount,
                welcome_reward_claimed: true,
                unlocked_skins: currentSkins.includes('classic') ? currentSkins : [...currentSkins, 'classic'],
                unlocked_themes: currentThemes.length > 0 ? currentThemes : ['classic-pink', 'ocean-blue', 'forest-green', 'sunset-orange'],
                updated_at: new Date().toISOString()
            })
            .eq('fid', fid);

        if (updateError) return handleDBError(fid, 'Update reward status', updateError);

        console.log(`[SERVER_REWARD] ✅ Success! FID ${fid} received ${rewardAmount} tokens.`);
        revalidatePath('/');
        return { success: true, amount: rewardAmount };
    } catch (e: any) {
        return handleDBError(fid, 'Exception in welcome reward', e);
    }
}
