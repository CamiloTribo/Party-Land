'use client';

import { X, Share2, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PinkPantherPlayer from '../PinkPantherPlayer';
import { Button } from '~/components/ui/Button';
import { shareToFarcaster } from '~/lib/utils';
import { useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { parseUnits } from 'viem';
import { PAYMENT_WALLET_ADDRESS, USDC_ADDRESS, PAYMENT_CHAIN_ID } from '~/lib/constants';
import USDCABI from '~/abi/USDC.json';

interface PurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    type: 'confirmation' | 'success';
    item: {
        id: string;
        name: string;
        cost: number;
        currency: 'tokens' | 'USDC';
    };
    currentBalance?: number;
    bgColor?: string; // For themes: gradient class
    onSuccess?: () => void; // Callback después de compra exitosa
}

export const PurchaseModal = ({
    isOpen,
    onClose,
    onConfirm,
    type,
    item,
    currentBalance = 0,
    bgColor,
    onSuccess,
}: PurchaseModalProps) => {
    const [purchaseState, setPurchaseState] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
    const [txHash, setTxHash] = useState<string | null>(null);

    const { address, isConnected, chainId } = useAccount();
    const { switchChain } = useSwitchChain();
    const { sendTransaction, isPending: isSendingTx } = useSendTransaction();

    // Monitor transaction confirmation
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: txHash as `0x${string}` | undefined,
    });

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setPurchaseState('idle');
            setTxHash(null);
        }
    }, [isOpen]);

    // Auto-close on success
    useEffect(() => {
        if (isConfirmed && txHash) {
            setPurchaseState('success');
            onSuccess?.(); // Trigger callback (unlock skin/theme, refresh balance)
            setTimeout(() => {
                onClose();
            }, 2500);
        }
    }, [isConfirmed, txHash, onSuccess, onClose]);

    if (!isOpen) return null;

    const isUSDC = item.currency === 'USDC';
    const remainingBalance = currentBalance - item.cost;
    const canAfford = remainingBalance >= 0;

    const handleConfirm = async () => {
        setPurchaseState('pending');

        try {
            if (isUSDC) {
                // USDC Payment on Base
                console.log('💰 Starting USDC payment...');

                if (!isConnected || !address) {
                    alert('Please connect your wallet first!');
                    setPurchaseState('failed');
                    return;
                }

                // Check if we're on Base chain
                if (chainId !== PAYMENT_CHAIN_ID) {
                    console.log('⚠️ Wrong chain, switching to Base...');
                    try {
                        await switchChain?.({ chainId: PAYMENT_CHAIN_ID });
                    } catch (err) {
                        console.error('❌ Failed to switch chain:', err);
                        alert('Please switch to Base network manually!');
                        setPurchaseState('failed');
                        return;
                    }
                }

                // Prepare USDC transfer
                // USDC has 6 decimals
                const amount = parseUnits(item.cost.toString(), 6);

                console.log('[PurchaseModal] Sending USDC:', {
                    from: address,
                    to: PAYMENT_WALLET_ADDRESS,
                    amount: item.cost,
                    amountWei: amount.toString(),
                });

                // Send USDC transfer transaction
                sendTransaction({
                    to: USDC_ADDRESS,
                    data: encodeFunctionData({
                        abi: USDCABI,
                        functionName: 'transfer',
                        args: [PAYMENT_WALLET_ADDRESS, amount],
                    }) as `0x${string}`,
                }, {
                    onSuccess: (hash) => {
                        console.log('✅ Transaction sent:', hash);
                        setTxHash(hash);
                        setPurchaseState('pending'); // Wait for confirmation
                    },
                    onError: (error) => {
                        console.error('❌ Transaction failed:', error);
                        setPurchaseState('failed');
                        setTimeout(() => setPurchaseState('idle'), 2000);
                    },
                });

            } else {
                // Token payment (original flow)
                await onConfirm();
                setPurchaseState('success');
                setTimeout(() => {
                    setPurchaseState('idle');
                    onClose();
                }, 2000);
            }
        } catch (error: unknown) {
            console.error('❌ Purchase error:', error);
            setPurchaseState('failed');
            setTimeout(() => setPurchaseState('idle'), 2000);
        }
    };

    // Import encodeFunctionData helper
    function encodeFunctionData({ abi, functionName, args }: { abi: unknown; functionName: string; args: unknown[] }): string {
        // Simple function signature encoding for ERC20 transfer
        // transfer(address,uint256) = 0xa9059cbb
        const functionSignature = '0xa9059cbb';
        const addressParam = (args[0] as string).slice(2).padStart(64, '0');
        const amountParam = (args[1] as bigint).toString(16).padStart(64, '0');
        return `${functionSignature}${addressParam}${amountParam}`;
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className={`relative w-full max-w-sm bg-[#1a0b2e] border-2 ${isUSDC ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'border-[#ff69b4] shadow-[0_0_30px_rgba(255,105,180,0.3)]'
                            } rounded-3xl p-6 overflow-hidden`}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            {/* Character or Theme Color */}
                            <div className="mb-6 relative">
                                {type === 'success' ? (
                                    <div className="flex flex-col items-center gap-4">
                                        {bgColor ? (
                                            <div className={`w-28 h-28 rounded-2xl border-2 ${isUSDC ? 'border-blue-500/50' : 'border-[#ff69b4]/50'} shadow-lg ${bgColor}`}></div>
                                        ) : (
                                            <div className="w-28 h-28 flex items-center justify-center relative">
                                                <div className="transform scale-[2]">
                                                    <PinkPantherPlayer x={0} y={0} skin={item.id} isMoving={true} isSlowed={false} isFalling={false} direction="right" />
                                                </div>
                                            </div>
                                        )}
                                        <svg width="72" height="72" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={isUSDC ? 'text-blue-500' : 'text-[#ff69b4]'}>
                                            <rect x="0.5" width="24" height="24" rx="12" fill="currentColor" />
                                            <path d="M8.54541 12.4091L10.7272 14.5909L16.1818 9.13633" stroke="white" strokeWidth="1.5" />
                                        </svg>
                                    </div>
                                ) : (
                                    bgColor ? (
                                        <div className={`w-28 h-28 rounded-2xl border-2 ${isUSDC ? 'border-blue-500/50' : 'border-[#ff69b4]/50'} shadow-lg ${bgColor}`}></div>
                                    ) : (
                                        <div className="w-28 h-28 flex items-center justify-center relative">
                                            <div className="transform scale-[2]">
                                                <PinkPantherPlayer x={0} y={0} skin={item.id} isMoving={true} isSlowed={false} isFalling={false} direction="right" />
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Title */}
                            <h3 className={`text-3xl font-black uppercase mb-3 ${isUSDC ? 'text-blue-400' : 'text-[#ff69b4]'}`}>
                                {purchaseState === 'success' || isConfirmed ? 'Acquired!' : purchaseState === 'pending' || isSendingTx || isConfirming ? 'Processing...' : 'Confirm Purchase'}
                            </h3>

                            {/* Item name */}
                            <p className="text-white text-xl font-bold mb-8">
                                {item.name}
                            </p>

                            {/* Transaction Status for USDC */}
                            {isUSDC && (isSendingTx || isConfirming || txHash) && (
                                <div className="w-full mb-4 p-3 bg-blue-900/30 rounded-xl border border-blue-500/30">
                                    <div className="flex items-center gap-2 text-sm text-white">
                                        {isSendingTx && (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Awaiting wallet approval...</span>
                                            </>
                                        )}
                                        {isConfirming && !isConfirmed && (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Confirming on blockchain...</span>
                                            </>
                                        )}
                                        {isConfirmed && (
                                            <>
                                                <span className="text-green-400">✓</span>
                                                <span className="text-green-400">Transaction confirmed!</span>
                                            </>
                                        )}
                                    </div>
                                    {txHash && (
                                        <div className="mt-2 text-xs text-white/60 truncate">
                                            TX: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Content section */}
                            {purchaseState !== 'success' && !isConfirmed ? (
                                <div className="w-full mb-8">
                                    <div className="bg-white/5 rounded-xl px-5 py-4 border border-white/10">
                                        {/* Cost row */}
                                        <div className="flex justify-between items-center text-sm text-white/70 py-2">
                                            <span>Cost</span>
                                            <div className="flex items-center gap-2 font-bold text-white">
                                                {isUSDC ? (
                                                    <><div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-[10px] border border-blue-500/40">U</div> <span>{item.cost} USDC</span></>
                                                ) : (
                                                    <><div className="w-6 h-6 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-300 font-bold border border-yellow-500/40"><Coins className="w-3 h-3" /></div> <span>{item.cost}</span></>
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t border-white/10 my-2" />

                                        {/* Balance row */}
                                        <div className="flex justify-between items-center text-sm text-white/70 py-2">
                                            <span>Your Balance</span>
                                            <div className="flex items-center gap-2 font-bold text-white">
                                                {isUSDC ? (
                                                    <><div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-[10px] border border-blue-500/40">U</div> <span>{currentBalance} USDC</span></>
                                                ) : (
                                                    <><div className="w-6 h-6 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-300 font-bold border border-yellow-500/40"><Coins className="w-3 h-3" /></div> <span>{currentBalance}</span></>
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t border-white/10 my-2" />

                                        {/* New Balance row */}
                                        <div className="flex justify-between items-center text-sm text-white/70 py-2">
                                            <span>After Purchase</span>
                                            <div className={`flex items-center gap-2 font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                                                {isUSDC ? (
                                                    <><div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-[10px] border border-blue-500/40">U</div> <span>{Math.max(0, remainingBalance).toFixed(2)} USDC</span></>
                                                ) : (
                                                    <><div className="w-6 h-6 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-300 font-bold border border-yellow-500/40"><Coins className="w-3 h-3" /></div> <span>{Math.max(0, remainingBalance)}</span></>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {!canAfford && !isUSDC && (
                                        <p className="text-red-400 text-sm mt-4">Not enough tokens! Play more to earn.</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-green-400 text-lg font-bold mb-8">
                                    Successfully unlocked!
                                </p>
                            )}

                            {/* Action Buttons */}
                            {purchaseState !== 'success' && !isConfirmed ? (
                                <div className="flex gap-3 w-full">
                                    <Button
                                        onClick={onClose}
                                        variant="outline"
                                        disabled={isSendingTx || isConfirming}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-white border-white/20"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleConfirm}
                                        disabled={!canAfford || purchaseState === 'pending' || isSendingTx || isConfirming}
                                        className={`flex-1 ${isUSDC
                                            ? 'bg-blue-600 hover:bg-blue-500'
                                            : 'bg-pink-600 hover:bg-pink-500'
                                            } text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {isSendingTx ? 'Approving...' : isConfirming ? 'Confirming...' : 'Confirm'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3 w-full">
                                    <Button
                                        onClick={() => shareToFarcaster(`I just unlocked the ${item.name} skin in Party Land! Check out this amazing Farcaster game! #PartyLand #Farcaster`)}
                                        className={`w-full ${isUSDC ? 'bg-blue-600 hover:bg-blue-500' : 'bg-[#ff69b4] hover:bg-[#ff4da6]'} text-white font-bold flex items-center justify-center gap-2`}
                                    >
                                        <Share2 className="w-5 h-5" />
                                        SHARE SKIN
                                    </Button>
                                    <Button
                                        onClick={onClose}
                                        variant="outline"
                                        className="w-full bg-white/5 hover:bg-white/10 text-white border-white/20"
                                    >
                                        Awesome!
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div >
            )}
        </AnimatePresence >
    );
};
