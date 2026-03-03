'use client';

import React from 'react';
import { Trophy, Share2, X, Star, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { shareToFarcaster } from '~/lib/utils';
import { soundManager } from '~/lib/SoundManager';
import { FARCASTER_MINIAPP_URL } from '~/lib/constants';

interface MilestoneClaimedModalProps {
    isOpen: boolean;
    onClose: () => void;
    milestone: {
        id: string;
        count: number;
        reward: string;
        type: 'tokens' | 'usdc';
    };
    txHash?: string; // Only for USDC milestones
}


export default function MilestoneClaimedModal({
    isOpen,
    onClose,
    milestone,
    txHash,
}: MilestoneClaimedModalProps) {
    if (!isOpen) return null;

    const isUSDC = milestone.type === 'usdc';

    const handleShare = () => {
        soundManager.play('click');
        const text = isUSDC
            ? `🏆 Just earned ${milestone.reward} from Party Land referrals! 🎉 Invited ${milestone.count} friends and got paid in real USDC on Base! Join me 👇`
            : `🏆 Milestone unlocked in Party Land! 🎉 Invited ${milestone.count} friends and earned ${milestone.reward}! Want to earn too? 👇`;
        shareToFarcaster(`${text} ${FARCASTER_MINIAPP_URL}`);
    };

    const handleViewTx = () => {
        if (txHash && typeof window !== 'undefined') {
            window.open(`https://basescan.org/tx/${txHash}`, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-gradient-to-b from-purple-900 to-indigo-950 border-2 border-yellow-400/40 rounded-[32px] p-8 shadow-2xl shadow-yellow-400/10 animate-in slide-in-from-bottom-4 duration-300 z-10">

                {/* Close button */}
                <button
                    onClick={() => { soundManager.play('bubble'); onClose(); }}
                    className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all"
                >
                    <X size={16} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-30 rounded-full scale-150" />
                        <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-3xl flex items-center justify-center shadow-lg shadow-yellow-400/30 animate-bounce">
                            <Trophy className="w-12 h-12 text-purple-900" />
                        </div>
                    </div>
                </div>

                {/* Text */}
                <div className="text-center space-y-2 mb-6">
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-400/20 rounded-full border border-yellow-400/30 mb-2">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-yellow-300 text-[10px] font-black uppercase tracking-widest">Milestone Unlocked!</span>
                    </div>
                    <h2 className="text-3xl font-black text-white leading-tight">
                        You earned<br />
                        <span className={isUSDC ? 'text-blue-400' : 'text-yellow-400'}>
                            {milestone.reward}
                        </span>
                    </h2>
                    <p className="text-white/50 text-sm">
                        For inviting <span className="text-white font-bold">{milestone.count} friends</span> to Party Land 🎉
                    </p>
                </div>

                {/* TX Hash for USDC */}
                {isUSDC && txHash && (
                    <button
                        onClick={handleViewTx}
                        className="w-full mb-4 flex items-center justify-between gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-2xl px-4 py-3 transition-all group"
                    >
                        <div className="text-left">
                            <p className="text-[10px] font-black text-blue-400/70 uppercase tracking-widest">Base Transaction</p>
                            <p className="text-xs text-blue-300 font-mono">
                                {txHash.slice(0, 10)}...{txHash.slice(-8)}
                            </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-blue-400/60 group-hover:text-blue-300 transition-colors shrink-0" />
                    </button>
                )}

                {/* Buttons */}
                <div className="space-y-3">
                    <Button
                        onClick={handleShare}
                        className="w-full bg-pink-600 hover:bg-pink-500 text-white font-black py-4 rounded-2xl shadow-[0_4px_0_rgb(157,23,77)] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 transition-all"
                    >
                        <Share2 size={18} />
                        SHARE ON FARCASTER
                    </Button>
                    <Button
                        onClick={() => { soundManager.play('click'); onClose(); }}
                        variant="outline"
                        className="w-full bg-white/5 hover:bg-white/10 text-white border-white/20 rounded-2xl"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
