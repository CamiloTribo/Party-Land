'use client';

import { useState, useEffect } from 'react';
import { X, Percent, Clock, Star, DollarSign, CheckCircle2, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PinkPantherPlayer from '../PinkPantherPlayer';
import { PurchaseModal } from './PurchaseModal';
import { Button } from '../ui/Button';
import { soundManager } from '~/lib/SoundManager';
import { useUserGameData } from '~/hooks/useUserGameData';

// Offer end is stored once in localStorage — persists across sessions
const OFFER_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const OFFER_KEY = 'party_land_offer_end_v1';

function getOrCreateOfferEnd(): number {
    try {
        const stored = localStorage.getItem(OFFER_KEY);
        if (stored) {
            const parsed = parseInt(stored, 10);
            if (!isNaN(parsed) && parsed > Date.now()) return parsed;
        }
        // First time — set the 7-day end date
        const end = Date.now() + OFFER_DURATION_MS;
        localStorage.setItem(OFFER_KEY, end.toString());
        return end;
    } catch {
        return Date.now() + OFFER_DURATION_MS;
    }
}

function useCountdown() {
    const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0, expired: false });

    useEffect(() => {
        // Get (or create) the persistent end timestamp
        const end = getOrCreateOfferEnd();

        const tick = () => {
            const diff = end - Date.now();
            if (diff <= 0) {
                setTimeLeft({ d: 0, h: 0, m: 0, s: 0, expired: true });
                return;
            }
            setTimeLeft({
                d: Math.floor(diff / 86400000),
                h: Math.floor((diff % 86400000) / 3600000),
                m: Math.floor((diff % 3600000) / 60000),
                s: Math.floor((diff % 60000) / 1000),
                expired: false,
            });
        };

        tick(); // Run immediately
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    return timeLeft;
}

interface OfferModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const OFFER_SKIN = {
    id: 'joker',
    name: 'Pink Joker',
    offerCost: 0.023,
    originalCost: 2.3,
    currency: 'USDC' as const,
    description: 'Why so pink?',
};

export function OfferModal({ isOpen, onClose }: OfferModalProps) {
    const { usdcBalance, buySkin, selectSkin, refetchUSDC, unlockedSkins } = useUserGameData();
    const [purchaseOpen, setPurchaseOpen] = useState(false);
    const countdown = useCountdown();
    const alreadyOwned = unlockedSkins.includes(OFFER_SKIN.id);
    const pad = (n: number) => String(n).padStart(2, '0');

    if (!isOpen) return null;

    const handleBuyNow = () => {
        soundManager.play('click');
        setPurchaseOpen(true);
    };

    const handlePurchaseSuccess = (txHash?: string) => {
        buySkin(OFFER_SKIN.id, OFFER_SKIN.offerCost, txHash).then(() => {
            selectSkin(OFFER_SKIN.id);
            refetchUSDC();
        });
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && !purchaseOpen && (
                    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        {/* Modal — scrollable, max height */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            className="relative w-full max-w-sm bg-gradient-to-b from-[#1a0035] via-[#2d0060] to-[#1a0035] rounded-t-[32px] sm:rounded-[32px] border-2 border-yellow-400/60 shadow-[0_0_60px_rgba(250,204,21,0.25)] overflow-hidden max-h-[92vh] flex flex-col"
                        >
                            {/* Top accent bar */}
                            <div className="h-1 w-full flex-shrink-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400" />

                            {/* Close button */}
                            <button
                                onClick={() => { soundManager.play('bubble'); onClose(); }}
                                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors z-10"
                            >
                                <X size={22} />
                            </button>

                            {/* Scrollable content */}
                            <div className="overflow-y-auto flex-1 p-6 flex flex-col items-center gap-5">

                                {/* Header badge */}
                                <div className="flex items-center gap-2 bg-yellow-400/15 border border-yellow-400/40 rounded-full px-4 py-1.5">
                                    <Percent className="w-3.5 h-3.5 text-yellow-400" />
                                    <span className="text-yellow-300 text-xs font-black uppercase tracking-widest">Launch Offer · Limited Time</span>
                                    <Percent className="w-3.5 h-3.5 text-yellow-400" />
                                </div>

                                {/* Skin Preview */}
                                <div className="relative">
                                    <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full scale-150" />
                                    <div className="relative w-36 h-36 flex items-center justify-center">
                                        <div className="transform scale-[3]">
                                            <PinkPantherPlayer
                                                x={0} y={0}
                                                skin="joker"
                                                isMoving={true}
                                                isSlowed={false}
                                                isFalling={false}
                                                direction="right"
                                            />
                                        </div>
                                    </div>
                                    <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                                        <Star className="w-4 h-4 text-purple-900 fill-purple-900" />
                                    </div>
                                </div>

                                {/* Name & description */}
                                <div className="text-center">
                                    <h2 className="text-2xl font-black text-white">{OFFER_SKIN.name}</h2>
                                    <p className="text-purple-300 text-sm mt-1">{OFFER_SKIN.description}</p>
                                    <p className="text-white/40 text-xs mt-1">Exclusive USDC skin · Normally ${OFFER_SKIN.originalCost}</p>
                                </div>

                                {/* Price row */}
                                <div className="flex items-center gap-3">
                                    <span className="text-white/30 text-xl font-black line-through">${OFFER_SKIN.originalCost}</span>
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-green-400/20 blur-xl rounded-full" />
                                        <div className="relative flex items-center gap-1.5 bg-green-900/50 border-2 border-green-400/50 rounded-2xl px-5 py-2.5">
                                            <DollarSign className="w-5 h-5 text-green-400" />
                                            <span className="text-3xl font-black text-green-400">{OFFER_SKIN.offerCost}</span>
                                            <span className="text-green-300 text-sm font-bold">USDC</span>
                                        </div>
                                    </div>
                                    <div className="bg-red-500 text-white text-xs font-black px-2 py-1 rounded-lg">-99%</div>
                                </div>

                                {/* Countdown Timer */}
                                <div className="w-full bg-white/5 rounded-2xl border border-white/10 p-4">
                                    <div className="flex items-center justify-center gap-1.5 mb-3">
                                        <Clock className="w-4 h-4 text-orange-400" />
                                        <span className="text-orange-300 text-xs font-bold uppercase tracking-wider">Offer expires in</span>
                                    </div>
                                    {countdown.expired ? (
                                        <p className="text-center text-red-400 font-bold text-sm">Offer has expired</p>
                                    ) : (
                                        <div className="flex justify-center gap-2">
                                            {[
                                                { value: countdown.d, label: 'Days' },
                                                { value: countdown.h, label: 'Hrs' },
                                                { value: countdown.m, label: 'Min' },
                                                { value: countdown.s, label: 'Sec' },
                                            ].map(({ value, label }, i) => (
                                                <div key={i} className="flex flex-col items-center">
                                                    <div className="bg-purple-900/80 border border-purple-500/40 rounded-xl w-13 h-12 px-1 flex items-center justify-center">
                                                        <span className="text-xl font-black text-white tabular-nums">{pad(value)}</span>
                                                    </div>
                                                    <span className="text-white/40 text-[9px] mt-1 uppercase font-bold">{label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* CTA — Already Owned OR Buy Now */}
                                {alreadyOwned ? (
                                    <div className="w-full flex flex-col items-center gap-3">
                                        <div className="w-full flex items-center justify-center gap-2 bg-green-900/30 border-2 border-green-400/40 rounded-2xl py-3.5 px-4">
                                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                                            <span className="text-green-400 font-black text-sm">You already own this skin!</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/40 text-xs text-center leading-relaxed">
                                            <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-purple-400" />
                                            <span>The next limited offer will feature a different skin — stay tuned!</span>
                                        </div>
                                        <Button
                                            onClick={() => { soundManager.play('bubble'); onClose(); }}
                                            variant="outline"
                                            className="w-full bg-white/5 hover:bg-white/10 text-white border-white/20 rounded-2xl"
                                        >
                                            Got it
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={handleBuyNow}
                                        size="lg"
                                        disabled={countdown.expired}
                                        className="w-full h-14 text-lg font-black bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-purple-900 rounded-2xl shadow-[0_6px_0_rgba(161,98,7,0.8)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                        BUY NOW · $0.023 USDC
                                    </Button>
                                )}

                                <p className="text-white/20 text-[10px] text-center font-bold uppercase tracking-widest pb-1">
                                    One-time launch offer · While stock lasts
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Existing PurchaseModal handles the actual USDC payment */}
            <PurchaseModal
                isOpen={purchaseOpen}
                onClose={() => { setPurchaseOpen(false); onClose(); }}
                onConfirm={() => { }}
                onSuccess={handlePurchaseSuccess}
                type="confirmation"
                item={{
                    id: OFFER_SKIN.id,
                    name: OFFER_SKIN.name,
                    cost: OFFER_SKIN.offerCost,
                    currency: 'USDC',
                }}
                currentBalance={usdcBalance}
            />
        </>
    );
}
