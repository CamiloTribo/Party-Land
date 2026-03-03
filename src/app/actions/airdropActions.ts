'use server';

import { getSupabaseService } from '~/lib/supabase';
import { revalidatePath } from 'next/cache';

export interface ActiveAirdrop {
    id: string;
    week_number: number;
    label: string;
    end_at: string;
    pool_usdc: number;
    participant_count: number;
    payout_per_person: number;
    status: string;
}

export interface AirdropParticipation {
    joined: boolean;
    airdrop_id?: string;
}

/**
 * Get the currently active airdrop with live payout calculation.
 */
export async function getActiveAirdropAction(): Promise<ActiveAirdrop | null> {
    try {
        const supabase = getSupabaseService();
        const { data, error } = await supabase
            .from('airdrops')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) return null;

        const payout_per_person = data.participant_count > 0
            ? data.pool_usdc / data.participant_count
            : data.pool_usdc; // If no participants yet, full pool goes to first person

        return {
            id: data.id,
            week_number: data.week_number,
            label: data.label,
            end_at: data.end_at,
            pool_usdc: parseFloat(data.pool_usdc),
            participant_count: data.participant_count,
            payout_per_person: parseFloat(payout_per_person.toFixed(4)),
            status: data.status,
        };
    } catch {
        return null;
    }
}

/**
 * Check if a user has already joined the current active airdrop.
 */
export async function checkUserParticipationAction(fid: number): Promise<AirdropParticipation> {
    if (!fid) return { joined: false };

    try {
        const supabase = getSupabaseService();

        // Get active airdrop
        const { data: airdrop } = await supabase
            .from('airdrops')
            .select('id')
            .eq('status', 'active')
            .limit(1)
            .single();

        if (!airdrop) return { joined: false };

        // Check if user is in it
        const { data: participant } = await supabase
            .from('airdrop_participants')
            .select('id')
            .eq('airdrop_id', airdrop.id)
            .eq('fid', fid)
            .single();

        return {
            joined: !!participant,
            airdrop_id: airdrop.id,
        };
    } catch {
        return { joined: false };
    }
}

/**
 * Register a user into the active airdrop after USDC payment confirmed.
 * Burns 1500 tokens and updates the pool.
 */
export async function joinAirdropAction(
    fid: number,
    username: string,
    wallet_address: string,
    tx_hash: string,
): Promise<{
    success: boolean;
    pool_usdc?: number;
    participant_count?: number;
    payout_per_person?: number;
    error?: string;
}> {
    if (!fid || !tx_hash) return { success: false, error: 'Missing required fields' };

    try {
        const supabase = getSupabaseService();

        // 1. Get active airdrop
        const { data: airdrop, error: airdropError } = await supabase
            .from('airdrops')
            .select('*')
            .eq('status', 'active')
            .limit(1)
            .single();

        if (airdropError || !airdrop) return { success: false, error: 'No active airdrop found' };

        // 2. Guard: already joined?
        const { data: existing } = await supabase
            .from('airdrop_participants')
            .select('id')
            .eq('airdrop_id', airdrop.id)
            .eq('fid', fid)
            .single();

        if (existing) return { success: false, error: 'Already joined this airdrop' };

        // 3. Check user has 1500 tokens
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('tokens, username, wallet_address')
            .eq('fid', fid)
            .single();

        if (userError || !user) return { success: false, error: 'User not found' };
        if ((user.tokens || 0) < 1500) return { success: false, error: 'Insufficient tokens (need 1500)' };

        // 4. Burn 1500 tokens
        const { error: tokenError } = await supabase
            .from('users')
            .update({
                tokens: user.tokens - 1500,
                updated_at: new Date().toISOString(),
            })
            .eq('fid', fid);

        if (tokenError) return { success: false, error: 'Failed to deduct tokens' };

        // 5. Insert participant record
        const { error: participantError } = await supabase
            .from('airdrop_participants')
            .insert({
                airdrop_id: airdrop.id,
                fid,
                username: username || user.username,
                wallet_address: wallet_address || user.wallet_address,
                tokens_spent: 1500,
                usdc_paid: 0.023,
                tx_hash,
            });

        if (participantError) {
            // Refund tokens if participant insert failed
            await supabase
                .from('users')
                .update({ tokens: user.tokens, updated_at: new Date().toISOString() })
                .eq('fid', fid);
            return { success: false, error: 'Failed to register participation' };
        }

        // 6. Update airdrop pool + participant count
        const newPool = parseFloat((parseFloat(airdrop.pool_usdc) + 0.023).toFixed(4));
        const newCount = (airdrop.participant_count || 0) + 1;

        await supabase
            .from('airdrops')
            .update({
                pool_usdc: newPool,
                participant_count: newCount,
            })
            .eq('id', airdrop.id);

        // 7. Log in transactions
        await supabase.from('transactions').insert({
            fid,
            username: username || user.username,
            wallet_address: wallet_address || user.wallet_address,
            type: 'AIRDROP_ENTRY',
            amount: 0.023,
            currency: 'USDC',
            item_id: airdrop.id,
            description: `Entered ${airdrop.label}`,
            tx_hash,
        });

        // Also log token burn
        await supabase.from('transactions').insert({
            fid,
            username: username || user.username,
            wallet_address: wallet_address || user.wallet_address,
            type: 'SPEND',
            amount: 1500,
            currency: 'TOKENS',
            item_id: airdrop.id,
            description: `Token entry fee for ${airdrop.label}`,
        });

        const payout_per_person = parseFloat((newPool / newCount).toFixed(4));

        revalidatePath('/');
        return { success: true, pool_usdc: newPool, participant_count: newCount, payout_per_person };
    } catch (e: any) {
        console.error('[AIRDROP] ❌ joinAirdropAction error:', e.message);
        return { success: false, error: 'Internal error' };
    }
}

