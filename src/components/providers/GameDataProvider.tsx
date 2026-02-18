'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useNeynarUser } from '~/hooks/useNeynarUser';
import { useMiniApp } from '@neynar/react';
import { useUSDCBalance } from '~/hooks/useUSDCBalance';
import { supabase } from '~/lib/supabase';
import {
    updateUserTokensAction,
    addUnlockedSkinAction,
    addUnlockedThemeAction,
    updatePreferencesAction
} from '~/app/actions/userActions';

interface GameDataContextType {
    tokens: number;
    setTokens: (val: number | ((prev: number) => number)) => void;
    unlockedSkins: string[];
    selectedSkin: string;
    setSelectedSkin: (skinId: string) => void;
    unlockSkin: (skinId: string) => void;
    unlockedThemes: string[];
    selectedTheme: string;
    setSelectedTheme: (themeId: string) => void;
    unlockTheme: (themeId: string) => void;
    usdcBalance: number;
    usdcLoading: boolean;
    refetchUSDC: () => void;
    walletAddress?: string;
    isConnected: boolean;
    fid?: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
}

const GameDataContext = createContext<GameDataContextType | undefined>(undefined);

const DEFAULT_SKINS = ['classic'];
const DEFAULT_THEMES = ['classic-pink', 'ocean-blue', 'forest-green', 'sunset-orange'];
const DEFAULT_SKIN = 'classic';
const DEFAULT_THEME = 'classic-pink';

