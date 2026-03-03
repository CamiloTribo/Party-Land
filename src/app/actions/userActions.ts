'use server';

import { getSupabaseService } from '~/lib/supabase';
import { revalidatePath } from 'next/cache';

/**
 * Helper to log transaction to DB
 */
async function logTransaction(supabase: any, data: {
    fid: number,
    type: string,
    amount: number,
    currency: string,
    item_id?: string,
    description: string,
    tx_hash?: string
}) {
    try {
        // Fetch user info for the record
        const { data: user } = await supabase.from('users').select('username, wallet_address').eq('fid', data.fid).single();

        const { error } = await supabase.from('transactions').insert({
            fid: data.fid,
            username: user?.username || 'Unknown',
            wallet_address: user?.wallet_address || 'None',
            type: data.type,
            amount: data.amount,
            currency: data.currency,
            item_id: data.item_id,
            description: data.description,
            tx_hash: data.tx_hash
        });
        if (error) console.error('[TRANSACTION_LOG] ❌ Failed to insert log:', error.message);
        else console.log(`[TRANSACTION_LOG] ✅ Logged ${data.type} for FID ${data.fid}`);
    } catch (e) {
        console.error('[TRANSACTION_LOG] 💥 Crash logging transaction:', e);
    }
}

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

// ─── SECURITY CONSTANTS ──────────────────────────────────────────────────────
const VALID_EARN_REASONS: Record<string, number> = {
    'Game Over Reward': 100,   // Max floors = 100
    'Victory Reward': 600,     // 100 floors + 500 victory bonus
};
const MAX_TOKENS_PER_EARN_TX = 700;
const MAX_EARNS_PER_MINUTE = 3;
// Min seconds between Victory Reward claims (100-floor game takes at least 4 min)
const MIN_VICTORY_COOLDOWN_SECONDS = 240;
// Daily earn cap: max 20 victories worth of tokens per day
const MAX_DAILY_EARN_TOKENS = 12000;
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Server Action to update user tokens using a DELTA.
 * Includes anti-cheat validation to prevent frontend manipulation.
 */
