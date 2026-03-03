'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, User, Check, Smartphone, Volume2, VolumeX, Medal, ExternalLink, RefreshCw, Share2, X, ShieldCheck } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { soundManager } from '~/lib/SoundManager';
import { useUserGameData } from '~/hooks/useUserGameData';
import { claimMissionAction, getMissionStatusAction } from '~/app/actions/userActions';
import { shareToFarcaster } from '~/lib/utils';
import { fireConfetti } from '~/lib/confetti';
import { FARCASTER_MINIAPP_URL } from '~/lib/constants';

interface UserProfileHubProps {
    onBack: () => void;
    soundEnabled: boolean;
    onToggleSound: () => void;
}

const MISSION_CONFIG = {
    farcaster: {
        label: 'Farcaster',
        link: 'https://farcaster.xyz/miniapps/1bhqOrw3ONX6/party-land',
        instruction: 'If you already installed Party Land on Farcaster and enabled notifications, you\'re good to go. If not, open the app first.',
        shareText: '🎉 Just verified my account on Farcaster in Party Land and earned 2,300 tokens! 🎮',
    },
    base: {
        label: 'Base App',
        link: 'https://base.app/app/party-land.vercel.app',
        instruction: 'If you already installed Party Land on Base App and enabled notifications, you\'re good to go. If not, open the app first.',
        shareText: '🎉 Just verified my account on Base App in Party Land and earned 2,300 tokens! 🎮',
    },
};

