'use client';

import React, { useState } from 'react';
import { Users, Gift, Copy, Check, Share2, Star, TrendingUp, Trophy, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../ui/Button';
import { useUserGameData } from '~/hooks/useUserGameData';
import { soundManager } from '~/lib/SoundManager';
import { FARCASTER_MINIAPP_URL } from '~/lib/constants';
import { shareToFarcaster } from '~/lib/utils';
import { fireConfetti } from '~/lib/confetti';
import MilestoneClaimedModal from './MilestoneClaimedModal';
import ReferralRankingModal from './ReferralRankingModal';

interface ReferralsScreenProps {
    onBack: () => void;
    soundEnabled: boolean;
    onToggleSound: () => void;
}

const MILESTONES: Array<{ id: string; count: number; reward: string; type: 'tokens' | 'usdc' }> = [
    { id: '10_REFS', count: 10, reward: '1000 Tokens', type: 'tokens' },
    { id: '20_REFS', count: 20, reward: '2500 Tokens', type: 'tokens' },
    { id: '50_REFS', count: 50, reward: '75K Tokens', type: 'tokens' },
    { id: '100_REFS', count: 100, reward: '$0.23 USDC', type: 'usdc' },
    { id: '1000_REFS', count: 1000, reward: '$2.3 USDC', type: 'usdc' },
];

export default function ReferralsScreen({ onBack, soundEnabled, onToggleSound }: ReferralsScreenProps) {
    const { fid, referralCount, claimMilestone, claimedMilestones } = useUserGameData();
    const [copied, setCopied] = useState(false);
    const [claiming, setClaiming] = useState<string | null>(null);
    const [showRanking, setShowRanking] = useState(false);
    const [celebrationModal, setCelebrationModal] = useState<{
        isOpen: boolean;
        milestone: typeof MILESTONES[0];
        txHash?: string;
    } | null>(null);

    const referralLink = `${FARCASTER_MINIAPP_URL}?ref=${fid}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        soundManager.play('click');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClaim = async (milestoneId: string) => {
        setClaiming(milestoneId);
        soundManager.play('victory');
        fireConfetti();
        const result = await claimMilestone(milestoneId);
        if (!result) {
            alert('Could not claim reward. Make sure you reached the goal!');
        } else {
            // Show celebration modal
            const milestone = MILESTONES.find(m => m.id === milestoneId)!;
            setCelebrationModal({
                isOpen: true,
                milestone,
                txHash: typeof result === 'object' && result.txHash ? result.txHash : undefined,
            });
        }
        setClaiming(null);
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-b from-purple-900 via-indigo-900 to-black overflow-y-auto pb-20">
            {/* Header / TopBar */}
            <div className="sticky top-0 z-20 bg-purple-900/80 backdrop-blur-md border-b border-white/10 p-4">
                <div className="flex items-center justify-between max-w-md mx-auto w-full">
                    <button
                        onClick={() => { soundManager.play('click'); onBack(); }}
                        className="flex items-center gap-2 text-white hover:text-pink-300 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                        <span className="font-bold">Back</span>
                    </button>

                    {/* Ranking Button */}
                    <button
                        onClick={() => { soundManager.play('click'); setShowRanking(true); }}
                        className="h-10 px-4 bg-yellow-400/20 hover:bg-yellow-400/30 backdrop-blur-sm rounded-full flex items-center justify-center gap-2 transition-colors shadow-lg"
                    >
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">RANKING</span>
                    </button>

                    {/* Sound Toggle */}
                    <button
                        onClick={() => {
                            onToggleSound();
                            if (!soundEnabled) soundManager.play('bubble');
                        }}
                        className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors shadow-lg"
                    >
                        {soundEnabled ? (
                            <Volume2 className="w-5 h-5 text-white" />
                        ) : (
                            <VolumeX className="w-5 h-5 text-white" />
                        )}
                    </button>
                </div>
            </div>

            <div className="p-6 max-w-md mx-auto space-y-8">
                {/* Welcome Section */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-500/20 rounded-full border border-pink-500/30">
                        <Users className="w-4 h-4 text-pink-400" />
                        <span className="text-pink-300 text-xs font-black uppercase tracking-widest">Global Rewards System</span>
                    </div>
                    <h2 className="text-4xl font-black text-white leading-tight uppercase">
                        Invite <span className="text-yellow-400">1 Friend</span><br />
                        <span className="text-pink-400">Get 23 Tokens</span>
                    </h2>
                    <p className="text-white/60 text-sm font-medium px-4">
                        Share your unique link. For every friend who joins, you get 23 tokens instantly plus massive milestone rewards!
                    </p>
                </div>

                {/* Share Link Card */}
                <div className="bg-white/5 border-2 border-white/10 rounded-[32px] p-6 space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Gift className="w-20 h-20 text-white" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">My Unique Party Link</label>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-white/50 text-xs truncate">
                                {referralLink}
                            </div>
                            <button
                                onClick={handleCopyLink}
                                className="bg-white flex items-center justify-center p-3 rounded-2xl active:scale-95 transition-all text-purple-900"
                            >
                                {copied ? <Check size={20} /> : <Copy size={20} />}
                            </button>
                        </div>
                    </div>

                    <Button
                        onClick={() => {
                            soundManager.play('click');
                            shareToFarcaster(`Join me in Party Land! 🎡 use my link to get a starter token pack for free! ${referralLink}`);
                        }}
                        className="w-full bg-pink-600 hover:bg-pink-500 text-white font-black py-4 rounded-2xl shadow-[0_4px_0_rgb(157,23,77)] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2"
                    >
                        <Share2 size={20} />
                        INVITE FRIENDS
                    </Button>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-5 text-center space-y-1">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">Total Referred</p>
                        <p className="text-4xl font-black text-white leading-none">{referralCount}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-5 text-center space-y-1">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">Instant Reward</p>
                        <p className="text-4xl font-black text-yellow-400 leading-none">23</p>
                    </div>
                </div>

                {/* Milestones List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-400" />
                            Party Milestones
                        </h3>
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Global Rewards</span>
                    </div>

                    <div className="space-y-3">
                        {MILESTONES.map((m) => {
                            const reached = referralCount >= m.count;
                            const isClaiming = claiming === m.id;
                            const isClaimed = claimedMilestones.includes(m.id);

                            return (reached && (
                                <div key={m.id} className={`group relative p-5 rounded-[24px] border-2 transition-all ${reached ? 'bg-gradient-to-r from-yellow-400/10 to-transparent border-yellow-400/30' : 'bg-white/5 border-white/5 opacity-50'
                                    }`}>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${reached ? 'bg-yellow-400 text-purple-900 shadow-lg shadow-yellow-400/20' : 'bg-white/10 text-white/30'
                                                }`}>
                                                <Star className={`w-6 h-6 ${reached ? 'fill-purple-900' : ''}`} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-white/40 uppercase leading-none mb-1">{m.count} Friends</p>
                                                <p className="text-xl font-black text-white leading-none">{m.reward}</p>
                                            </div>
                                        </div>

                                        {reached && (
                                            <Button
                                                onClick={() => !isClaimed && handleClaim(m.id)}
                                                disabled={isClaiming || isClaimed}
                                                size="sm"
                                                className={`font-black px-6 py-2 rounded-xl text-xs transition-all ${isClaimed
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                                                    : 'bg-yellow-400 text-purple-900 hover:bg-yellow-300'
                                                    }`}
                                            >
                                                {isClaiming ? '...' : (isClaimed ? 'CLAIMED' : 'CLAIM')}
                                            </Button>
                                        )}
                                    </div>

                                    {/* Progress Bar mini */}
                                    {!reached && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-white/20"
                                                style={{ width: `${Math.min(100, (referralCount / m.count) * 100)}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))
                        }
                        )}

                        {/* Show pending ones but with lower opacity and no button */}
                        {MILESTONES.filter(m => referralCount < m.count).map((m) => (
                            <div key={m.id} className="p-5 rounded-[24px] border-2 bg-white/5 border-white/5 opacity-40">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 text-white/30 flex items-center justify-center">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white/40 uppercase leading-none mb-1">{m.count} Friends Required</p>
                                            <p className="text-xl font-black text-white/40 leading-none">{m.reward}</p>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black text-white/20 uppercase tracking-widest pr-2">
                                        {referralCount}/{m.count}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer info */}
                <p className="text-center text-white/20 text-[10px] font-bold uppercase tracking-[0.2em] pt-4">
                    All referrals are audited for authenticity
                </p>

            </div>

            {/* Milestone Celebration Modal */}
            {celebrationModal && (
                <MilestoneClaimedModal
                    isOpen={celebrationModal.isOpen}
                    onClose={() => setCelebrationModal(null)}
                    milestone={celebrationModal.milestone}
                    txHash={celebrationModal.txHash}
                />
            )}

            {/* Ranking Modal */}
            <ReferralRankingModal
                isOpen={showRanking}
                onClose={() => setShowRanking(false)}
                myFid={fid}
            />
        </div>
    );
}