/**
 * Admin: close airdrop and record payout amounts.
 * Run this manually after the week ends, before distributing USDC.
 */
export async function closeAirdropAction(airdropId: string): Promise<{
    success: boolean;
    total_distributed?: number;
    participant_count?: number;
    payout_per_person?: number;
    participants?: { fid: number; username: string; wallet_address: string; payout_usdc: number }[];
    error?: string;
}> {
    try {
        const supabase = getSupabaseService();

        const { data: airdrop } = await supabase
            .from('airdrops')
            .select('*')
            .eq('id', airdropId)
            .single();

        if (!airdrop) return { success: false, error: 'Airdrop not found' };

        const { data: participants } = await supabase
            .from('airdrop_participants')
            .select('*')
            .eq('airdrop_id', airdropId);

        if (!participants || participants.length === 0) {
            await supabase.from('airdrops').update({ status: 'closed' }).eq('id', airdropId);
            return { success: true, total_distributed: 0, participant_count: 0, participants: [] };
        }

        const payout = parseFloat((airdrop.pool_usdc / participants.length).toFixed(6));

        // Update each participant's payout
        for (const p of participants) {
            await supabase
                .from('airdrop_participants')
                .update({ payout_usdc: payout })
                .eq('id', p.id);
        }

        // Close the airdrop
        await supabase.from('airdrops').update({ status: 'distributed' }).eq('id', airdropId);

        return {
            success: true,
            total_distributed: parseFloat(airdrop.pool_usdc),
            participant_count: participants.length,
            payout_per_person: payout,
            participants: participants.map(p => ({
                fid: p.fid,
                username: p.username,
                wallet_address: p.wallet_address,
                payout_usdc: payout,
            })),
        };
    } catch (e: any) {
        console.error('[AIRDROP] ❌ closeAirdropAction error:', e.message);
        return { success: false, error: e.message };
    }
}

/**
 * Get recent participants for the live social ticker in AirdropModal.
 * Returns up to 12 most recent entries for the scrolling activity feed.
 */
export async function getRecentParticipantsAction(airdropId: string): Promise<
    { username: string; joined_at: string }[]
> {
    try {
        const supabase = getSupabaseService();
        const { data } = await supabase
            .from('airdrop_participants')
            .select('username, joined_at')
            .eq('airdrop_id', airdropId)
            .order('joined_at', { ascending: false })
            .limit(12);

        return data ?? [];
    } catch {
        return [];
    }
}
