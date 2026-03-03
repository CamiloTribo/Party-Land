'use client';

import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Users, Loader2, Crown } from 'lucide-react';
import { getReferralRankingAction } from '~/app/actions/userActions';
import { soundManager } from '~/lib/SoundManager';

interface RankingEntry {
    fid: number;
    username: string | null;
    display_name: string | null;
    pfp_url: string | null;
    referral_count: number;
}

interface ReferralRankingModalProps {
    isOpen: boolean;
    onClose: () => void;
    myFid?: number; // to highlight the current user's row
}

function getRankIcon(rank: number) {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-300 fill-slate-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600 fill-amber-600" />;
    return (
        <span className="text-xs font-black text-white/40 w-5 text-center">
            #{rank}
        </span>
    );
}

function getRankBg(rank: number, isMe: boolean) {
    if (isMe) return 'bg-pink-500/20 border-pink-500/40 ring-1 ring-pink-500/30';
    if (rank === 1) return 'bg-yellow-400/10 border-yellow-400/30';
    if (rank === 2) return 'bg-slate-400/10 border-slate-400/20';
    if (rank === 3) return 'bg-amber-700/10 border-amber-700/20';
    return 'bg-white/5 border-white/5';
}

export default function ReferralRankingModal({ isOpen, onClose, myFid }: ReferralRankingModalProps) {
    const [ranking, setRanking] = useState<RankingEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const fetchRanking = async () => {
            setLoading(true);
            setError(false);
            try {
                const res = await getReferralRankingAction();
                if (res.success) {
                    setRanking(res.data as RankingEntry[]);
                } else {
                    setError(true);
                }
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchRanking();
    }, [isOpen]);

    if (!isOpen) return null;

    const myRank = myFid ? ranking.findIndex(r => r.fid === myFid) + 1 : 0;

    return (
        <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => { soundManager.play('bubble'); onClose(); }}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm h-[80vh] bg-gradient-to-b from-indigo-950 to-purple-950 border-2 border-yellow-400/30 rounded-t-[32px] sm:rounded-[32px] shadow-2xl shadow-yellow-400/10 flex flex-col z-10 overflow-hidden">

                {/* Header */}
                <div className="shrink-0 flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-400/20 rounded-2xl flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white leading-none">Party Ranking</h2>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Top referrers</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { soundManager.play('bubble'); onClose(); }}
                        className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* My position banner (if in top 50) */}
                {myRank > 0 && !loading && (
                    <div className="shrink-0 px-4 pt-3">
                        <div className="flex items-center gap-2 bg-pink-500/15 border border-pink-500/30 rounded-2xl px-4 py-2.5">
                            <span className="text-pink-300 text-xs font-black">YOU ARE</span>
                            <span className="text-white font-black">#{myRank}</span>
                            <span className="text-white/40 text-xs ml-auto">
                                {ranking[myRank - 1]?.referral_count} referrals
                            </span>
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {loading && (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-white/40">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p className="text-sm font-bold">Loading ranking...</p>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-white/40">
                            <Users className="w-10 h-10" />
                            <p className="text-sm font-bold text-center">Could not load ranking.<br />Try again later.</p>
                        </div>
                    )}

                    {!loading && !error && ranking.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-white/40">
                            <Trophy className="w-10 h-10" />
                            <p className="text-sm font-bold text-center">No referrals yet.<br />Be the first! 🎉</p>
                        </div>
                    )}

                    {!loading && !error && ranking.map((entry, idx) => {
                        const rank = idx + 1;
                        const isMe = entry.fid === myFid;
                        const displayName = entry.username
                            ? `@${entry.username}`
                            : entry.display_name ?? `fid:${entry.fid}`;

                        return (
                            <div
                                key={entry.fid}
                                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${getRankBg(rank, isMe)}`}
                            >
                                {/* Rank icon */}
                                <div className="w-8 flex items-center justify-center shrink-0">
                                    {getRankIcon(rank)}
                                </div>

                                {/* Avatar */}
                                {entry.pfp_url ? (
                                    <img
                                        src={entry.pfp_url}
                                        alt={displayName}
                                        className="w-9 h-9 rounded-full border border-white/20 shrink-0 object-cover"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-purple-700 border border-white/20 flex items-center justify-center shrink-0">
                                        <Users className="w-4 h-4 text-white/60" />
                                    </div>
                                )}

                                {/* Name */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-black truncate ${isMe ? 'text-pink-300' : 'text-white'}`}>
                                        {displayName}
                                        {isMe && <span className="text-pink-400 text-[10px] ml-1 font-black">YOU</span>}
                                    </p>
                                </div>

                                {/* Referral count */}
                                <div className="shrink-0 text-right">
                                    <p className={`text-base font-black leading-none ${rank === 1 ? 'text-yellow-400' : 'text-white'}`}>
                                        {entry.referral_count}
                                    </p>
                                    <p className="text-[10px] text-white/30 font-bold uppercase">refs</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="shrink-0 px-4 py-3 border-t border-white/10">
                    <p className="text-center text-white/20 text-[10px] font-bold uppercase tracking-widest">
                        Top 50 · Updated in real time
                    </p>
                </div>
            </div>
        </div>
    );
}
