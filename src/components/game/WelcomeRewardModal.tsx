'use client';

import React, { useState } from 'react';
import { Gift, Sparkles, Star, TrendingUp, Share2, Gamepad2, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { soundManager } from '~/lib/SoundManager';
import { shareToFarcaster } from '~/lib/utils';
import { fireConfetti } from '~/lib/confetti';
import { FARCASTER_MINIAPP_URL } from '~/lib/constants';
import confetti from 'canvas-confetti';

interface WelcomeRewardModalProps {
    onClaim: () => Promise<void>;
    onClose: () => void;
    isOpen: boolean;
}

export function WelcomeRewardModal({ onClaim, onClose, isOpen }: WelcomeRewardModalProps) {
    const [isClaiming, setIsClaiming] = useState(false);
    const [claimed, setClaimed] = useState(false);

    if (!isOpen) return null;

    const handleClaim = async () => {
        setIsClaiming(true);
        soundManager.play('victory');

        // Big confetti burst on claim
        fireConfetti();

        try {
            await onClaim();
            setClaimed(true); // Switch to success view
        } catch (err) {
            console.error('Claim failed:', err);
        } finally {
            setIsClaiming(false);
        }
    };

    const handleShare = () => {
        soundManager.play('click');
        shareToFarcaster(
            `🎉 Just joined Party Land on Farcaster and got a FREE 230 token welcome gift! 🎮 Collect skins, climb rankings and earn real rewards! Come play 👇 ${FARCASTER_MINIAPP_URL}`
        );
    };

    // ── STEP 2: Success / Share screen ────────────────────────────────────────
    if (claimed) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-purple-950/80 backdrop-blur-md" />
                <div className="relative w-full max-w-sm bg-gradient-to-b from-green-600 to-emerald-900 rounded-[32px] p-8 shadow-2xl border-2 border-green-400/40 animate-in fade-in zoom-in duration-300">

                    {/* Success icon */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-400 blur-2xl opacity-40 rounded-full scale-150" />
                            <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-400/40 animate-bounce">
                                <Check className="w-12 h-12 text-white" strokeWidth={3} />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center space-y-3 mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
                            <Sparkles className="w-4 h-4 text-yellow-300" />
                            <span className="text-white text-xs font-bold uppercase tracking-wider">Welcome Gift Claimed!</span>
                        </div>

                        <h2 className="text-4xl font-black text-white leading-tight">
                            <span className="text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">+230 Tokens</span><br />
                            <span className="text-2xl">Added to your wallet! 🎊</span>
                        </h2>

                        <p className="text-green-100 text-sm font-medium leading-relaxed">
                            Share Party Land with your friends — they get a gift too and you grow your referral rewards!
                        </p>
                    </div>

                    <div className="space-y-3">
                        {/* Share button */}
                        <Button
                            onClick={handleShare}
                            size="lg"
                            className="w-full text-base font-black h-14 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl shadow-[0_6px_0_rgb(157,23,77)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                            <Share2 className="w-5 h-5" />
                            SHARE ON FARCASTER
                        </Button>

                        {/* Start Playing */}
                        <Button
                            onClick={() => { soundManager.play('bubble'); onClose(); }}
                            size="lg"
                            className="w-full text-base font-black h-14 bg-yellow-400 hover:bg-yellow-300 text-purple-900 rounded-2xl shadow-[0_6px_0_rgb(161,98,7)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                            <Gamepad2 className="w-5 h-5" />
                            START PLAYING!
                        </Button>
                    </div>

                    <p className="mt-4 text-center text-white/30 text-[10px] font-bold uppercase tracking-widest">
                        Every friend you invite earns you 23 more tokens
                    </p>
                </div>
            </div>
        );
    }

    // ── STEP 1: Claim screen (original) ───────────────────────────────────────
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-purple-950/80 backdrop-blur-md" />

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-gradient-to-b from-purple-600 to-indigo-900 rounded-[32px] p-8 shadow-2xl border-2 border-white/20 animate-in fade-in zoom-in duration-300">

                {/* Decorative Elements */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                    <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/50 animate-bounce">
                        <Gift className="w-12 h-12 text-purple-900" />
                    </div>
                </div>

                <div className="mt-8 text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        <span className="text-white text-xs font-bold uppercase tracking-wider">Welcome Gift</span>
                    </div>

                    <h2 className="text-4xl font-black text-white leading-tight">
                        CLAIM YOUR <br />
                        <span className="text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">230 TOKENS</span>
                    </h2>

                    <p className="text-purple-100 text-sm font-medium leading-relaxed">
                        Welcome to Party Land! We've got a little present to get your party started. Use them to buy your favorite skins!
                    </p>
                </div>

                {/* Reward Value Display */}
                <div className="my-8 flex justify-center">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative flex items-center gap-3 bg-white/10 hover:bg-white/15 px-6 py-4 rounded-3xl border-2 border-white/20 transition-all scale-110">
                            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
                                <Star className="w-6 h-6 text-purple-900 fill-purple-900" />
                            </div>
                            <span className="text-4xl font-black text-white">230</span>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleClaim}
                    disabled={isClaiming}
                    size="lg"
                    className="w-full text-2xl font-black h-16 bg-yellow-400 hover:bg-yellow-300 text-purple-900 rounded-2xl shadow-[0_8px_0_rgb(161,98,7)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
                >
                    {isClaiming ? 'REWARDING...' : 'CLAIM NOW!'}
                    {!isClaiming && <TrendingUp className="w-6 h-6" />}
                </Button>

                <p className="mt-6 text-center text-white/40 text-[10px] font-bold uppercase tracking-widest">
                    Limited time offer for new party members
                </p>
            </div>
        </div>
    );
}
