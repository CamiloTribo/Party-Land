'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useNeynarUser } from './useNeynarUser';
import { useUSDCBalance } from './useUSDCBalance';
import { supabase } from '~/lib/supabase';
import {
  updateUserTokensAction,
  addUnlockedSkinAction,
  addUnlockedThemeAction,
  updatePreferencesAction
} from '~/app/actions/userActions';

// Default values for a new user
const DEFAULT_SKINS = ['classic'];
const DEFAULT_THEMES = [
  'classic-pink',
  'ocean-blue',
  'forest-green',
  'sunset-orange',
];
const DEFAULT_SKIN = 'classic';
const DEFAULT_THEME = 'classic-pink';

export function useUserGameData(context?: { user?: { fid?: number } }) {
  // Get wallet from Farcaster/Wagmi
  const { address: walletAddress, isConnected } = useAccount();

  // Get Farcaster user data from existing Neynar hook
  const { user } = useNeynarUser(context);

  // Get REAL USDC balance from blockchain
  const { balance: usdcBalance, loading: usdcLoading, refetch: refetchUSDC } = useUSDCBalance();

  // Flag to track if we've loaded from localStorage
  const isInitialized = useRef(false);

  // State
  const [tokens, setTokens] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const saved = localStorage.getItem('gameTokens');
    return saved ? parseInt(saved) : 0;
  });

  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_SKINS;
    const saved = localStorage.getItem('unlockedSkins');
    return saved ? JSON.parse(saved) : DEFAULT_SKINS;
  });

  const [selectedSkin, setSelectedSkin] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_SKIN;
    const saved = localStorage.getItem('selectedSkin');
    return saved || DEFAULT_SKIN;
  });

  const [unlockedThemes, setUnlockedThemes] = useState<string[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_THEMES;
    const saved = localStorage.getItem('unlockedThemes');
    return saved ? JSON.parse(saved) : DEFAULT_THEMES;
  });

  const [selectedTheme, setSelectedTheme] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_THEME;
    const saved = localStorage.getItem('selectedTheme');
    return saved || DEFAULT_THEME;
  });

  // Mark as initialized after first render
  useEffect(() => {
    isInitialized.current = true;
  }, []);

  // --- Initial Sync FROM Supabase ---
  useEffect(() => {
    async function syncData() {
      if (!user?.fid || !isInitialized.current) return;

      try {
        console.log(`🔄 [useUserGameData] Syncing data from Supabase for FID: ${user.fid}...`);
        const { data: dbUser, error } = await supabase
          .from('users')
          .select('*')
          .eq('fid', user.fid)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('[Supabase] Error fetching user:', error);
          return;
        }

        if (dbUser) {
          // USER EXISTS: DB is the source of truth for synced sessions
          console.log('[Supabase] Found user in DB, applying server state:', dbUser);

          setTokens(dbUser.tokens);
          setUnlockedSkins(dbUser.unlocked_skins || DEFAULT_SKINS);
          setSelectedSkin(dbUser.selected_skin || DEFAULT_SKIN);
          setUnlockedThemes(dbUser.unlocked_themes || DEFAULT_THEMES);
          setSelectedTheme(dbUser.selected_theme || DEFAULT_THEME);

        } else {
          // NEW USER: Create in DB using current local state
          console.log('[Supabase] New user, initializing DB with local data...');
          const { error: insertError } = await supabase
            .from('users')
            .upsert({
              fid: user.fid,
              username: user.username,
              display_name: user.display_name,
              pfp_url: user.pfp_url,
              tokens: tokens,
              unlocked_skins: unlockedSkins,
              unlocked_themes: unlockedThemes,
              selected_skin: selectedSkin,
              selected_theme: selectedTheme,
            }, { onConflict: 'fid' });

          if (insertError) console.error('[Supabase] Error creating user:', insertError);
        }
      } catch (err) {
        console.error('[Supabase] Sync failed:', err);
      }
    }

    syncData();
  }, [user?.fid]);

  // --- Persistence Sync TO Supabase via Server Actions ---

  const handleTokenChange = async (newTokens: number, reason: string) => {
    if (!user?.fid) return;
    try {
      console.log(`💾 [useUserGameData] Syncing tokens (${newTokens}) via Server Action... Reason: ${reason}`);
      await updateUserTokensAction(user.fid, newTokens, reason);
    } catch (err) {
      console.error('Failed to sync tokens to server:', err);
    }
  };

  const handleSkinUnlock = async (skinId: string) => {
    if (!user?.fid) return;
    try {
      await addUnlockedSkinAction(user.fid, skinId);
    } catch (err) {
      console.error('Failed to sync skin unlock to server:', err);
    }
  };

  const handleThemeUnlock = async (themeId: string) => {
    if (!user?.fid) return;
    try {
      await addUnlockedThemeAction(user.fid, themeId);
    } catch (err) {
      console.error('Failed to sync theme unlock to server:', err);
    }
  };

  const handlePreferenceUpdate = async (prefs: { selected_skin?: string, selected_theme?: string }) => {
    if (!user?.fid) return;
    try {
      await updatePreferencesAction(user.fid, prefs);
    } catch (err) {
      console.error('Failed to sync preferences to server:', err);
    }
  };

  // Wrapped token setter
  const setTokensWithSync = useCallback((val: number | ((prev: number) => number)) => {
    setTokens(prev => {
      const nextVal = typeof val === 'function' ? val(prev) : val;
      if (nextVal !== prev) {
        handleTokenChange(nextVal, nextVal > prev ? 'Earnings/Reward' : 'Spending');
      }
      return nextVal;
    });
  }, [user?.fid]);

  const setSelectedSkinWithSync = useCallback((skinId: string) => {
    setSelectedSkin(skinId);
    handlePreferenceUpdate({ selected_skin: skinId });
  }, [user?.fid]);

  const setSelectedThemeWithSync = useCallback((themeId: string) => {
    setSelectedTheme(themeId);
    handlePreferenceUpdate({ selected_theme: themeId });
  }, [user?.fid]);

  const unlockSkin = useCallback((skinId: string) => {
    setUnlockedSkins((prev) => {
      if (prev.includes(skinId)) return prev;
      handleSkinUnlock(skinId);
      return [...prev, skinId];
    });
  }, [user?.fid]);

  const unlockTheme = useCallback((themeId: string) => {
    setUnlockedThemes((prev) => {
      if (prev.includes(themeId)) return prev;
      handleThemeUnlock(themeId);
      return [...prev, themeId];
    });
  }, [user?.fid]);

  // --- LocalStorage persistence ---
  useEffect(() => {
    if (!isInitialized.current) return;
    localStorage.setItem('gameTokens', tokens.toString());
    localStorage.setItem('unlockedSkins', JSON.stringify(unlockedSkins));
    localStorage.setItem('selectedSkin', selectedSkin);
    localStorage.setItem('unlockedThemes', JSON.stringify(unlockedThemes));
    localStorage.setItem('selectedTheme', selectedTheme);
  }, [tokens, unlockedSkins, selectedSkin, unlockedThemes, selectedTheme]);

  return {
    tokens,
    setTokens: setTokensWithSync,
    usdcBalance,
    usdcLoading,
    refetchUSDC,
    unlockedSkins,
    setUnlockedSkins,
    selectedSkin,
    setSelectedSkin: setSelectedSkinWithSync,
    unlockSkin,
    unlockedThemes,
    setUnlockedThemes,
    selectedTheme,
    setSelectedTheme: setSelectedThemeWithSync,
    unlockTheme,
    walletAddress,
    isConnected,
    fid: user?.fid,
    username: user?.username,
    displayName: user?.display_name,
    pfpUrl: user?.pfp_url,
  };
}