export async function updateUserTokensAction(fid: number, delta: number, reason: string) {

    // ── ANTI-CHEAT: Basic sanity checks ──────────────────────────────────────
    if (!fid || fid <= 0) {
        console.error(`[ANTI-CHEAT] 🚨 Invalid FID: ${fid}`);
        return { success: false, error: 'Invalid user' };
    }

    if (typeof delta !== 'number' || isNaN(delta)) {
        console.error(`[ANTI-CHEAT] 🚨 Invalid delta type from FID ${fid}`);
        return { success: false, error: 'Invalid amount' };
    }

    // Only validate EARN transactions (spending tokens is fine as-is)
    if (delta > 0) {
        // Check against max possible per single game transaction
        if (delta > MAX_TOKENS_PER_EARN_TX) {
            console.error(`[ANTI-CHEAT] 🚨 BLOCKED suspicious earn: FID ${fid} tried to earn ${delta} tokens (reason: "${reason}"). Max allowed: ${MAX_TOKENS_PER_EARN_TX}`);
            return { success: false, error: 'Amount exceeds game maximum' };
        }

        // Check that the earn reason is a known game event
        const knownReasonMax = VALID_EARN_REASONS[reason];
        if (knownReasonMax !== undefined && delta > knownReasonMax) {
            console.error(`[ANTI-CHEAT] 🚨 BLOCKED: FID ${fid} tried to earn ${delta} tokens for "${reason}" (max allowed for this reason: ${knownReasonMax})`);
            return { success: false, error: 'Amount exceeds game maximum for this reward type' };
        }
    }
    // ─────────────────────────────────────────────────────────────────────────

    try {
        const supabase = getSupabaseService();

        // 1. Get current tokens + check rate limit
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('tokens, updated_at')
            .eq('fid', fid)
            .single();

        if (fetchError) return handleDBError(fid, 'Fetch tokens', fetchError);

        // Rate limit: max 3 earns per minute
        if (delta > 0) {
            const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
            const { count: recentEarns } = await supabase
                .from('transactions')
                .select('id', { count: 'exact', head: true })
                .eq('fid', fid)
                .eq('type', 'EARN')
                .gte('created_at', oneMinuteAgo);

            if (recentEarns !== null && recentEarns >= MAX_EARNS_PER_MINUTE) {
                console.error(`[ANTI-CHEAT] 🚨 RATE LIMITED: FID ${fid} – ${recentEarns} earns in last minute`);
                return { success: false, error: 'Too many requests. Please wait before earning again.' };
            }

            // Victory cooldown: a real 100-floor game takes ≥4 minutes
            if (reason === 'Victory Reward') {
                const cooldownAgo = new Date(Date.now() - MIN_VICTORY_COOLDOWN_SECONDS * 1000).toISOString();
                const { count: recentVictories } = await supabase
                    .from('transactions')
                    .select('id', { count: 'exact', head: true })
                    .eq('fid', fid)
                    .eq('description', 'Victory Reward')
                    .gte('created_at', cooldownAgo);

                if (recentVictories && recentVictories > 0) {
                    console.error(`[ANTI-CHEAT] 🚨 VICTORY TOO FAST: FID ${fid} claimed victory within ${MIN_VICTORY_COOLDOWN_SECONDS}s`);
                    return { success: false, error: 'Game completed too quickly. Please play again.' };
                }
            }

            // Daily earn cap
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const { data: dailyEarns } = await supabase
                .from('transactions')
                .select('amount')
                .eq('fid', fid)
                .eq('type', 'EARN')
                .gte('created_at', startOfDay.toISOString());

            const dailyTotal = dailyEarns?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) ?? 0;
            if (dailyTotal + delta > MAX_DAILY_EARN_TOKENS) {
                console.error(`[ANTI-CHEAT] 🚨 DAILY CAP REACHED: FID ${fid} daily=${dailyTotal}, tried +${delta}`);
                return { success: false, error: 'Daily earn limit reached. Come back tomorrow!' };
            }
        }

        const newTotal = (user.tokens || 0) + delta;

        // 2. Update to new total
        const { data, error: updateError } = await supabase
            .from('users')
            .update({ tokens: Math.max(0, newTotal), updated_at: new Date().toISOString() })
            .eq('fid', fid)
            .select()
            .single();

        if (updateError) return handleDBError(fid, 'Update tokens', updateError);

        // LOG TRANSACTION
        await logTransaction(supabase, {
            fid,
            type: delta > 0 ? 'EARN' : 'SPEND',
            amount: Math.abs(delta),
            currency: 'TOKENS',
            description: reason
        });

        revalidatePath('/');
        return { success: true, tokens: data.tokens };
    } catch (e: any) {
        return handleDBError(fid, 'Exception in tokens', e);
    }
}

/**
 * Purchase a skin (Atomic deducting + unlocking).
 */