export default function UserProfileHub({ onBack, soundEnabled, onToggleSound }: UserProfileHubProps) {
    const { tokens, username, displayName, pfpUrl, fid, forceRefresh, selectedSkin } = useUserGameData();

    const [farcasterVerified, setFarcasterVerified] = useState(false);
    const [baseAppVerified, setBaseAppVerified] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);

    // Retry flags (shown when NOT_VERIFIED)
    const [farcasterFailed, setFarcasterFailed] = useState(false);
    const [baseAppFailed, setBaseAppFailed] = useState(false);

    // Confirmation modal: which mission is pending user confirmation
    const [pendingVerify, setPendingVerify] = useState<'farcaster' | 'base' | null>(null);

    // Success modal after claiming
    const [successModal, setSuccessModal] = useState<'farcaster' | 'base' | null>(null);

    useEffect(() => {
        if (fid) {
            getMissionStatusAction(fid).then((res) => {
                if (res.success) {
                    setFarcasterVerified(res.farcasterClaimed);
                    setBaseAppVerified(res.baseClaimed);
                }
            });
        }
    }, [fid]);

    // Step 1: User clicks VERIFY → open confirmation modal (no backend call yet)
    const openConfirm = (type: 'farcaster' | 'base') => {
        soundManager.play('bubble');
        if (type === 'farcaster') setFarcasterFailed(false);
        else setBaseAppFailed(false);
        setPendingVerify(type);
    };

    // Step 2: User confirms inside modal → call backend
    const handleConfirmVerify = async () => {
        if (!pendingVerify || !fid || isClaiming) return;
        const type = pendingVerify;
        soundManager.play('click');
        setIsClaiming(true);

        const res = await claimMissionAction(fid, type);

        if (res.success) {
            // ✅ Success: refresh balance from DB (claimMissionAction already updated it), show modal
            await forceRefresh();
            if (type === 'farcaster') setFarcasterVerified(true);
            else setBaseAppVerified(true);
            fireConfetti();
            soundManager.play('purchase');
            setPendingVerify(null);
            setSuccessModal(type);
        } else if (res.error === 'NOT_VERIFIED') {
            // ❌ App not added yet → show retry + open app link
            if (type === 'farcaster') setFarcasterFailed(true);
            else setBaseAppFailed(true);
            setPendingVerify(null);
        } else if (res.error === 'ALREADY_CLAIMED') {
            // Already done, just update UI
            if (type === 'farcaster') setFarcasterVerified(true);
            else setBaseAppVerified(true);
            setPendingVerify(null);
        } else {
            setPendingVerify(null);
        }
        setIsClaiming(false);
    };

    return (
        <div className="fixed inset-0 bg-[#2a003f] flex flex-col z-50 overflow-hidden">

            {/* Top Header */}
            <div className="flex items-center justify-between p-4 sticky top-0 bg-[#2a003f]/90 backdrop-blur-md z-10 border-b border-white/10 shadow-lg">
                <button
                    onClick={() => {
                        soundManager.play('bubble');
                        onBack();
                    }}
                    className="flex items-center text-white/90 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-1" />
                    <span className="font-bold text-sm">Back</span>
                </button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400/20 border-2 border-yellow-400 rounded-full">
                    <User className="w-4 h-4 text-yellow-400" />
                    <span className="font-black text-yellow-400 text-sm tracking-wider uppercase">PROFILE</span>
                </div>
                <button
                    onClick={() => {
                        onToggleSound();
                        if (!soundEnabled) soundManager.play('bubble');
                    }}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                >
                    {soundEnabled ? (
                        <Volume2 className="w-5 h-5 text-white" />
                    ) : (
                        <VolumeX className="w-5 h-5 text-white/50" />
                    )}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col items-center gap-6">

                {/* User Card */}
                <div className="w-full max-w-sm bg-purple-900/40 backdrop-blur-md rounded-3xl p-6 border-2 border-pink-500/50 shadow-xl flex flex-col items-center gap-4 relative">
                    <div className="relative">
                        {pfpUrl ? (
                            <img src={pfpUrl} alt={username} className="w-24 h-24 rounded-full border-4 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] object-cover" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-pink-600 border-4 border-yellow-400 flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                                <User className="w-10 h-10 text-white" />
                            </div>
                        )}
                        {/* Authenticated Verification Badge */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 border-2 border-[#2a003f] rounded-full px-2 py-0.5 flex items-center gap-1 shadow-md whitespace-nowrap">
                            <Check className="w-3 h-3 text-white font-bold" />
                            <span className="text-white text-[10px] font-black tracking-widest uppercase">Verified</span>
                        </div>
                    </div>

                    <div className="text-center mt-2">
                        <h2 className="text-white font-black text-2xl tracking-wide">{displayName || username || 'Party Player'}</h2>
                        <p className="text-white/60 text-sm font-semibold">@{username}</p>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-black/30 rounded-2xl p-3 flex flex-col items-center justify-center shadow-inner border border-white/5">
                            <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Current Balance</span>
                            <span className="text-yellow-400 font-black text-xl">{tokens.toLocaleString()}</span>
                        </div>
                        <div className="bg-black/30 rounded-2xl p-3 flex flex-col items-center justify-center shadow-inner border border-white/5 relative overflow-hidden">
                            <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Active Skin</span>
                            <span className="text-pink-400 font-black text-sm uppercase truncate w-full text-center px-1">{selectedSkin?.replace('-', ' ') || 'None'}</span>
                        </div>
                    </div>
                </div>

                {/* Social Missions */}
                <div className="w-full max-w-sm flex flex-col gap-3">
                    <div className="flex items-center gap-2 px-2 pb-1 border-b border-white/10 mb-2">
                        <Medal className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-white text-sm font-black tracking-widest uppercase">Social Missions</h3>
                    </div>

                    {/* Mission: Farcaster */}
                    <div className="bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-white/10 shadow-lg flex items-center justify-between gap-3 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shrink-0 border border-white/20">
                                <Smartphone className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-sm leading-tight mb-1">Install the app on Farcaster</span>
                                <span className="text-pink-400 font-black text-xs uppercase tracking-wider">+ 2,300 Tokens</span>
                            </div>
                        </div>
                        {!farcasterVerified ? (
                            <div className="flex flex-col gap-2 items-end">
                                <Button
                                    size="sm"
                                    onClick={() => openConfirm('farcaster')}
                                    disabled={isClaiming}
                                    className={`${farcasterFailed ? 'bg-orange-500 hover:bg-orange-400' : 'bg-yellow-400 hover:bg-yellow-300'} text-purple-900 font-black px-4 shadow-[0_4px_0_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-none transition-all rounded-xl disabled:opacity-50 flex items-center gap-1`}
                                >
                                    {farcasterFailed ? <><RefreshCw className="w-3 h-3" /> RETRY</> : 'VERIFY'}
                                </Button>
                                {farcasterFailed && (
                                    <a href={MISSION_CONFIG.farcaster.link} target="_blank" rel="noreferrer" onClick={() => soundManager.play('bubble')}>
                                        <div className="bg-purple-600/50 hover:bg-purple-500 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors border border-purple-400/30">
                                            <ExternalLink className="w-3 h-3" /> Open App
                                        </div>
                                    </a>
                                )}
                            </div>
                        ) : (
                            <div className="bg-green-500/20 text-green-400 font-black text-xs uppercase px-4 py-2 mt-1 rounded-xl flex items-center justify-center gap-1 shadow-inner border border-green-500/30">
                                <Check className="w-3 h-3" /> VERIFIED
                            </div>
                        )}
                    </div>

                    {/* Mission: Base App */}
                    <div className="bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-white/10 shadow-lg flex items-center justify-between gap-3 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 border border-white/20">
                                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                                    <div className="w-3 h-3 bg-blue-600 rounded-full" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-sm leading-tight mb-1">Install the app on Base</span>
                                <span className="text-pink-400 font-black text-xs uppercase tracking-wider">+ 2,300 Tokens</span>
                            </div>
                        </div>
                        {!baseAppVerified ? (
                            <div className="flex flex-col gap-2 items-end">
                                <Button
                                    size="sm"
                                    onClick={() => openConfirm('base')}
                                    disabled={isClaiming}
                                    className={`${baseAppFailed ? 'bg-orange-500 hover:bg-orange-400' : 'bg-yellow-400 hover:bg-yellow-300'} text-purple-900 font-black px-4 shadow-[0_4px_0_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-none transition-all rounded-xl disabled:opacity-50 flex items-center gap-1`}
                                >
                                    {baseAppFailed ? <><RefreshCw className="w-3 h-3" /> RETRY</> : 'VERIFY'}
                                </Button>
                                {baseAppFailed && (
                                    <a href={MISSION_CONFIG.base.link} target="_blank" rel="noreferrer" onClick={() => soundManager.play('bubble')}>
                                        <div className="bg-blue-600/50 hover:bg-blue-500 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors border border-blue-400/30">
                                            <ExternalLink className="w-3 h-3" /> Open App
                                        </div>
                                    </a>
                                )}
                            </div>
                        ) : (
                            <div className="bg-green-500/20 text-green-400 font-black text-xs uppercase px-4 py-2 mt-1 rounded-xl flex items-center justify-center gap-1 shadow-inner border border-green-500/30">
                                <Check className="w-3 h-3" /> VERIFIED
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* ────── CONFIRMATION MODAL ────── */}
            {pendingVerify && (
                <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isClaiming && setPendingVerify(null)} />
                    <div className="relative w-full max-w-sm bg-gradient-to-b from-[#3a0060] to-[#1a0035] border-2 border-yellow-400/40 rounded-[28px] p-7 shadow-2xl z-10 animate-in slide-in-from-bottom-4 duration-300">
                        {/* Close */}
                        {!isClaiming && (
                            <button
                                onClick={() => setPendingVerify(null)}
                                className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all"
                            >
                                <X size={16} />
                            </button>
                        )}

                        {/* Icon */}
                        <div className="flex justify-center mb-5">
                            <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border-2 border-yellow-400/40 flex items-center justify-center">
                                <ShieldCheck className="w-8 h-8 text-yellow-400" />
                            </div>
                        </div>

                        {/* Text */}
                        <h2 className="text-white font-black text-xl text-center mb-2">Ready to verify?</h2>
                        <p className="text-white/60 text-sm text-center mb-5 leading-relaxed">
                            {MISSION_CONFIG[pendingVerify].instruction}
                        </p>

                        {/* Open App link */}
                        <a
                            href={MISSION_CONFIG[pendingVerify].link}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => soundManager.play('bubble')}
                            className="flex items-center justify-center gap-2 w-full mb-4 py-2.5 px-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-sm font-bold"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open {MISSION_CONFIG[pendingVerify].label}
                        </a>

                        {/* Confirm button */}
                        <Button
                            onClick={handleConfirmVerify}
                            disabled={isClaiming}
                            className="w-full bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-black py-4 rounded-2xl shadow-[0_4px_0_rgb(161,98,7)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isClaiming ? (
                                <span className="flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 animate-spin" /> Verifying...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Check className="w-4 h-4" /> Confirm Verification
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* ────── SUCCESS MODAL ────── */}
            {successModal && (
                <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div className="relative w-full max-w-sm bg-gradient-to-b from-[#3a0060] to-[#1a0035] border-2 border-green-400/50 rounded-[28px] p-8 shadow-2xl z-10 animate-in slide-in-from-bottom-4 duration-300">
                        {/* Close */}
                        <button
                            onClick={() => { soundManager.play('bubble'); setSuccessModal(null); }}
                            className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all"
                        >
                            <X size={16} />
                        </button>

                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-400 blur-2xl opacity-20 rounded-full scale-150" />
                                <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-green-400/30 animate-bounce">
                                    <Check className="w-12 h-12 text-white" strokeWidth={3} />
                                </div>
                            </div>
                        </div>

                        {/* Text */}
                        <div className="text-center space-y-2 mb-6">
                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-400/20 rounded-full border border-green-400/30 mb-2">
                                <Check className="w-3 h-3 text-green-400 fill-green-400" />
                                <span className="text-green-300 text-[10px] font-black uppercase tracking-widest">Mission Complete!</span>
                            </div>
                            <h2 className="text-3xl font-black text-white leading-tight">
                                <span className="text-yellow-400">+2.300</span> Tokens
                            </h2>
                            <p className="text-white/50 text-sm">
                                Verified on <span className="text-white font-bold">{MISSION_CONFIG[successModal].label}</span>! 🎉
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="space-y-3">
                            <Button
                                onClick={() => {
                                    soundManager.play('click');
                                    shareToFarcaster(`${MISSION_CONFIG[successModal].shareText} ${FARCASTER_MINIAPP_URL}`);
                                }}
                                className="w-full bg-pink-600 hover:bg-pink-500 text-white font-black py-4 rounded-2xl shadow-[0_4px_0_rgb(157,23,77)] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 transition-all"
                            >
                                <Share2 size={18} />
                                SHARE ON FARCASTER
                            </Button>
                            <Button
                                onClick={() => { soundManager.play('click'); setSuccessModal(null); }}
                                variant="outline"
                                className="w-full bg-white/5 hover:bg-white/10 text-white border-white/20 rounded-2xl"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
