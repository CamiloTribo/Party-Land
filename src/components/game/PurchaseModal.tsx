'use client';

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PinkPantherPlayer from '../PinkPantherPlayer';
import { Button } from '~/components/ui/Button';
import { useState } from 'react';

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
}

export const PurchaseModal = ({
    isOpen,
    onClose,
    onConfirm,
    type,
    item,
    currentBalance = 0,
    bgColor,
}: PurchaseModalProps) => {
    const [purchaseState, setPurchaseState] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');

    if (!isOpen) return null;

    const isUSDC = item.currency === 'USDC';
    const remainingBalance = currentBalance - item.cost;
    const canAfford = remainingBalance >= 0;

    const handleConfirm = async () => {
        setPurchaseState('pending');
        try {
            if (isUSDC) {
                // TODO: Implement USDC payment on Base when ready
                console.log('💰 USDC Payment flow - Coming soon!');
                alert('USDC payments coming soon! For now, use tokens.');
                setPurchaseState('failed');
                return;
            }

            // Pago con tokens (flujo normal)
            await onConfirm();
            setPurchaseState('success');

            setTimeout(() => {
                setPurchaseState('idle');
                onClose();
            }, 2000);
        } catch (error: unknown) {
            console.error('❌ Purchase error:', error);
            setPurchaseState('failed');
            setTimeout(() => setPurchaseState('idle'), 2000);
        }
    };

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
                                {type === 'success' ? 'Acquired!' : 'Confirm Purchase'}
                            </h3>

                            {/* Item name */}
                            <p className="text-white text-xl font-bold mb-8">
                                {item.name}
                            </p>

                            {/* Content section */}
                            {type === 'confirmation' ? (
                                <div className="w-full mb-8">
                                    <div className="bg-white/5 rounded-xl px-5 py-4 border border-white/10">
                                        {/* Cost row */}
                                        <div className="flex justify-between items-center text-sm text-white/70 py-2">
                                            <span>Cost</span>
                                            <div className="flex items-center gap-2 font-bold text-white">
                                                {isUSDC ? (
                                                    <><span className="text-2xl">💵</span> <span>{item.cost} USDC</span></>
                                                ) : (
                                                    <><span className="text-2xl">🪙</span> <span>{item.cost}</span></>
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t border-white/10 my-2" />

                                        {/* Balance row */}
                                        <div className="flex justify-between items-center text-sm text-white/70 py-2">
                                            <span>Your Balance</span>
                                            <div className="flex items-center gap-2 font-bold text-white">
                                                {isUSDC ? (
                                                    <><span className="text-2xl">💵</span> <span>{currentBalance} USDC</span></>
                                                ) : (
                                                    <><span className="text-2xl">🪙</span> <span>{currentBalance}</span></>
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t border-white/10 my-2" />

                                        {/* New Balance row */}
                                        <div className="flex justify-between items-center text-sm text-white/70 py-2">
                                            <span>After Purchase</span>
                                            <div className={`flex items-center gap-2 font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                                                {isUSDC ? (
                                                    <><span className="text-2xl">💵</span> <span>{Math.max(0, remainingBalance).toFixed(2)} USDC</span></>
                                                ) : (
                                                    <><span className="text-2xl">🪙</span> <span>{Math.max(0, remainingBalance)}</span></>
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
                            {type === 'confirmation' ? (
                                <div className="flex gap-3 w-full">
                                    <Button
                                        onClick={onClose}
                                        variant="outline"
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-white border-white/20"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleConfirm}
                                        disabled={!canAfford || purchaseState === 'pending'}
                                        className={`flex-1 ${isUSDC
                                            ? 'bg-blue-600 hover:bg-blue-500'
                                            : 'bg-pink-600 hover:bg-pink-500'
                                            } text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {purchaseState === 'pending' ? 'Processing...' : 'Confirm'}
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    onClick={onClose}
                                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold"
                                >
                                    Awesome!
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