export async function purchaseSkinAction(fid: number, skinId: string, cost: number, tx_hash?: string) {
    console.log(`[SERVER_SHOP] 🎭 Purchase ${skinId} for FID ${fid} (Cost: ${cost}, Tx: ${tx_hash || 'none'})`);

    try {
        const supabase = getSupabaseService();
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('tokens, unlocked_skins')
            .eq('fid', fid)
            .single();

        if (fetchError) return handleDBError(fid, 'Fetch user record', fetchError);

        if (user.tokens < cost && !tx_hash) {
            console.warn(`[SERVER_SHOP] ⚠️ FID ${fid} has insufficient tokens (${user.tokens} < ${cost})`);
            return { success: false, error: 'Insufficient tokens' };
        }

        const currentSkins = Array.isArray(user.unlocked_skins) ? user.unlocked_skins : ['classic'];
        if (currentSkins.includes(skinId)) {
            console.log(`[SERVER_SHOP] ✅ User already owns ${skinId}`);
            // If a real USDC payment was made on-chain, STILL log it so it appears in transactions
            if (tx_hash) {
                await logTransaction(supabase, {
                    fid,
                    type: 'USDC_BUY',
                    amount: cost,
                    currency: 'USDC',
                    item_id: skinId,
                    description: `Purchased skin via USDC (already owned): ${skinId}`,
                    tx_hash: tx_hash
                });
                console.log(`[SERVER_SHOP] 📝 USDC payment logged for already-owned skin: ${skinId}`);
            }
            return { success: true };
        }

        const { error: updateError } = await supabase
            .from('users')
            .update({
                tokens: tx_hash ? user.tokens : user.tokens - cost,
                unlocked_skins: [...currentSkins, skinId],
                updated_at: new Date().toISOString()
            })
            .eq('fid', fid);

        if (updateError) return handleDBError(fid, 'Apply purchase', updateError);

        // LOG TRANSACTION
        await logTransaction(supabase, {
            fid,
            type: tx_hash ? 'USDC_BUY' : 'PURCHASE_SKIN',
            amount: cost,
            currency: tx_hash ? 'USDC' : (cost > 0 ? 'TOKENS' : 'FREE'),
            item_id: skinId,
            description: tx_hash ? `Purchased skin via USDC: ${skinId}` : `Purchased skin via tokens: ${skinId}`,
            tx_hash: tx_hash
        });

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
export async function purchaseThemeAction(fid: number, themeId: string, cost: number, tx_hash?: string) {
    console.log(`[SERVER_SHOP] 🎨 Purchase ${themeId} for FID ${fid} (Cost: ${cost}, Tx: ${tx_hash || 'none'})`);
    try {
        const supabase = getSupabaseService();
        const { data: user, error: fetchError } = await supabase.from('users').select('tokens, unlocked_themes').eq('fid', fid).single();
        if (fetchError) return handleDBError(fid, 'Fetch user for theme', fetchError);
        if (user.tokens < cost && !tx_hash) return { success: false, error: 'Insufficient tokens' };

        const currentThemes = Array.isArray(user.unlocked_themes) ? user.unlocked_themes : [];
        if (currentThemes.includes(themeId)) return { success: true };

        const { error: updateError } = await supabase.from('users').update({
            tokens: tx_hash ? user.tokens : user.tokens - cost,
            unlocked_themes: [...currentThemes, themeId],
            updated_at: new Date().toISOString()
        }).eq('fid', fid);

        if (updateError) return handleDBError(fid, 'Apply theme purchase', updateError);

        // LOG TRANSACTION
        await logTransaction(supabase, {
            fid,
            type: tx_hash ? 'USDC_BUY' : 'PURCHASE_THEME',
            amount: cost,
            currency: tx_hash ? 'USDC' : (cost > 0 ? 'TOKENS' : 'FREE'),
            item_id: themeId,
            description: tx_hash ? `Purchased theme via USDC: ${themeId}` : `Purchased theme via tokens: ${themeId}`,
            tx_hash: tx_hash
        });

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
}, referrer_fid?: number) {
    console.log(`[SERVER_SYNC] 👤 Syncing profile for FID ${profile.fid} (Referrer: ${referrer_fid || 'none'})`);

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

        // --- NEW: Referral Processing Logic ---
        if (referrer_fid && referrer_fid !== profile.fid) {
            console.log(`[REFERRAL_LOG] 🔍 Checking if ${profile.fid} was already referred...`);
            // Check if this user was already referred (to avoid double rewarding for same invitee)
            const { data: alreadyReferred } = await supabase.from('referrals').select('id').eq('referee_fid', profile.fid).single();

            if (!alreadyReferred) {
                console.log(`[REFERRAL_LOG] 🎁 New referral detected! Link: ${referrer_fid} -> ${profile.fid}`);
                // 1. Create referral record
                const { error: refError } = await supabase.from('referrals').insert({
                    referrer_fid: referrer_fid,
                    referee_fid: profile.fid,
                    reward_amount: 23
                });

                if (!refError) {
                    console.log(`[REFERRAL_LOG] 💰 Success! Rewarding referrer ${referrer_fid} with 23 tokens...`);

                    // 2. Increment stats and reward tokens to referrer atomically
                    const { error: rpcError } = await supabase.rpc('increment_referral_and_reward', {
                        p_referrer_fid: referrer_fid,
                        p_reward: 23
                    });

                    if (rpcError) {
                        console.error(`[REFERRAL_LOG] ❌ RPC Error reward failed:`, rpcError.message);
                    } else {
                        console.log(`[REFERRAL_LOG] ✅ Referrer ${referrer_fid} rewarded successfully.`);
                        // 3. Log transaction for auditor
                        await logTransaction(supabase, {
                            fid: referrer_fid,
                            type: 'REFERRAL_BONUS',
                            amount: 23,
                            currency: 'TOKENS',
                            description: `Bonus for inviting ${profile.username || 'a new user'} (FID: ${profile.fid})`
                        });
                    }
                } else {
                    console.error(`[REFERRAL_LOG] ❌ Failed to insert referral record:`, refError.message);
                }
            } else {
                console.log(`[REFERRAL_LOG] ⏭️ User ${profile.fid} was already referred before. skipping reward.`);
            }
        }
        // --------------------------------------

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

        // LOG TRANSACTION
        await logTransaction(supabase, {
            fid,
            type: 'WELCOME_REWARD',
            amount: rewardAmount,
            currency: 'TOKENS',
            description: 'Claimed 230 tokens welcome gift'
        });

        console.log(`[SERVER_REWARD] ✅ Success! FID ${fid} received ${rewardAmount} tokens.`);
        revalidatePath('/');
        return { success: true, amount: rewardAmount };
    } catch (e: any) {
        return handleDBError(fid, 'Exception in welcome reward', e);
    }
}

/**
 * Explicitly log a USDC transaction (usually called after blockchain confirm)
 */
export async function logUSDCTransactionAction(fid: number, data: {
    amount: number,
    item_id: string,
    tx_hash: string,
    description: string
}) {
    console.log(`[SERVER_AUDIT] ⛓️ Logging USDC Tx for FID ${fid}: ${data.tx_hash}`);
    try {
        const supabase = getSupabaseService();
        await logTransaction(supabase, {
            fid,
            type: 'USDC_BUY',
            amount: data.amount,
            currency: 'USDC',
            item_id: data.item_id,
            description: data.description,
            tx_hash: data.tx_hash
        });
        return { success: true };
    } catch (e: any) {
        return handleDBError(fid, 'Log USDC transaction', e);
    }
}
/**
 * Claim a referral milestone reward (tokens or USDC)
 * - Token milestones: credited instantly in Supabase
 * - USDC milestones: triggers on-chain transfer via /api/claim-usdc-milestone
 */
export async function claimReferralMilestoneAction(fid: number, milestoneId: string) {
    console.log(`[REFERRAL_CLAIM] 🎖️ FID ${fid} claiming milestone ${milestoneId}`);
    try {
        const supabase = getSupabaseService();

        // 1. Defined milestones
        const milestones: Record<string, { count: number, reward: number, currency: string }> = {
            '10_REFS': { count: 10, reward: 1000, currency: 'TOKENS' },
            '20_REFS': { count: 20, reward: 2500, currency: 'TOKENS' },
            '50_REFS': { count: 50, reward: 75000, currency: 'TOKENS' },
            '100_REFS': { count: 100, reward: 0.23, currency: 'USDC' },
            '1000_REFS': { count: 1000, reward: 2.3, currency: 'USDC' }
        };

        const milestone = milestones[milestoneId];
        if (!milestone) return { success: false, error: 'Invalid milestone' };

        // 2. Verify referral count and previous claims
        const { data: user, error: userError } = await supabase.from('users').select('referral_count, tokens').eq('fid', fid).single();
        if (userError || !user) return handleDBError(fid, 'Fetch user for claim', userError);

        if (user.referral_count < milestone.count) return { success: false, error: 'Not enough referrals' };

        const { data: existingClaim } = await supabase.from('referral_claims').select('id').eq('fid', fid).eq('milestone_id', milestoneId).single();
        if (existingClaim) return { success: false, error: 'Already claimed' };

        // 3. Process Reward
        if (milestone.currency === 'TOKENS') {
            const { error: updateError } = await supabase.from('users').update({
                tokens: user.tokens + milestone.reward,
                updated_at: new Date().toISOString()
            }).eq('fid', fid);
            if (updateError) return handleDBError(fid, 'Update token balance', updateError);

            // Record Claim for token milestones
            await supabase.from('referral_claims').insert({
                fid,
                milestone_id: milestoneId,
                reward_type: milestone.currency,
                reward_amount: milestone.reward
            });

            // Log Transaction
            await logTransaction(supabase, {
                fid,
                type: 'REFERRAL_MILESTONE',
                amount: milestone.reward,
                currency: milestone.currency,
                description: `Claimed milestone ${milestoneId} (${milestone.count} referrals)`
            });

            console.log(`[REFERRAL_CLAIM] ✅ Tokens credited: FID ${fid} +${milestone.reward} tokens`);

        } else {
            // USDC Milestone: delegate to the on-chain API
            // The API handles: double-claim prevention, referral_claims insert, tx logging
            console.log(`[REFERRAL_CLAIM] 💰 USDC milestone - calling /api/claim-usdc-milestone for FID ${fid}`);
            const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://party-land.vercel.app';
            const apiRes = await fetch(`${baseUrl}/api/claim-usdc-milestone`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fid, milestoneId })
            });

            const apiData = await apiRes.json();
            if (!apiRes.ok || !apiData.success) {
                console.error(`[REFERRAL_CLAIM] ❌ USDC API failed:`, apiData);
                return { success: false, error: apiData.error || 'USDC transfer failed' };
            }

            console.log(`[REFERRAL_CLAIM] ✅ USDC sent! TX: ${apiData.transactionHash}`);
            revalidatePath('/');
            return { success: true, txHash: apiData.transactionHash, reward: apiData.reward };
        }

        revalidatePath('/');
        return { success: true };
    } catch (e: any) {
        return handleDBError(fid, 'Exception in referral claim', e);
    }
}

