'use client';

import { useGameData } from '~/components/providers/GameDataProvider';

/**
 * Clean bridge to the GameDataProvider.
 */
export function useUserGameData(context?: any) {
  return useGameData();
}
