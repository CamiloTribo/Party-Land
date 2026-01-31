import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

/**
 * Public client for Base chain
 * Used to read contract data (balances, etc.)
 */
export const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});
