'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, PartyPopper, Trophy, Clock, Coins, Users, TrendingUp, TrendingDown,
    ChevronRight, Zap, CheckCircle2, Lock, Info, ChevronDown, ChevronUp,
    Ticket, Smartphone, DollarSign, Calendar
} from 'lucide-react';
import { useUserGameData } from '~/hooks/useUserGameData';
import {
    getActiveAirdropAction, checkUserParticipationAction,
    joinAirdropAction, getRecentParticipantsAction,
    type ActiveAirdrop
} from '~/app/actions/airdropActions';
import { PurchaseModal } from './PurchaseModal';
import { soundManager } from '~/lib/SoundManager';

interface AirdropModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AirdropState = 'loading' | 'no_active' | 'not_eligible' | 'eligible' | 'already_joined' | 'success';

interface TimeLeft { days: number; hours: number; minutes: number; seconds: number; }
interface RecentParticipant { username: string; joined_at: string; }

function getTimeLeft(endAt: string): TimeLeft {
    const diff = new Date(endAt).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    };
}

function TimeUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 min-w-[52px] text-center">
                <span className="text-2xl font-black text-white tabular-nums">
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            <span className="text-[10px] text-purple-300 mt-1 uppercase tracking-widest font-bold">{label}</span>
        </div>
    );
}

