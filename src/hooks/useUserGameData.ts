import { useEffect, useState, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useNeynarUser } from './useNeynarUser';
import { useUSDCBalance } from './useUSDCBalance';
import { supabase } from '~/lib/supabase';

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

  // Debug logging
  useEffect(() => {
    console.log('🔍 [useUserGameData] Context:', context);
    console.log('👤 [useUserGameData] User from Neynar:', user);
    console.log('💰 [useUserGameData] Wallet:', walletAddress);
    console.log('💵 [useUserGameData] USDC Balance:', usdcBalance);
  }, [context, user, walletAddress, usdcBalance]);

  // Flag to track if we've loaded from localStorage
  const isInitialized = useRef(false);

  // State - initialize from localStorage immediately to avoid flicker
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

  // --- Supabase Sync Logic ---
  useEffect(() => {
    async function syncData() {
      if (!user?.fid || !isInitialized.current) return;

      try {
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
          // USER EXISTS: DB is the source of truth, but we merge if local has MORE items
          console.log('[Supabase] Found existing user, syncing...', dbUser);

          // Tokens: Use higher value or DB value? Let's use DB as source of truth for security
          setTokens(dbUser.tokens);

          // Skins: Merge local and DB
          const dbSkins = dbUser.unlocked_skins || DEFAULT_SKINS;
          setUnlockedSkins((prev) => Array.from(new Set([...prev, ...dbSkins])));
          setSelectedSkin(dbUser.selected_skin || DEFAULT_SKIN);

          // Themes: Merge local and DB
          const dbThemes = dbUser.unlocked_themes || DEFAULT_THEMES;
          setUnlockedThemes((prev) => Array.from(new Set([...prev, ...dbThemes])));
          setSelectedTheme(dbUser.selected_theme || DEFAULT_THEME);

        } else {
          // NEW USER: Create in DB using current local state
          console.log('[Supabase] New user, creating record with local data...');
          const { error: insertError } = await supabase
            .from('users')
            .insert({
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

          if (insertError) console.error('[Supabase] Error creating user:', insertError);
        }
      } catch (err) {
        console.error('[Supabase] Sync failed:', err);
      }
    }

    syncData();
  }, [user?.fid]);

  // Sync state TO Supabase when it changes (Debounced potentially, but for now direct)
  useEffect(() => {
    async function updateDB() {
      if (!user?.fid || !isInitialized.current) return;

      console.log(`💾 [Supabase] Updating user data for FID: ${user.fid}...`, { tokens });
      const { error } = await supabase
        .from('users')
        .update({
          tokens,
          unlocked_skins: unlockedSkins,
          unlocked_themes: unlockedThemes,
          selected_skin: selectedSkin,
          selected_theme: selectedTheme,
          username: user.username,
          display_name: user.display_name,
          pfp_url: user.pfp_url,
          updated_at: new Date().toISOString()
        })
        .eq('fid', user.fid);

      if (error) {
        console.error('❌ [Supabase] Update failed:', error);
      } else {
        console.log('✅ [Supabase] Update successful!');
      }
    }

    // Only update if we are already initialized and have a user
    const timer = setTimeout(updateDB, 1000); // Simple debounce
    return () => clearTimeout(timer);
  }, [tokens, unlockedSkins, unlockedThemes, selectedSkin, selectedTheme, user?.fid]);

  // --- LocalStorage persistence (Keep as secondary for offline/fast load) ---
  useEffect(() => {
    if (!isInitialized.current) return;
    localStorage.setItem('gameTokens', tokens.toString());
  }, [tokens]);

  useEffect(() => {
    if (!isInitialized.current) return;
    localStorage.setItem('unlockedSkins', JSON.stringify(unlockedSkins));
  }, [unlockedSkins]);

  useEffect(() => {
    if (!isInitialized.current) return;
    localStorage.setItem('selectedSkin', selectedSkin);
  }, [selectedSkin]);

  useEffect(() => {
    if (!isInitialized.current) return;
    localStorage.setItem('unlockedThemes', JSON.stringify(unlockedThemes));
  }, [unlockedThemes]);

  useEffect(() => {
    if (!isInitialized.current) return;
    localStorage.setItem('selectedTheme', selectedTheme);
  }, [selectedTheme]);

  // Utility functions
  const unlockSkin = useCallback((skinId: string) => {
    setUnlockedSkins((prev) => prev.includes(skinId) ? prev : [...prev, skinId]);
  }, []);

  const unlockTheme = useCallback((themeId: string) => {
    setUnlockedThemes((prev) => prev.includes(themeId) ? prev : [...prev, themeId]);
  }, []);

  // Expose all state and setters
  return {
    tokens,
    setTokens,
    usdcBalance, // REAL balance from blockchain
    usdcLoading,
    refetchUSDC,
    unlockedSkins,
    setUnlockedSkins,
    selectedSkin,
    setSelectedSkin,
    unlockSkin,
    unlockedThemes,
    setUnlockedThemes,
    selectedTheme,
    setSelectedTheme,
    unlockTheme,
    // Wallet data from Wagmi
    walletAddress,
    isConnected,
    // Farcaster session data
    fid: user?.fid,
    username: user?.username,
    displayName: user?.display_name,
    pfpUrl: user?.pfp_url,
  };
}
