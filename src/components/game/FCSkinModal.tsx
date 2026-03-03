'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Sparkles, ChevronRight } from 'lucide-react';
import PinkPantherPlayer from '../PinkPantherPlayer';
import { useUserGameData } from '~/hooks/useUserGameData';
import { PurchaseModal } from './PurchaseModal';
import { soundManager } from '~/lib/SoundManager';

interface FCSkinModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FCSkinModal({ isOpen, onClose }: FCSkinModalProps) {
    const { unlockedSkins, usdcBalance, fid, selectSkin, selectedSkin, refetchUSDC, buySkin } = useUserGameData();
    const [purchaseOpen, setPurchaseOpen] = useState(false);
    const [purchased, setPurchased] = useState(false);

    const alreadyOwned = unlockedSkins?.includes('farcaster') || purchased;

    const handleSelect = async () => {
        await selectSkin('farcaster');
        soundManager.play('coin');
        onClose();
    };

    const handlePurchaseSuccess = async (txHash?: string) => {
        soundManager.play('coin');
        await buySkin('farcaster', 0.23, txHash);
        setPurchased(true);
        refetchUSDC?.();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-end justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Backdrop */}
                <motion.div
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Sheet */}
                <motion.div
                    className="relative w-full max-w-md rounded-t-[32px] overflow-hidden shadow-2xl"
                    style={{ background: 'linear-gradient(160deg, #1a0540 0%, #2d0e6e 40%, #0d001a 100%)' }}
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                >
                    {/* Top glow border */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400 to-transparent" />

                    {/* Close */}
                    <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 z-10">
                        <X className="w-4 h-4 text-white" />
                    </button>
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/20" />

                    {/* Hero section */}
                    <div className="relative px-5 pt-10 pb-6 flex flex-col items-center text-center">
                        {/* Bg glow */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-56 h-56 rounded-full bg-violet-600/15 blur-3xl" />
                        </div>

                        {/* Farcaster logo icon */}
                        <div className="relative z-10 w-16 h-16 rounded-2xl overflow-hidden shadow-xl shadow-violet-900/50 border-2 border-violet-400/40 mb-4">
                            <img src="/logo farcaster.jpeg" alt="Farcaster" className="w-full h-full object-cover" />
                        </div>

                        {/* NEW badge */}
                        <span className="relative z-10 bg-violet-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 flex items-center gap-1.5 shadow-lg shadow-violet-500/30">
                            <Sparkles className="w-3 h-3" />
                            NEW · Special Edition
                        </span>

                        {/* Character preview — properly centered and enlarged */}
                        <div className="relative z-10 w-full flex justify-center items-center mb-4" style={{ height: '160px' }}>
                            {/* Glow */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-28 h-28 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
                            </div>
                            {/* Wrapper scaled up 2.5x — character is 40x50 natively, this makes it ~100x125 */}
                            <div className="relative" style={{ width: '40px', height: '50px', transform: 'scale(2.5)', transformOrigin: 'center center' }}>
                                <PinkPantherPlayer
                                    x={20} y={0}
                                    isSlowed={false} isMoving={false}
                                    isFalling={false} direction="right"
                                    skin="farcaster"
                                />
                            </div>
                        </div>


                        {/* Title */}
                        <h2 className="relative z-10 text-2xl font-black text-white leading-none">FC Pink</h2>
                        <p className="relative z-10 text-sm text-violet-300 mt-1.5 font-medium">Web3 Social Legend</p>

                        {/* Traits */}
                        <div className="relative z-10 flex gap-2 mt-4 flex-wrap justify-center">
                            {['Farcaster Edition', 'Purple Hood', 'Arch Symbol', 'Pulsing Aura'].map(trait => (
                                <span key={trait} className="text-[10px] text-violet-200 bg-violet-900/60 border border-violet-500/30 px-2.5 py-1 rounded-full font-semibold">
                                    {trait}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Action section */}
                    <div className="px-5 pb-8 space-y-3">
                        {alreadyOwned ? (
                            <>
                                {/* Already owned */}
                                <div className="bg-violet-900/40 border border-violet-500/30 rounded-2xl p-4 flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-violet-400 shrink-0" />
                                    <div>
                                        <p className="text-white font-black text-sm">You own FC Pink!</p>
                                        <p className="text-violet-300 text-xs mt-0.5">Exclusive Farcaster skin unlocked ✦</p>
                                    </div>
                                </div>
                                {selectedSkin !== 'farcaster' ? (
                                    <button
                                        onClick={handleSelect}
                                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 text-white font-black text-base flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-violet-500/30"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        Equip FC Pink
                                    </button>
                                ) : (
                                    <div className="w-full py-4 rounded-2xl bg-violet-900/30 border border-violet-500/30 text-violet-400 font-black text-sm text-center">
                                        Currently Equipped ✓
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {/* Price breakdown */}
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-purple-400 font-semibold uppercase tracking-wide">Price</p>
                                        <p className="text-2xl font-black text-white mt-0.5">$0.23 <span className="text-sm text-purple-300">USDC</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-purple-400 font-semibold uppercase tracking-wide">Edition</p>
                                        <p className="text-sm font-black text-violet-300 mt-0.5">Permanent</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => { soundManager.play('bubble'); setPurchaseOpen(true); }}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white font-black text-base flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-violet-500/40 border border-violet-400/30"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    Get FC Pink · $0.23 USDC
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <p className="text-center text-[10px] text-purple-600">One-time payment · Skin yours forever · On Base</p>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>

            {/* PurchaseModal */}
            {purchaseOpen && (
                <PurchaseModal
                    isOpen={purchaseOpen}
                    onClose={() => setPurchaseOpen(false)}
                    onConfirm={() => { }}
                    onSuccess={handlePurchaseSuccess}
                    type="confirmation"
                    item={{ id: 'farcaster', name: 'FC Pink', cost: 0.23, currency: 'USDC' }}
                    currentBalance={usdcBalance ?? 0}
                />
            )}
        </AnimatePresence>
    );
}
