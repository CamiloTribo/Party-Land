'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone, ChevronRight, Zap, Percent, Sparkles } from 'lucide-react';
import PinkPantherPlayer from '../PinkPantherPlayer';

interface NewsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenFCSkin: () => void;
    onOpenAirdrop: () => void;
    onOpenOffer: () => void;
}

interface NewsCard {
    id: string;
    badge: string;
    badgeColor: string;
    badgeBg: string;
    icon: React.ReactNode;
    title: string;
    body: string;
    date: string;
    cta: string;
    action: () => void;
    highlight?: string;
}

export function NewsDrawer({ isOpen, onClose, onOpenFCSkin, onOpenAirdrop, onOpenOffer }: NewsDrawerProps) {
    const news: NewsCard[] = [
        {
            id: 'airdrop-w2',
            badge: 'LIVE NOW',
            badgeColor: 'text-green-200',
            badgeBg: 'bg-green-600',
            icon: <Zap className="w-4 h-4 text-green-300" />,
            title: '🪂 Airdrop Week 2 — Claim Your Rewards!',
            body: 'Week 2 is open. Join with 1,500 tokens + $0.023 USDC. Pool grows with every entry — the earlier you join, the bigger your share.',
            highlight: 'Seed: $2.30 USDC · Closes Mar 24',
            date: 'Mar 17, 2026',
            cta: 'Enter Week 2',
            action: () => { onClose(); onOpenAirdrop(); },
        },
        {
            id: 'airdrop-w1-results',
            badge: '+1,065% ROI',
            badgeColor: 'text-yellow-200',
            badgeBg: 'bg-gradient-to-r from-yellow-600 to-orange-600',
            icon: <Sparkles className="w-4 h-4 text-yellow-300" />,
            title: '🏆 Week 1 Results — $0.023 → $0.268 USDC',
            body: 'Week 1 participants turned $0.023 into $0.268 USDC — an 11.6× return in 7 days. If you were in, your claim is ready on-chain. Tap to collect!',
            highlight: '41 participants · $10.99 pool · 11.6× return',
            date: 'Mar 17, 2026',
            cta: 'Claim Week 1 reward',
            action: () => { onClose(); onOpenAirdrop(); },
        },
        {
            id: 'fc-skin',
            badge: 'NEW',
            badgeColor: 'text-violet-200',
            badgeBg: 'bg-violet-600',
            icon: <Sparkles className="w-4 h-4 text-violet-300" />,
            title: 'FC Pink — Exclusive Farcaster Skin',
            body: 'The must-have skin for Farcaster maxis. Purple hood, infinity chest symbol, pulsing glow. One price, forever yours.',
            highlight: '$0.23 USDC · Permanent',
            date: 'Mar 2, 2026',
            cta: 'Get it now',
            action: () => { onClose(); onOpenFCSkin(); },
        },
        {
            id: 'joker-offer',
            badge: 'OFFER',
            badgeColor: 'text-yellow-200',
            badgeBg: 'bg-black border border-yellow-500/40',
            icon: <Percent className="w-4 h-4 text-yellow-400" />,
            title: 'Pink Joker Skin — Launch Price',
            body: 'Get the Pink Joker at the exclusive launch price before the offer expires. Normally $2.30 USDC.',
            highlight: '$0.023 USDC · Limited time',
            date: 'Feb 27, 2026',
            cta: 'See Offer',
            action: () => { onClose(); onOpenOffer(); },
        },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-end justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Sheet */}
                    <motion.div
                        className="relative w-full max-w-md bg-gradient-to-b from-[#13002b] to-[#0a001a] rounded-t-[32px] overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    >
                        {/* Top glow */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent" />

                        {/* Header */}
                        <div className="px-5 pt-5 pb-4 shrink-0">
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/20" />
                            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                                <X className="w-4 h-4 text-white" />
                            </button>
                            <div className="flex items-center gap-2.5 mt-2">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-700 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
                                    <Megaphone className="w-4 h-4 text-white" strokeWidth={2} />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-white leading-none">News & Updates</h2>
                                    <p className="text-[11px] text-purple-400 font-medium mt-0.5">Party Land · {news.length} updates</p>
                                </div>
                            </div>
                        </div>

                        {/* News cards */}
                        <div className="overflow-y-auto flex-1 px-4 pb-6 space-y-3">
                            {news.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.07 }}
                                    className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                                >
                                    {/* Card header row */}
                                    <div className="flex items-start gap-3 p-4 pb-3">
                                        {/* FC Skin preview thumbnail */}
                                        {item.id === 'fc-skin' && (
                                            <div className="w-12 h-12 shrink-0 rounded-xl bg-[#8465CB]/20 border border-[#8465CB]/30 flex items-center justify-center overflow-hidden">
                                                <div className="scale-[0.8] translate-y-1">
                                                    <PinkPantherPlayer
                                                        x={20} y={0}
                                                        isSlowed={false} isMoving={false}
                                                        isFalling={false} direction="right"
                                                        skin="farcaster"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            {/* Badge + date */}
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${item.badgeBg} ${item.badgeColor}`}>
                                                    {item.badge}
                                                </span>
                                                <span className="text-[10px] text-purple-500">{item.date}</span>
                                            </div>

                                            {/* Title */}
                                            <p className="text-sm font-black text-white leading-tight">{item.title}</p>

                                            {/* Body */}
                                            <p className="text-xs text-purple-300 mt-1.5 leading-relaxed">{item.body}</p>

                                            {/* Highlight pill */}
                                            {item.highlight && (
                                                <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-white bg-white/10 px-2.5 py-1 rounded-full">
                                                    {item.icon}
                                                    {item.highlight}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <button
                                        onClick={item.action}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border-t border-white/10 transition-colors"
                                    >
                                        <span className="text-xs font-bold text-purple-200">{item.cta}</span>
                                        <ChevronRight className="w-4 h-4 text-purple-400" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
