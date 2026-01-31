import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { publicClient } from '~/lib/viem-client';
import USDCABI from '~/abi/USDC.json';
import { USDC_ADDRESS } from '~/lib/constants';

/**
 * Hook to fetch the real USDC balance from the Base blockchain
 * @returns {object} balance, loading, error, and refetch function
 */
export function useUSDCBalance() {
    const { address: userAddress, isConnected } = useAccount();
    const [balance, setBalance] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBalance = useCallback(async () => {
        if (!userAddress || !isConnected) {
            console.log('[useUSDCBalance] No user address or not connected');
            setBalance(0);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('[useUSDCBalance] Fetching USDC balance for:', userAddress);

            // Get balance from blockchain
            const rawBalance = await publicClient.readContract({
                address: USDC_ADDRESS,
                abi: USDCABI,
                functionName: 'balanceOf',
                args: [userAddress],
            });

            // USDC has 6 decimals (not 18 like most tokens!)
            const formattedBalance = Number.parseFloat(
                formatUnits(rawBalance as bigint, 6)
            );

            console.log('[useUSDCBalance] ✅ Balance fetched:', formattedBalance, 'USDC');
            setBalance(formattedBalance);
        } catch (err) {
            console.error('[useUSDCBalance] ❌ Error fetching balance:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch balance');
            setBalance(0);
        } finally {
            setLoading(false);
        }
    }, [userAddress, isConnected]);

    // Fetch balance when user address changes or connects
    useEffect(() => {
        if (userAddress && isConnected) {
            fetchBalance();
        } else {
            setBalance(0);
        }
    }, [userAddress, isConnected, fetchBalance]);

    return {
        balance,
        loading,
        error,
        refetch: fetchBalance,
    };
}
