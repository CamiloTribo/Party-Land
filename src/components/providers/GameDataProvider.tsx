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
    updatePreferencesAction
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

    // Explicit Mutation Functions
    addTokens: (amount: number, reason: string) => Promise<void>;
    buySkin: (skinId: string, cost: number) => Promise<boolean>;
    buyTheme: (themeId: string, cost: number) => Promise<boolean>;
    selectSkin: (skinId: string) => Promise<void>;
    selectTheme: (themeId: string) => Promise<void>;
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

                // Parallel save to localstorage for instant load next time
                localStorage.setItem('gameTokens', data.tokens.toString());
            }
        } catch (e) {
            console.error('Fetch failed:', e);
        } finally {
            setIsSyncing(false);
        }
    }, []);

    useEffect(() => {
        if (user?.fid) fetchState(user.fid);
    }, [user?.fid, fetchState]);

    // 2. Initial LocalStorage load (for UI snapiness only)
    useEffect(() => {
        const t = localStorage.getItem('gameTokens');
        if (t) setTokens(parseInt(t));
    }, []);

    // --- MUTATION FUNCTIONS (EXPLICIT) ---

    const addTokens = async (amount: number, reason: string = 'game reward') => {
        if (!user?.fid) return;

        // Optimistic UI
        setTokens(prev => prev + amount);

        // Server Sync
        const res = await updateUserTokensAction(user.fid, amount, reason);
        if (!res.success) {
            console.error('Token sync failed, reverting...');
            setTokens(prev => prev - amount); // Revert
        } else if (res.tokens !== undefined) {
            setTokens(res.tokens); // Ensure exact sync
            localStorage.setItem('gameTokens', res.tokens.toString());
        }
    };

    const buySkin = async (skinId: string, cost: number) => {
        if (!user?.fid || tokens < cost) return false;

        // Optimistic UI
        setTokens(prev => prev - cost);
        setUnlockedSkins(prev => [...prev, skinId]);

        const res = await purchaseSkinAction(user.fid, skinId, cost);
        if (!res.success) {
            console.error('Purchase failed, reverting...');
            await fetchState(user.fid); // Re-fetch whole state to be safe
            return false;
        }
        localStorage.setItem('gameTokens', (tokens - cost).toString());
        return true;
    };

    const buyTheme = async (themeId: string, cost: number) => {
        if (!user?.fid || tokens < cost) return false;

        setTokens(prev => prev - cost);
        setUnlockedThemes(prev => [...prev, themeId]);

        const res = await purchaseThemeAction(user.fid, themeId, cost);
        if (!res.success) {
            await fetchState(user.fid);
            return false;
        }
        localStorage.setItem('gameTokens', (tokens - cost).toString());
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
        addTokens,
        buySkin,
        buyTheme,
        selectSkin,
        selectTheme,
        forceRefresh: () => user?.fid ? fetchState(user.fid) : Promise.resolve(),
    };

    return <GameDataContext.Provider value={value}>{children}</GameDataContext.Provider>;
}

export function useGameData() {
    const context = useContext(GameDataContext);
    if (context === undefined) throw new Error('useGameData must be used within a GameDataProvider');
    return context;
}
