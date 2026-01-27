import { useEffect, useState, useCallback, useRef } from 'react';
import { useNeynarUser } from './useNeynarUser';

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
  // Get Farcaster user data from existing Neynar hook
  const { user } = useNeynarUser(context);

  // Debug logging
  useEffect(() => {
    console.log('🔍 [useUserGameData] Context:', context);
    console.log('👤 [useUserGameData] User from Neynar:', user);
  }, [context, user]);

  // Flag to track if we've loaded from localStorage
  const isInitialized = useRef(false);

  // State - initialize from localStorage immediately to avoid flicker
  const [tokens, setTokens] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const saved = localStorage.getItem('gameTokens');
    return saved ? parseInt(saved) : 0;
  });

  const [usdcBalance, setUsdcBalance] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const saved = localStorage.getItem('usdcBalance');
    return saved ? parseFloat(saved) : 0;
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
    console.log('[useUserGameData] Initialized with data:', {
      tokens,
      selectedSkin,
      selectedTheme,
      farcasterFID: user?.fid,
    });
    isInitialized.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save tokens to localStorage whenever they change (but only after initialization)
  useEffect(() => {
    if (!isInitialized.current) return;
    console.log('[useUserGameData] Saving tokens:', tokens);
    localStorage.setItem('gameTokens', tokens.toString());
  }, [tokens]);

  // Save USDC balance to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized.current) return;
    console.log('[useUserGameData] Saving USDC balance:', usdcBalance);
    localStorage.setItem('usdcBalance', usdcBalance.toString());
  }, [usdcBalance]);

  // Save unlocked skins to localStorage whenever they change
  useEffect(() => {
    if (!isInitialized.current) return;
    console.log('[useUserGameData] Saving unlocked skins:', unlockedSkins);
    localStorage.setItem('unlockedSkins', JSON.stringify(unlockedSkins));
  }, [unlockedSkins]);

  // Save selected skin to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized.current) return;
    console.log('[useUserGameData] Saving selected skin:', selectedSkin);
    localStorage.setItem('selectedSkin', selectedSkin);
  }, [selectedSkin]);

  // Save unlocked themes to localStorage whenever they change
  useEffect(() => {
    if (!isInitialized.current) return;
    console.log('[useUserGameData] Saving unlocked themes:', unlockedThemes);
    localStorage.setItem('unlockedThemes', JSON.stringify(unlockedThemes));
  }, [unlockedThemes]);

  // Save selected theme to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized.current) return;
    console.log('[useUserGameData] Saving selected theme:', selectedTheme);
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
    usdcBalance,
    setUsdcBalance,
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
    // Farcaster session data
    fid: user?.fid,
    username: user?.username,
    displayName: user?.display_name,
    pfpUrl: user?.pfp_url,
  };
}