export function GameDataProvider({ children }: { children: React.ReactNode }) {
    const { context } = useMiniApp();
    const { address: walletAddress, isConnected } = useAccount();
    const { user } = useNeynarUser(context || undefined);
    const { balance: usdcBalance, loading: usdcLoading, refetch: refetchUSDC } = useUSDCBalance();

    const isLoadedFromLocalStorage = useRef(false);
    const isSyncingFromDB = useRef(false);
    const lastSyncedTokens = useRef<number | null>(null);

    // State
    const [tokens, setTokens] = useState(0);
    const [unlockedSkins, setUnlockedSkins] = useState<string[]>(DEFAULT_SKINS);
    const [selectedSkin, setSelectedSkin] = useState(DEFAULT_SKIN);
    const [unlockedThemes, setUnlockedThemes] = useState<string[]>(DEFAULT_THEMES);
    const [selectedTheme, setSelectedTheme] = useState(DEFAULT_THEME);

    // 1. Load LocalStorage immediately
    useEffect(() => {
        if (typeof window !== 'undefined' && !isLoadedFromLocalStorage.current) {
            console.log('📦 [GameProvider] Loading LocalStorage...');
            const t = localStorage.getItem('gameTokens');
            const s = localStorage.getItem('unlockedSkins');
            const sk = localStorage.getItem('selectedSkin');
            const th = localStorage.getItem('unlockedThemes');
            const tm = localStorage.getItem('selectedTheme');

            if (t) setTokens(parseInt(t));
            if (s) setUnlockedSkins(JSON.parse(s));
            if (sk) setSelectedSkin(sk);
            if (th) setUnlockedThemes(JSON.parse(th));
            if (tm) setSelectedTheme(tm);

            isLoadedFromLocalStorage.current = true;
        }
    }, []);

    // 2. Sync FROM DB
    useEffect(() => {
        async function fetchUser() {
            if (!user?.fid) return;

            isSyncingFromDB.current = true;
            console.log(`🔄 [GameProvider] Fetching DB for FID: ${user.fid}`);

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('fid', user.fid)
                .single();

            if (!error && data) {
                console.log('✅ [GameProvider] DB Data Loaded:', data);
                setTokens(data.tokens);
                lastSyncedTokens.current = data.tokens;
                setUnlockedSkins(data.unlocked_skins || DEFAULT_SKINS);
                setSelectedSkin(data.selected_skin || DEFAULT_SKIN);
                setUnlockedThemes(data.unlocked_themes || DEFAULT_THEMES);
                setSelectedTheme(data.selected_theme || DEFAULT_THEME);
            } else if (error && error.code === 'PGRST116') {
                console.log('🆕 [GameProvider] Creating DB record for new user');
                await supabase.from('users').upsert({
                    fid: user.fid,
                    username: user.username,
                    display_name: user.display_name,
                    pfp_url: user.pfp_url,
                    tokens: tokens,
                    unlocked_skins: unlockedSkins,
                    unlocked_themes: unlockedThemes,
                    selected_skin: selectedSkin,
                    selected_theme: selectedTheme,
                });
                lastSyncedTokens.current = tokens;
            }
            isSyncingFromDB.current = false;
        }

        if (user?.fid) fetchUser();
    }, [user?.fid]);

    // 3. Save to LocalStorage
    useEffect(() => {
        if (!isLoadedFromLocalStorage.current) return;
        localStorage.setItem('gameTokens', tokens.toString());
        localStorage.setItem('unlockedSkins', JSON.stringify(unlockedSkins));
        localStorage.setItem('selectedSkin', selectedSkin);
        localStorage.setItem('unlockedThemes', JSON.stringify(unlockedThemes));
        localStorage.setItem('selectedTheme', selectedTheme);
    }, [tokens, unlockedSkins, selectedSkin, unlockedThemes, selectedTheme]);

    // 4. SYNC TO DB (The important part)
    useEffect(() => {
        if (!user?.fid || isSyncingFromDB.current) return;

        // Avoid double syncing if value hasn't changed from DB
        if (lastSyncedTokens.current === tokens) return;

        const syncTokens = async () => {
            console.log(`🌐 [GameProvider] SYNCING TO DB: ${tokens} (FID: ${user.fid})`);
            try {
                const result = await updateUserTokensAction(user.fid, tokens, 'Auto-sync');
                console.log('📡 [GameProvider] Sync Result:', result);
                if (result.success) {
                    lastSyncedTokens.current = tokens;
                }
            } catch (err) {
                console.error('❌ [GameProvider] Sync Failed:', err);
            }
        };

        // Debounce/Delay slightly if needed, but for now direct call
        syncTokens();
    }, [tokens, user?.fid]);

    // Actions
    const setSelectedSkinWithSync = useCallback((skinId: string) => {
        setSelectedSkin(skinId);
        if (user?.fid) updatePreferencesAction(user.fid, { selected_skin: skinId }).catch(console.error);
    }, [user?.fid]);

    const unlockSkinWithSync = useCallback((skinId: string) => {
        setUnlockedSkins(prev => {
            if (prev.includes(skinId)) return prev;
            const next = [...prev, skinId];
            if (user?.fid) addUnlockedSkinAction(user.fid, skinId).catch(console.error);
            return next;
        });
    }, [user?.fid]);

    const setSelectedThemeWithSync = useCallback((themeId: string) => {
        setSelectedTheme(themeId);
        if (user?.fid) updatePreferencesAction(user.fid, { selected_theme: themeId }).catch(console.error);
    }, [user?.fid]);

    const unlockThemeWithSync = useCallback((themeId: string) => {
        setUnlockedThemes(prev => {
            if (prev.includes(themeId)) return prev;
            const next = [...prev, themeId];
            if (user?.fid) addUnlockedThemeAction(user.fid, themeId).catch(console.error);
            return next;
        });
    }, [user?.fid]);

    const value = {
        tokens,
        setTokens, // Use direct setter, the useEffect handles the sync
        unlockedSkins,
        selectedSkin,
        setSelectedSkin: setSelectedSkinWithSync,
        unlockSkin: unlockSkinWithSync,
        unlockedThemes,
        selectedTheme,
        setSelectedTheme: setSelectedThemeWithSync,
        unlockTheme: unlockThemeWithSync,
        usdcBalance,
        usdcLoading,
        refetchUSDC,
        walletAddress,
        isConnected,
        fid: user?.fid,
        username: user?.username,
        displayName: user?.display_name,
        pfpUrl: user?.pfp_url,
    };

    return <GameDataContext.Provider value={value}>{children}</GameDataContext.Provider>;
}

export function useGameData() {
    const context = useContext(GameDataContext);
    if (context === undefined) {
        throw new Error('useGameData must be used within a GameDataProvider');
    }
    return context;
}