function LiveTicker({ participants }: { participants: RecentParticipant[] }) {
    const [visibleIdx, setVisibleIdx] = useState(0);

    useEffect(() => {
        if (participants.length <= 1) return;
        const interval = setInterval(() => {
            setVisibleIdx(prev => (prev + 1) % participants.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [participants.length]);

    if (participants.length === 0) return null;

    const current = participants[visibleIdx];
    const timeAgo = (iso: string) => {
        const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        return `${Math.floor(mins / 60)}h ago`;
    };

    return (
        <div className="bg-white/5 border border-purple-500/20 rounded-xl px-3 py-2.5 overflow-hidden">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
                <AnimatePresence mode="wait">
                    <motion.p
                        key={visibleIdx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="text-xs text-white"
                    >
                        <span className="text-purple-300 font-bold">@{current.username || 'anon'}</span>
                        {' '}entered the airdrop
                        <span className="text-purple-500 ml-1.5">· {timeAgo(current.joined_at)}</span>
                    </motion.p>
                </AnimatePresence>
                {participants.length > 1 && (
                    <span className="ml-auto text-[10px] text-purple-500 shrink-0">
                        +{participants.length - 1} more
                    </span>
                )}
            </div>
        </div>
    );
}

function HowItWorks({ endLabel }: { endLabel: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
                <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-bold text-white">How the airdrop works</span>
                </div>
                {open ? <ChevronUp className="w-4 h-4 text-purple-400" /> : <ChevronDown className="w-4 h-4 text-purple-400" />}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-2.5 border-t border-white/10 pt-3">
                            {[
                                { icon: <Ticket className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />, text: 'Pay $0.023 USDC on Base + spend 1,500 game tokens to enter' },
                                { icon: <DollarSign className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />, text: 'Your $0.023 is added to a shared pool. We seed it with $10 every week' },
                                { icon: <TrendingDown className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />, text: 'Fewer participants = higher payout per person. Join early for the best returns' },
                                { icon: <Calendar className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />, text: `Pool closes ${endLabel}. At that point it's split equally between everyone in` },
                                { icon: <Smartphone className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />, text: 'USDC sent directly to your connected Base wallet — no extra steps' },
                                { icon: <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />, text: 'One entry per wallet per week. Tokens are burned on entry and non-refundable' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-2.5 items-start">
                                    {item.icon}
                                    <p className="text-xs text-purple-200 leading-relaxed">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function AirdropModal({ isOpen, onClose }: AirdropModalProps) {
    const { tokens, username, walletAddress, usdcBalance, fid, refetchUSDC } = useUserGameData();
    const [state, setState] = useState<AirdropState>('loading');
    const [airdrop, setAirdrop] = useState<ActiveAirdrop | null>(null);
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [purchaseOpen, setPurchaseOpen] = useState(false);
    const [livePool, setLivePool] = useState<number>(0);
    const [liveCount, setLiveCount] = useState<number>(0);
    const [recentParticipants, setRecentParticipants] = useState<RecentParticipant[]>([]);
    const [successData, setSuccessData] = useState<{ pool: number; count: number; payout: number } | null>(null);
    const initialized = useRef(false);

    const load = useCallback(async () => {
        if (!fid) return;
        setState('loading');

        const active = await getActiveAirdropAction();
        if (!active) { setState('no_active'); return; }

        setAirdrop(active);
        setLivePool(active.pool_usdc);
        setLiveCount(active.participant_count);
        setTimeLeft(getTimeLeft(active.end_at));

        // Load ticker participants
        const recent = await getRecentParticipantsAction(active.id);
        setRecentParticipants(recent);

        const participation = await checkUserParticipationAction(fid);
        if (participation.joined) setState('already_joined');
        else if ((tokens || 0) < 1500) setState('not_eligible');
        else setState('eligible');
    }, [fid, tokens]);

    useEffect(() => {
        if (isOpen && !initialized.current) { initialized.current = true; load(); }
        if (!isOpen) initialized.current = false;
    }, [isOpen, load]);

    // Live countdown
    useEffect(() => {
        if (!airdrop || state === 'loading' || state === 'no_active') return;
        const tick = setInterval(() => setTimeLeft(getTimeLeft(airdrop.end_at)), 1000);
        return () => clearInterval(tick);
    }, [airdrop, state]);

    const payout = liveCount > 0 ? livePool / liveCount : livePool;
    const tokenProgress = Math.min(100, ((tokens || 0) / 1500) * 100);

    const endLabel = airdrop ? new Date(airdrop.end_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : '';

    const handlePurchaseSuccess = async (txHash?: string) => {
        if (!txHash || !fid || !airdrop) return;
        soundManager.play('coin');
        const result = await joinAirdropAction(fid, username || '', walletAddress || '', txHash);
        if (result.success) {
            setLivePool(result.pool_usdc ?? livePool);
            setLiveCount(result.participant_count ?? liveCount);
            setSuccessData({ pool: result.pool_usdc ?? livePool, count: result.participant_count ?? liveCount, payout: result.payout_per_person ?? payout });
            // Prepend user to ticker
            setRecentParticipants(prev => [{ username: username || 'you', joined_at: new Date().toISOString() }, ...prev]);
            setState('success');
            refetchUSDC?.();
        }
    };

    const shareOnFarcaster = () => {
        const pool = successData?.pool ?? livePool;
        const count = successData?.count ?? liveCount;
        const myPayout = successData?.payout ?? payout;
        const text = encodeURIComponent(
            `Just entered the Party Land Weekly Airdrop!\n\nPool: $${pool.toFixed(2)} USDC between ${count} players\nMy current payout: $${myPayout.toFixed(4)} USDC\n\nGet in early — fewer players = bigger share`
        );
        const embedUrl = encodeURIComponent('https://farcaster.xyz/miniapps/1bhqOrw3ONX6/party-land');
        window.open(`https://warpcast.com/~/compose?text=${text}&embeds[]=${embedUrl}`, '_blank');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

                <motion.div
                    className="relative w-full max-w-md bg-gradient-to-b from-[#1a0a3a] to-[#0d0620] rounded-t-[32px] overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                >
                    {/* Top glow edge */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400 to-transparent" />

                    {/* Header */}
                    <div className="relative px-5 pt-5 pb-3 shrink-0">
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/20" />
                        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                            <X className="w-4 h-4 text-white" />
                        </button>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/40">
                                <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white leading-none">{airdrop?.label ?? 'Weekly Airdrop'}</h2>
                                <p className="text-[11px] text-purple-300 font-medium">Party Land · Powered by Base</p>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable body */}
                    <div className="overflow-y-auto flex-1 px-5 pb-6 space-y-3">

                        {/* LOADING */}
                        {state === 'loading' && (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-purple-300 text-sm">Loading airdrop data...</p>
                            </div>
                        )}

                        {/* NO ACTIVE */}
                        {state === 'no_active' && (
                            <div className="flex flex-col items-center text-center py-16 gap-4">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                    <Clock className="w-8 h-8 text-purple-400" />
                                </div>
                                <p className="text-white font-bold text-lg">No active airdrop</p>
                                <p className="text-purple-300 text-sm max-w-xs">The next airdrop is coming soon. Stack your tokens and stay active — we'll notify you when it opens!</p>
                            </div>
                        )}

                        {/* COUNTDOWN + POOL STATS (shared by eligible, not_eligible, already_joined) */}
                        {airdrop && !['loading', 'no_active', 'success'].includes(state) && (
                            <>
                                {/* Countdown */}
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                    <div className="flex items-center gap-1.5 mb-3">
                                        <Clock className="w-3.5 h-3.5 text-orange-400" />
                                        <span className="text-[11px] font-bold text-orange-400 uppercase tracking-widest">Pool closes in</span>
                                    </div>
                                    <div className="flex items-start justify-center gap-2">
                                        <TimeUnit value={timeLeft.days} label="Days" />
                                        <span className="text-white/40 text-xl font-black mt-1">:</span>
                                        <TimeUnit value={timeLeft.hours} label="Hrs" />
                                        <span className="text-white/40 text-xl font-black mt-1">:</span>
                                        <TimeUnit value={timeLeft.minutes} label="Min" />
                                        <span className="text-white/40 text-xl font-black mt-1">:</span>
                                        <TimeUnit value={timeLeft.seconds} label="Sec" />
                                    </div>
                                </div>

                                {/* Pool stats */}
                                <div className="bg-gradient-to-br from-violet-900/60 to-purple-900/40 border border-violet-500/30 rounded-2xl p-4">
                                    <p className="text-center text-[11px] font-bold text-purple-300 uppercase tracking-widest mb-3">Live Pool</p>
                                    <div className="text-center mb-4">
                                        <p className="text-4xl font-black text-white">
                                            <span className="text-yellow-400">$</span>{livePool.toFixed(3)}
                                        </p>
                                        <p className="text-purple-300 text-xs mt-1">USDC · Split equally between all participants</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 flex-1">
                                            <Users className="w-4 h-4 text-blue-400 shrink-0" />
                                            <div>
                                                <p className="text-[10px] text-purple-400 font-semibold uppercase tracking-wide leading-none">Participants</p>
                                                <p className="text-sm font-black text-white mt-0.5">{liveCount}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 flex-1">
                                            <TrendingUp className="w-4 h-4 text-green-400 shrink-0" />
                                            <div>
                                                <p className="text-[10px] text-purple-400 font-semibold uppercase tracking-wide leading-none">Your payout now</p>
                                                <p className="text-sm font-black text-green-400 mt-0.5">${payout.toFixed(4)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Live ticker */}
                                {recentParticipants.length > 0 && <LiveTicker participants={recentParticipants} />}
                            </>
                        )}

                        {/* NOT ELIGIBLE */}
                        {state === 'not_eligible' && airdrop && (
                            <div className="space-y-3">
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Lock className="w-4 h-4 text-orange-400" />
                                        <p className="text-sm font-bold text-white">Entry locked — need more tokens</p>
                                    </div>
                                    <div className="flex justify-between text-xs text-purple-300 mb-2">
                                        <span>Your tokens</span>
                                        <span className="font-bold text-white">{(tokens || 0).toLocaleString()} / 1,500</span>
                                    </div>
                                    <div className="h-3 rounded-full bg-white/10 overflow-hidden mb-2">
                                        <motion.div
                                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${tokenProgress}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                        />
                                    </div>
                                    <p className="text-xs text-purple-400 text-center">
                                        {Math.max(0, 1500 - (tokens || 0)).toLocaleString()} more tokens to unlock entry
                                    </p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
                                    <Coins className="w-5 h-5 text-yellow-400 shrink-0" />
                                    <p className="text-xs text-purple-200">Play games to earn tokens. Every floor = 1 token. Victory = 600 tokens.</p>
                                </div>
                                <HowItWorks endLabel={endLabel} />
                                <button onClick={onClose} className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 text-white font-black text-base shadow-lg shadow-violet-500/30 active:scale-95 transition-transform flex items-center justify-center gap-2">
                                    <Zap className="w-4 h-4" /> Play Now to Earn Tokens
                                </button>
                            </div>
                        )}

                        {/* ELIGIBLE */}
                        {state === 'eligible' && airdrop && (
                            <div className="space-y-3">
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                                    <p className="text-xs font-bold text-purple-300 uppercase tracking-widest">Entry Requirements</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                                            <span className="text-sm text-white">1,500 game tokens</span>
                                        </div>
                                        <span className="text-xs text-green-400 font-bold">You have {(tokens || 0).toLocaleString()} ✓</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                                            <span className="text-sm text-white">$0.023 USDC</span>
                                        </div>
                                        <span className="text-xs text-purple-300">Paid on Base</span>
                                    </div>
                                </div>

                                <HowItWorks endLabel={endLabel} />

                                <button
                                    onClick={() => { soundManager.play('bubble'); setPurchaseOpen(true); }}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white font-black text-base shadow-lg shadow-violet-500/40 active:scale-95 transition-transform flex items-center justify-center gap-2 border border-violet-400/30"
                                >
                                    <Zap className="w-5 h-5" />
                                    Enter Airdrop · $0.023 USDC
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <p className="text-center text-[10px] text-purple-500">
                                    1,500 tokens deducted from balance · Pool distributed March 9
                                </p>
                            </div>
                        )}

                        {/* ALREADY JOINED */}
                        {state === 'already_joined' && airdrop && (
                            <div className="space-y-3">
                                <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/30 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-black text-sm">You're in this airdrop!</p>
                                        <p className="text-green-300 text-xs mt-0.5">Your entry is confirmed · Payout on March 9</p>
                                    </div>
                                </div>
                                <HowItWorks endLabel={endLabel} />
                                <button onClick={shareOnFarcaster} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a21caf] text-white font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
                                    <PartyPopper className="w-4 h-4" /> Share on Farcaster
                                </button>
                                <p className="text-center text-[10px] text-purple-500">USDC sent directly to your connected wallet after pool closes</p>
                            </div>
                        )}

                        {/* SUCCESS */}
                        {state === 'success' && successData && (
                            <div className="space-y-3">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                    className="bg-gradient-to-br from-green-900/60 to-emerald-900/40 border border-green-400/30 rounded-2xl p-5 text-center"
                                >
                                    <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                                        <Trophy className="w-7 h-7 text-yellow-400" />
                                    </div>
                                    <h3 className="text-white font-black text-xl mb-1">You're in!</h3>
                                    <p className="text-green-300 text-sm mb-4">Welcome to {airdrop?.label}</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-white/5 rounded-xl p-2.5 text-center">
                                            <p className="text-[10px] text-purple-400 uppercase tracking-wide">Pool</p>
                                            <p className="text-white font-black text-sm">${successData.pool.toFixed(2)}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-2.5 text-center">
                                            <p className="text-[10px] text-purple-400 uppercase tracking-wide">Players</p>
                                            <p className="text-white font-black text-sm">{successData.count}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-2.5 text-center">
                                            <p className="text-[10px] text-purple-400 uppercase tracking-wide">Your cut</p>
                                            <p className="text-green-400 font-black text-sm">${successData.payout.toFixed(4)}</p>
                                        </div>
                                    </div>
                                </motion.div>
                                <button onClick={shareOnFarcaster} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a21caf] text-white font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
                                    <PartyPopper className="w-4 h-4" /> Share on Farcaster
                                </button>
                                <button onClick={onClose} className="w-full py-3 rounded-xl text-purple-400 text-sm font-semibold">
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>

            {purchaseOpen && (
                <PurchaseModal
                    isOpen={purchaseOpen}
                    onClose={() => setPurchaseOpen(false)}
                    onConfirm={() => { }}
                    onSuccess={handlePurchaseSuccess}
                    type="confirmation"
                    item={{ id: 'airdrop-entry', name: airdrop?.label ?? 'Airdrop Entry', cost: 0.023, currency: 'USDC' }}
                    currentBalance={usdcBalance ?? 0}
                    tokenBalance={tokens ?? 0}
                    tokenCost={1500}
                />
            )}

        </AnimatePresence>
    );
}
