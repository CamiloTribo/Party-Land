'use server';

import { getSupabaseService } from '~/lib/supabase';
import { revalidatePath } from 'next/cache';

/**
 * Update user tokens using a DELTA (increment/decrement).
 * This is MUCH safer than sending the final total value.
 */
export async function updateUserTokensAction(fid: number, delta: number, reason: string) {
    console.log(`[SERVER] 💰 FID: ${fid} | DELTA: ${delta} | REASON: ${reason}`);

    try {
        const supabase = getSupabaseService();

        // First, get the current value (we could use RPC for true atomicity, but let's do a safe update here)
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('tokens')
            .eq('fid', fid)
            .single();

        if (fetchError) throw fetchError;

        const newTotal = (user.tokens || 0) + delta;
        if (newTotal < 0) throw new Error('Insufficient tokens');

        const { data, error } = await supabase
            .from('users')
            .update({
                tokens: newTotal,
                updated_at: new Date().toISOString()
            })
            .eq('fid', fid)
            .select()
            .single();

        if (error) throw error;

        console.log(`[SERVER] ✅ DONE. New Balance for FID ${fid}: ${data.tokens}`);
        revalidatePath('/');
        return { success: true, tokens: data.tokens };
    } catch (e: any) {
        console.error(`[SERVER] ❌ Error updating tokens:`, e.message);
        return { success: false, error: e.message };
    }
}

/**
 * Securely unlock a skin and deduct cost in one go if possible (simulated atomicity).
 */
export async function purchaseSkinAction(fid: number, skinId: string, cost: number) {
    console.log(`[SERVER] 🎭 PURCHASE SKIN: ${skinId} | FID: ${fid} | COST: ${cost}`);

    try {
        const supabase = getSupabaseService();
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('tokens, unlocked_skins')
            .eq('fid', fid)
            .single();

        if (fetchError) throw fetchError;

        if (user.tokens < cost) return { success: false, error: 'Insufficient tokens' };

        const currentSkins = Array.isArray(user.unlocked_skins) ? user.unlocked_skins : ['classic'];
        if (currentSkins.includes(skinId)) return { success: true, alreadyOwned: true };

        const { error: updateError } = await supabase
            .from('users')
            .update({
                tokens: user.tokens - cost,
                unlocked_skins: [...currentSkins, skinId],
                updated_at: new Date().toISOString()
            })
            .eq('fid', fid);

        if (updateError) throw updateError;

        console.log(`[SERVER] ✅ SKIN UNLOCKED: ${skinId}`);
        revalidatePath('/');
        return { success: true };
    } catch (e: any) {
        console.error(`[SERVER] ❌ Purchase failed:`, e.message);
        return { success: false, error: e.message };
    }
}

/**
 * Securely unlock a theme and deduct cost.
 */
export async function purchaseThemeAction(fid: number, themeId: string, cost: number) {
    console.log(`[SERVER] 🎨 PURCHASE THEME: ${themeId} | FID: ${fid} | COST: ${cost}`);

    try {
        const supabase = getSupabaseService();
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('tokens, unlocked_themes')
            .eq('fid', fid)
            .single();

        if (fetchError) throw fetchError;
        if (user.tokens < cost) return { success: false, error: 'Insufficient tokens' };

        const currentThemes = Array.isArray(user.unlocked_themes) ? user.unlocked_themes : [];
        if (currentThemes.includes(themeId)) return { success: true, alreadyOwned: true };

        const { error: updateError } = await supabase
            .from('users')
            .update({
                tokens: user.tokens - cost,
                unlocked_themes: [...currentThemes, themeId],
                updated_at: new Date().toISOString()
            })
            .eq('fid', fid);

        if (updateError) throw updateError;

        revalidatePath('/');
        return { success: true };
    } catch (e: any) {
        console.error(`[SERVER] ❌ Theme purchase failed:`, e.message);
        return { success: false, error: e.message };
    }
}

/**
 * Update simple preferences.
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
