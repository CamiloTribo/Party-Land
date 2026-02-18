'use client';

import { useGameData } from '~/components/providers/GameDataProvider';

/**
 * Hook to access user game data (tokens, skins, themes).
 * Now completely powered by GameDataProvider context to ensure global consistency.
 */
export function useUserGameData(context?: any) {
  // We ignore the context parameter now as the provider handles it via useNeynarUser internally.
  const data = useGameData();

  return data;
}