/**
 * Get the top 50 users by referral count (public leaderboard)
 */
export async function getReferralRankingAction() {
    try {
        const supabase = getSupabaseService();
        const { data, error } = await supabase
            .from('users')
            .select('fid, username, display_name, pfp_url, referral_count')
            .gt('referral_count', 0) // only users who have at least 1 referral
            .order('referral_count', { ascending: false })
            .limit(50);

        if (error) {
            console.error('[RANKING] ❌ Error fetching ranking:', error);
            return { success: false, data: [] };
        }

        return { success: true, data: data ?? [] };
    } catch (e: any) {
        console.error('[RANKING] ❌ Exception:', e);
        return { success: false, data: [] };
    }
}

/**
 * Get the top 50 users by token balance (public leaderboard)
 */
export async function getTokenRankingAction() {
    try {
        const supabase = getSupabaseService();
        const { data, error } = await supabase
            .from('users')
            .select('fid, username, display_name, pfp_url, tokens')
            .gt('tokens', 0) // only users who have at least 1 token
            .order('tokens', { ascending: false })
            .limit(50);

        if (error) {
            console.error('[TOKEN_RANKING] ❌ Error fetching ranking:', error);
            return { success: false, data: [] };
        }

        return { success: true, data: data ?? [] };
    } catch (e: any) {
        console.error('[TOKEN_RANKING] ❌ Exception:', e);
        return { success: false, data: [] };
    }
}

