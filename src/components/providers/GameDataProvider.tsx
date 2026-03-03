'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useNeynarUser } from '~/hooks/useNeynarUser';
import { useMiniApp } from '@neynar/react';
import { useUSDCBalance } from '~/hooks/useUSDCBalance';
import { supabase } from '~/lib/supabase';
import {
    updateUserTokensAction,
    purchaseSkinAction,
    purchaseThemeAction,
    updatePreferencesAction,
    syncUserProfileAction,
    claimWelcomeRewardAction,
    claimReferralMilestoneAction
} from '~/app/actions/userActions';

interface GameDataContextType {
    tokens: number;
    unlockedSkins: string[];
    selectedSkin: string;
    unlockedThemes: string[];
    selectedTheme: string;
    usdcBalance: number;
    usdcLoading: boolean;
    refetchUSDC: () => void;
    walletAddress?: string;
    isConnected: boolean;
    fid?: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
    isSyncing: boolean;
    welcomeRewardClaimed: boolean;
    referralCount: number;
    claimedMilestones: string[];

    // Explicit Mutation Functions
    addTokens: (amount: number, reason: string) => Promise<void>;
    buySkin: (skinId: string, cost: number, txHash?: string) => Promise<boolean>;
    buyTheme: (themeId: string, cost: number, txHash?: string) => Promise<boolean>;
    selectSkin: (skinId: string) => Promise<void>;
    selectTheme: (themeId: string) => Promise<void>;
    claimReward: () => Promise<void>;
    claimMilestone: (milestoneId: string) => Promise<false | { txHash?: string }>;
    forceRefresh: () => Promise<void>;
}

const GameDataContext = createContext<GameDataContextType | undefined>(undefined);

const DEFAULT_SKINS = ['classic'];
const DEFAULT_THEMES = ['classic-pink', 'ocean-blue', 'forest-green', 'sunset-orange'];

