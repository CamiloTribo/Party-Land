'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Trophy, Users, Coins, Medal, Crown,
    ArrowLeft, Volume2, VolumeX, Loader2, RefreshCw
} from 'lucide-react';
import { getReferralRankingAction, getTokenRankingAction } from '~/app/actions/userActions';
import { soundManager } from '~/lib/SoundManager';

interface RankingsScreenProps {
    onBack: () => void;
    soundEnabled: boolean;
    onToggleSound: () => void;
    myFid?: number;
}

interface ReferralEntry {
    fid: number;
    username: string | null;
    display_name: string | null;
    pfp_url: string | null;
    referral_count: number;
}

interface TokenEntry {
    fid: number;
    username: string | null;
    display_name: string | null;
    pfp_url: string | null;
    tokens: number;
}

type Tab = 'referrals' | 'tokens';

function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) return (
        <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/30">
            <Crown className="w-5 h-5 text-purple-900 fill-purple-900" />
        </div>
    );
    if (rank === 2) return (
        <div className="w-9 h-9 bg-slate-300 rounded-xl flex items-center justify-center shadow-lg shadow-slate-300/20">
            <Medal className="w-5 h-5 text-slate-700 fill-slate-700" />
        </div>
    );
    if (rank === 3) return (
        <div className="w-9 h-9 bg-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-600/20">
            <Medal className="w-5 h-5 text-amber-100 fill-amber-100" />
        </div>
    );
    return (
        <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
            <span className="text-xs font-black text-white/50">#{rank}</span>
        </div>
    );
}

function Avatar({ pfpUrl, name }: { pfpUrl?: string | null; name: string }) {
    if (pfpUrl) return (
        <img src={pfpUrl} alt={name} className="w-10 h-10 rounded-full border border-white/20 object-cover shrink-0" />
    );
    return (
        <div className="w-10 h-10 rounded-full bg-purple-700/60 border border-white/20 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-white/50" />
        </div>
    );
}

function getRankRowBg(rank: number, isMe: boolean) {
    if (isMe) return 'bg-pink-500/15 border-pink-400/30 ring-1 ring-pink-400/20';
    if (rank === 1) return 'bg-yellow-400/10 border-yellow-400/25';
    if (rank === 2) return 'bg-slate-400/10 border-slate-400/15';
    if (rank === 3) return 'bg-amber-600/10 border-amber-600/15';
    return 'bg-white/4 border-white/8';
}

function EmptyState({ tab }: { tab: Tab }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-white/30">
            {tab === 'referrals' ? <Users className="w-14 h-14" /> : <Coins className="w-14 h-14" />}
            <div className="text-center">
                <p className="text-base font-black text-white/40">No data yet</p>
                <p className="text-sm mt-1">
                    {tab === 'referrals' ? 'Be the first to invite friends!' : 'Start playing to earn tokens!'}
                </p>
            </div>
        </div>
    );
}