/**
 * Verify and claim social missions
 */
export async function claimMissionAction(fid: number, missionType: 'farcaster' | 'base') {
    try {
        const supabase = getSupabaseService();
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('tokens, notification_token, base_notification_token, farcaster_verified, base_verified')
            .eq('fid', fid)
            .single();

        if (fetchError || !user) return { success: false, error: 'User not found' };

        // 1. Verify notification token exists
        if (missionType === 'farcaster' && !user.notification_token) {
            return { success: false, error: 'NOT_VERIFIED' };
        }
        if (missionType === 'base' && !user.base_notification_token) {
            return { success: false, error: 'NOT_VERIFIED' };
        }

        // 2. Prevent Double Claiming securely checking the new boolean columns
        if (missionType === 'farcaster' && user.farcaster_verified) {
            return { success: false, error: 'ALREADY_CLAIMED' };
        }
        if (missionType === 'base' && user.base_verified) {
            return { success: false, error: 'ALREADY_CLAIMED' };
        }

        const desc = missionType === 'farcaster' ? 'Farcaster Verification Task' : 'Base App Verification Task';

        // 3. Award Tokens
        const reward = 2300;
        const newTotal = (user.tokens || 0) + reward;

        const { error: updateError } = await supabase
            .from('users')
            .update({
                tokens: newTotal,
                farcaster_verified: missionType === 'farcaster' ? true : user.farcaster_verified,
                base_verified: missionType === 'base' ? true : user.base_verified,
                updated_at: new Date().toISOString()
            })
            .eq('fid', fid);

        if (updateError) return { success: false, error: 'Update failed' };

        await logTransaction(supabase, {
            fid,
            type: 'EARN',
            amount: reward,
            currency: 'TOKENS',
            description: desc
        });

        revalidatePath('/');
        return { success: true, tokens: newTotal };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * Get mission statuses for a user
 */
export async function getMissionStatusAction(fid: number) {
    try {
        const supabase = getSupabaseService();
        const { data: user } = await supabase
            .from('users')
            .select('farcaster_verified, base_verified')
            .eq('fid', fid)
            .single();

        return {
            success: true,
            farcasterClaimed: !!user?.farcaster_verified,
            baseClaimed: !!user?.base_verified
        };
    } catch (e) {
        return { success: false, farcasterClaimed: false, baseClaimed: false };
    }
}