export function GameDataProvider({ children }: { children: React.ReactNode }) {
    const { context } = useMiniApp();
    const { address: walletAddress, isConnected } = useAccount();
    const { user } = useNeynarUser(context || undefined);
    const { balance: usdcBalance, loading: usdcLoading, refetch: refetchUSDC } = useUSDCBalance();

    const [tokens, setTokens] = useState(0);
    const [unlockedSkins, setUnlockedSkins] = useState<string[]>(DEFAULT_SKINS);
    const [selectedSkin, setSelectedSkin] = useState('classic');
    const [unlockedThemes, setUnlockedThemes] = useState<string[]>(DEFAULT_THEMES);
    const [selectedTheme, setSelectedTheme] = useState('classic-pink');
    const [isSyncing, setIsSyncing] = useState(true);
    const [welcomeRewardClaimed, setWelcomeRewardClaimed] = useState(true); // Default to true to hide initially
    const [referralCount, setReferralCount] = useState(0);
    const [claimedMilestones, setClaimedMilestones] = useState<string[]>([]);

    // 1. Fetch source of truth from Database on mount/login
    const fetchState = useCallback(async (fid: number) => {
        setIsSyncing(true);
        console.log(`📡 [GameProvider] Fetching DB for FID: ${fid}`);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('fid', fid)
                .single();

            if (data && !error) {
                setTokens(data.tokens || 0);
                setUnlockedSkins(data.unlocked_skins || DEFAULT_SKINS);
                setSelectedSkin(data.selected_skin || 'classic');
                setUnlockedThemes(data.unlocked_themes || DEFAULT_THEMES);
                setSelectedTheme(data.selected_theme || 'classic-pink');
                setWelcomeRewardClaimed(data.welcome_reward_claimed || false);
                setReferralCount(data.referral_count || 0);

                // Fetch claimed milestones
                const { data: claimsData } = await supabase
                    .from('referral_claims')
                    .select('milestone_id')
                    .eq('fid', fid);

                if (claimsData) {
                    setClaimedMilestones(claimsData.map(c => c.milestone_id));
                }

                // Parallel save to localstorage for instant load next time
                localStorage.setItem('gameTokens', data.tokens.toString());
            }
        } catch (e) {
            console.error('Fetch failed:', e);
        } finally {
            setIsSyncing(false);
        }
    }, []);

    // Silent token refresh — updates balance without triggering loading screen (isSyncing = true)
    const silentFetchTokens = useCallback(async (fid: number) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('tokens, referral_count')
                .eq('fid', fid)
                .single();
            if (data && !error) {
                setTokens(data.tokens || 0);
                setReferralCount(data.referral_count || 0);
                localStorage.setItem('gameTokens', data.tokens.toString());
            }
        } catch (e) {
            console.error('Silent fetch failed:', e);
        }
    }, []);

    useEffect(() => {
        if (user?.fid) {
            // Detect referrer from URL params (e.g. ?ref=123)
            let referrerFid: number | undefined;
            if (typeof window !== 'undefined') {
                const urlParams = new URLSearchParams(window.location.search);
                const refParam = urlParams.get('ref') || urlParams.get('referrer');
                if (refParam) {
                    const parsed = parseInt(refParam);
                    if (!isNaN(parsed) && parsed !== user.fid) {
                        referrerFid = parsed;
                        console.log(`[Referral] Detected potential referrer: ${referrerFid}`);
                    }
                }
            }

            // Aseguramos que el perfil esté sincronizado con Supabase
            syncUserProfileAction({
                fid: user.fid,
                username: user.username,
                display_name: user.display_name,
                pfp_url: user.pfp_url,
                wallet_address: user.wallet_address
            }, referrerFid).then(() => {
                fetchState(user.fid!);
            });
        }
    }, [user?.fid, user?.username, user?.display_name, user?.pfp_url, fetchState]);

    // 2. Initial LocalStorage load (for UI snapiness only)
    useEffect(() => {
        const t = localStorage.getItem('gameTokens');
        if (t) setTokens(parseInt(t));
    }, []);

    // --- MUTATION FUNCTIONS (EXPLICIT) ---

    // Maximum tokens that can be earned in a single game transaction (must match server)
    const MAX_CLIENT_EARN = 700;

    const addTokens = async (amount: number, reason: string = 'game reward') => {
        // Security: require a valid authenticated FID
        if (!user?.fid || user.fid <= 0) {
            console.error('[SECURITY] addTokens called without valid FID – ignoring');
            return;
        }

        // Security: reject negative, zero, or insane amounts on the client too
        if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
            console.error('[SECURITY] addTokens called with invalid amount:', amount);
            return;
        }

        // Security: clamp to the max physically possible in the game
        const safeAmount = Math.min(Math.floor(amount), MAX_CLIENT_EARN);
        if (safeAmount !== amount) {
            console.warn(`[SECURITY] addTokens amount clamped from ${amount} to ${safeAmount}`);
        }

        // Optimistic UI
        setTokens(prev => prev + safeAmount);

        // Server Sync
        const res = await updateUserTokensAction(user.fid, safeAmount, reason);
        if (!res.success) {
            console.error('[SECURITY] Token sync failed (server rejected):', res);
            setTokens(prev => prev - safeAmount); // Revert optimistic update
        } else if ('tokens' in res && res.tokens !== undefined) {
            setTokens(res.tokens); // Ensure exact server-authoritative sync
            localStorage.setItem('gameTokens', res.tokens.toString());
        }
    };

    const buySkin = async (skinId: string, cost: number, txHash?: string) => {
        if (!user?.fid) return false;
        if (!txHash && tokens < cost) return false;

        // Optimistic UI (if not USDC)
        if (!txHash) {
            setTokens(prev => prev - cost);
            localStorage.setItem('gameTokens', (tokens - cost).toString());
        }
        setUnlockedSkins(prev => [...prev, skinId]);

        const res = await purchaseSkinAction(user.fid, skinId, cost, txHash);
        if (!res.success) {
            console.error('Purchase failed, reverting...');
            await fetchState(user.fid); // Re-fetch whole state to be safe
            return false;
        }
        return true;
    };

    const buyTheme = async (themeId: string, cost: number, txHash?: string) => {
        if (!user?.fid) return false;
        if (!txHash && tokens < cost) return false;

        if (!txHash) {
            setTokens(prev => prev - cost);
            localStorage.setItem('gameTokens', (tokens - cost).toString());
        }
        setUnlockedThemes(prev => [...prev, themeId]);

        const res = await purchaseThemeAction(user.fid, themeId, cost, txHash);
        if (!res.success) {
            await fetchState(user.fid);
            return false;
        }
        return true;
    };

    const selectSkin = async (skinId: string) => {
        setSelectedSkin(skinId);
        if (user?.fid) updatePreferencesAction(user.fid, { selected_skin: skinId }).catch(console.error);
    };

    const selectTheme = async (themeId: string) => {
        setSelectedTheme(themeId);
        if (user?.fid) updatePreferencesAction(user.fid, { selected_theme: themeId }).catch(console.error);
    };

    const claimReward = async () => {
        if (!user?.fid || welcomeRewardClaimed) return;

        const res = await claimWelcomeRewardAction(user.fid);
        if (res.success && 'amount' in res) {
            setTokens(prev => prev + (res.amount as number));
            setWelcomeRewardClaimed(true);
            localStorage.setItem('gameTokens', (tokens + (res.amount as number)).toString());
        }
    };

    const claimMilestone = async (milestoneId: string): Promise<false | { txHash?: string }> => {
        if (!user?.fid) return false;
        const res = await claimReferralMilestoneAction(user.fid, milestoneId);
        if (res.success) {
            // Silent update — avoids isSyncing=true which causes full re-render to start screen
            await silentFetchTokens(user.fid);
            setClaimedMilestones(prev => [...prev, milestoneId]);
            return { txHash: (res as any).txHash };
        }
        return false;
    };

    const value = {
        tokens,
        unlockedSkins,
        selectedSkin,
        unlockedThemes,
        selectedTheme,
        usdcBalance,
        usdcLoading,
        refetchUSDC,
        walletAddress,
        isConnected,
        fid: user?.fid,
        username: user?.username,
        displayName: user?.display_name,
        pfpUrl: user?.pfp_url,
        isSyncing,
        welcomeRewardClaimed,
        referralCount,
        claimedMilestones,
        addTokens,
        buySkin,
        buyTheme,
        selectSkin,
        selectTheme,
        claimReward,
        claimMilestone,
        forceRefresh: () => user?.fid ? silentFetchTokens(user.fid) : Promise.resolve(),
    };

    return <GameDataContext.Provider value={value}>{children}</GameDataContext.Provider>;
}

export function useGameData() {
    const context = useContext(GameDataContext);
    if (context === undefined) throw new Error('useGameData must be used within a GameDataProvider');
    return context;
}