export default function RankingsScreen({ onBack, soundEnabled, onToggleSound, myFid }: RankingsScreenProps) {
    const [tab, setTab] = useState<Tab>('tokens');
    const [referrals, setReferrals] = useState<ReferralEntry[]>([]);
    const [tokens, setTokens] = useState<TokenEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const [refRes, tokRes] = await Promise.all([
                getReferralRankingAction(),
                getTokenRankingAction(),
            ]);
            if (refRes.success) setReferrals(refRes.data as ReferralEntry[]);
            if (tokRes.success) setTokens(tokRes.data as TokenEntry[]);
            if (!refRes.success && !tokRes.success) setError(true);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData, refreshKey]);

    const handleRefresh = () => {
        soundManager.play('bubble');
        setRefreshKey(k => k + 1);
    };

    const currentData: (ReferralEntry | TokenEntry)[] = tab === 'referrals' ? referrals : tokens;
    const myRank = myFid ? currentData.findIndex(r => r.fid === myFid) + 1 : 0;

    const renderRow = (entry: ReferralEntry | TokenEntry, idx: number) => {
        const rank = idx + 1;
        const isMe = entry.fid === myFid;
        const displayName = entry.username ? `@${entry.username}` : (entry.display_name ?? `FID:${entry.fid}`);
        const value = tab === 'referrals'
            ? `${(entry as ReferralEntry).referral_count} refs`
            : ((entry as TokenEntry).tokens ?? 0).toLocaleString();

        const valueColor = tab === 'referrals'
            ? (rank === 1 ? 'text-yellow-400' : 'text-white')
            : (rank === 1 ? 'text-yellow-400' : 'text-emerald-400');

        return (
            <div
                key={entry.fid}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border transition-all ${getRankRowBg(rank, isMe)}`}
            >
                <RankBadge rank={rank} />
                <Avatar pfpUrl={entry.pfp_url} name={displayName} />
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-black truncate ${isMe ? 'text-pink-300' : 'text-white'}`}>
                        {displayName}
                        {isMe && <span className="text-[10px] text-pink-400 font-black ml-1.5 bg-pink-400/10 px-1.5 py-0.5 rounded-full">YOU</span>}
                    </p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5 text-right">
                    <p className={`text-sm font-black leading-none ${valueColor}`}>{value}</p>
                    {tab === 'tokens' && (
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${rank === 1 ? 'bg-yellow-400' : 'bg-emerald-400'}`}>
                            <Coins className={`w-2.5 h-2.5 ${rank === 1 ? 'text-purple-900' : 'text-emerald-950'}`} />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-black flex flex-col overflow-hidden">

            {/* ── TopBar ── */}
            <div className="shrink-0 bg-indigo-950/80 backdrop-blur-md border-b border-white/10 px-4 py-3">
                <div className="flex items-center justify-between max-w-md mx-auto">
                    <button
                        onClick={() => { soundManager.play('click'); onBack(); }}
                        className="flex items-center gap-2 text-white hover:text-pink-300 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-black text-sm">Back</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <span className="font-black text-white text-sm uppercase tracking-widest">Rankings</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
                        >
                            <RefreshCw className={`w-4 h-4 text-white/60 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => { onToggleSound(); if (!soundEnabled) soundManager.play('bubble'); }}
                            className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
                        >
                            {soundEnabled ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4 text-white" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Tab Bar ── */}
            <div className="shrink-0 px-4 pt-4 pb-2 max-w-md mx-auto w-full">
                <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
                    <button
                        onClick={() => { soundManager.play('bubble'); setTab('referrals'); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-sm transition-all ${tab === 'referrals'
                            ? 'bg-yellow-400 text-purple-900 shadow-lg'
                            : 'text-white/50 hover:text-white'
                            }`}
                    >
                        <Users className="w-4 h-4" />
                        Party Friends
                    </button>
                    <button
                        onClick={() => { soundManager.play('bubble'); setTab('tokens'); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-sm transition-all ${tab === 'tokens'
                            ? 'bg-emerald-400 text-emerald-950 shadow-lg'
                            : 'text-white/50 hover:text-white'
                            }`}
                    >
                        <Coins className="w-4 h-4" />
                        Token Rich
                    </button>
                </div>
            </div>

            {/* ── My position banner ── */}
            {myRank > 0 && !loading && (
                <div className="shrink-0 px-4 pb-2 max-w-md mx-auto w-full">
                    <div className={`flex items-center justify-between px-4 py-2 rounded-2xl border ${tab === 'referrals' ? 'bg-yellow-400/10 border-yellow-400/20' : 'bg-emerald-400/10 border-emerald-400/20'}`}>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Your rank</span>
                            <span className={`font-black text-base ${tab === 'referrals' ? 'text-yellow-400' : 'text-emerald-400'}`}>#{myRank}</span>
                        </div>
                        {tab === 'referrals' ? (
                            <span className="text-xs text-white/50 font-bold">{(currentData[myRank - 1] as ReferralEntry)?.referral_count} referrals</span>
                        ) : (
                            <span className="text-xs text-white/50 font-bold">{((currentData[myRank - 1] as TokenEntry)?.tokens ?? 0).toLocaleString()} tokens</span>
                        )}
                    </div>
                </div>
            )}

            {/* ── List ── */}
            <div className="flex-1 overflow-y-auto px-4 pb-6 max-w-md mx-auto w-full">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/40">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <p className="text-sm font-bold">Loading rankings...</p>
                    </div>
                )}
                {error && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/40">
                        <Trophy className="w-10 h-10" />
                        <p className="text-sm font-bold text-center">Could not load rankings.<br />Tap refresh to try again.</p>
                    </div>
                )}
                {!loading && !error && currentData.length === 0 && <EmptyState tab={tab} />}
                {!loading && !error && currentData.length > 0 && (
                    <div className="space-y-2">
                        {/* Top 3 podium hint */}
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest text-center py-2">
                            Top 50 · {tab === 'referrals' ? 'Most referrals' : 'Most tokens'}
                        </p>
                        {currentData.map((entry, idx) => renderRow(entry as any, idx))}
                    </div>
                )}
            </div>
        </div>
    );
}
