'use client';

import React, { useState } from 'react';
import { Gift, Sparkles, Star, TrendingUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { soundManager } from '~/lib/SoundManager';
import confetti from 'canvas-confetti';

interface WelcomeRewardModalProps {
    onClaim: () => Promise<void>;
    isOpen: boolean;
}

export function WelcomeRewardModal({ onClaim, isOpen }: WelcomeRewardModalProps) {
    const [isClaiming, setIsClaiming] = useState(false);

    if (!isOpen) return null;

    const handleClaim = async () => {
        setIsClaiming(true);
        soundManager.play('victory');

        // Fire confetti!
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        try {
            await onClaim();
        } catch (err) {
            console.error('Claim failed:', err);
        } finally {
            setIsClaiming(false);
        }
    };

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
