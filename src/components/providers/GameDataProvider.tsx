'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useNeynarUser } from '~/hooks/useNeynarUser';
import { useUSDCBalance } from '~/hooks/useUSDCBalance';
import { supabase } from '~/lib/supabase';
import {
    updateUserTokensAction,
    addUnlockedSkinAction,
    addUnlockedThemeAction,
    updatePreferencesAction
} from '~/app/actions/userActions';

// Default values
const DEFAULT_SKINS = ['classic'];
const DEFAULT_THEMES = ['classic-pink', 'ocean-blue', 'forest-green', 'sunset-orange'];
const DEFAULT_SKIN = 'classic';
const DEFAULT_THEME = 'classic-pink';

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

export function GameDataProvider({ children }: { children: React.ReactNode }) {
    const { address: walletAddress, isConnected } = useAccount();
    const { user } = useNeynarUser();
    const { balance: usdcBalance, loading: usdcLoading, refetch: refetchUSDC } = useUSDCBalance();

    const isLocalStorageLoaded = useRef(false);
    const isFirstSyncDone = useRef(false);

    // State
    const [tokens, setTokens] = useState(0);
    const [unlockedSkins, setUnlockedSkins] = useState<string[]>(DEFAULT_SKINS);
    const [selectedSkin, setSelectedSkin] = useState(DEFAULT_SKIN);
    const [unlockedThemes, setUnlockedThemes] = useState<string[]>(DEFAULT_THEMES);
    const [selectedTheme, setSelectedTheme] = useState(DEFAULT_THEME);

    // 1. Initial Load from LocalStorage (Fastest)
    useEffect(() => {
        if (typeof window !== 'undefined' && !isLocalStorageLoaded.current) {
            console.log('📦 [GameProvider] Initializing from LocalStorage');
            const savedTokens = localStorage.getItem('gameTokens');
            if (savedTokens) setTokens(parseInt(savedTokens));

            const savedSkins = localStorage.getItem('unlockedSkins');
            if (savedSkins) setUnlockedSkins(JSON.parse(savedSkins));

            const savedSkin = localStorage.getItem('selectedSkin');
            if (savedSkin) setSelectedSkin(savedSkin);

            const savedThemes = localStorage.getItem('unlockedThemes');
            if (savedThemes) setUnlockedThemes(JSON.parse(savedThemes));

            const savedTheme = localStorage.getItem('selectedTheme');
            if (savedTheme) setSelectedTheme(savedTheme);

            isLocalStorageLoaded.current = true;
        }
    }, []);

    // 2. Sync FROM Supabase (Source of Truth after login)
    useEffect(() => {
        async function syncFromDB() {
            if (!user?.fid || isFirstSyncDone.current) return;

            try {
                console.log(`🔄 [GameProvider] Fetching Supabase data for FID: ${user.fid}`);
                const { data: dbUser, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('fid', user.fid)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error('[GameProvider] Supabase Get Error:', error);
                    return;
                }

                if (dbUser) {
                    console.log('[GameProvider] ✅ DB State loaded:', dbUser);
                    setTokens(dbUser.tokens);
                    setUnlockedSkins(dbUser.unlocked_skins || DEFAULT_SKINS);
                    setSelectedSkin(dbUser.selected_skin || DEFAULT_SKIN);
                    setUnlockedThemes(dbUser.unlocked_themes || DEFAULT_THEMES);
                    setSelectedTheme(dbUser.selected_theme || DEFAULT_THEME);
                } else {
                    console.log('[GameProvider] 🆕 New user detected in Supabase, creating record...');
                    // Optional: Initial token reward for new users
                    const initialTokens = 500;
                    setTokens(initialTokens);

                    await supabase.from('users').upsert({
                        fid: user.fid,
                        username: user.username,
                        display_name: user.display_name,
                        pfp_url: user.pfp_url,
                        tokens: initialTokens,
                        unlocked_skins: DEFAULT_SKINS,
                        unlocked_themes: DEFAULT_THEMES,
                        selected_skin: DEFAULT_SKIN,
                        selected_theme: DEFAULT_THEME,
                    });
                }
                isFirstSyncDone.current = true;
            } catch (err) {
                console.error('[GameProvider] Sync process failed:', err);
            }
        }

        if (user?.fid) syncFromDB();
    }, [user?.fid]);

    // 3. Keep LocalStorage in sync (Secondary storage)
    useEffect(() => {
        if (!isLocalStorageLoaded.current) return;
        localStorage.setItem('gameTokens', tokens.toString());
        localStorage.setItem('unlockedSkins', JSON.stringify(unlockedSkins));
        localStorage.setItem('selectedSkin', selectedSkin);
        localStorage.setItem('unlockedThemes', JSON.stringify(unlockedThemes));
        localStorage.setItem('selectedTheme', selectedTheme);
    }, [tokens, unlockedSkins, selectedSkin, unlockedThemes, selectedTheme]);

    // --- Actions ---

    const setTokensWithSync = useCallback((val: number | ((prev: number) => number)) => {
        setTokens(prev => {
            const nextVal = typeof val === 'function' ? val(prev) : val;
            if (nextVal !== prev) {
                if (user?.fid) {
                    console.log(`🌐 [GameProvider] Syncing: ${prev} -> ${nextVal}`);
                    // We fire and forget the server update to keep UI snappy
                    updateUserTokensAction(user.fid, nextVal, nextVal > prev ? 'Earning' : 'Spending')
                        .catch(err => console.error('❌ Failed to update server tokens:', err));
                }
            }
            return nextVal;
        });
    }, [user?.fid]);

    const setSelectedSkinWithSync = useCallback((skinId: string) => {
        setSelectedSkin(skinId);
        if (user?.fid) {
            updatePreferencesAction(user.fid, { selected_skin: skinId }).catch(console.error);
        }
    }, [user?.fid]);

    const unlockSkinWithSync = useCallback((skinId: string) => {
        setUnlockedSkins(prev => {
            if (prev.includes(skinId)) return prev;
            const next = [...prev, skinId];
            if (user?.fid) {
                addUnlockedSkinAction(user.fid, skinId).catch(console.error);
            }
            return next;
        });
    }, [user?.fid]);

    const setSelectedThemeWithSync = useCallback((themeId: string) => {
        setSelectedTheme(themeId);
        if (user?.fid) {
            updatePreferencesAction(user.fid, { selected_theme: themeId }).catch(console.error);
        }
    }, [user?.fid]);

    const unlockThemeWithSync = useCallback((themeId: string) => {
        setUnlockedThemes(prev => {
            if (prev.includes(themeId)) return prev;
            const next = [...prev, themeId];
            if (user?.fid) {
                addUnlockedThemeAction(user.fid, themeId).catch(console.error);
            }
            return next;
        });
    }, [user?.fid]);

    const value = {
        tokens,
        setTokens: setTokensWithSync,
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
