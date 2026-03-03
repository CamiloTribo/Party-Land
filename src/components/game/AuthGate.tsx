'use client';

import { useEffect, useState } from 'react';
import { useMiniApp } from '@neynar/react';
import { useUserGameData } from '~/hooks/useUserGameData';
import { Loader2, Lock, ExternalLink } from 'lucide-react';

/**
 * AuthGate — Protects the entire game behind Farcaster authentication.
 *
 * Mirrors the "protected layout" pattern used in other apps:
 *   app page (public) → welcome/sign-in (public) → protected area (requires auth)
 *
 * In this case the "sign-in" is implicit: opening Party Land inside Warpcast
 * automatically provides a Farcaster context with the user's FID.
 * If there is NO context (browser access, web scraper, etc.) → access is denied.
 *
 * Flow:
 *  1. SDK loading          → show spinner
 *  2. SDK loaded, no FID   → show lock screen (open in Warpcast)
 *  3. FID present, syncing → show spinner (connecting to database)
 *  4. Fully authenticated  → render children (the game)
 */
interface AuthGateProps {
    children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
    const { isSDKLoaded, context } = useMiniApp();
    const { fid, isSyncing } = useUserGameData();

    const [graceExpired, setGraceExpired] = useState(false);
    const [sdkForceReady, setSdkForceReady] = useState(false);

    // 1. Grace period (3s) — avoids flashing lock screen on valid Farcaster opens
    useEffect(() => {
        const timer = setTimeout(() => setGraceExpired(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    // 2. Hard timeout (6s) — if SDK never loads (Farcaster web / base.dev), proceed anyway
    useEffect(() => {
        const timer = setTimeout(() => setSdkForceReady(true), 6000);
        return () => clearTimeout(timer);
    }, []);

    // 3. Call sdk.actions.ready() IMMEDIATELY on mount using the real Farcaster SDK.
    //    This MUST happen before auth checks — it signals base.dev and Farcaster
    //    that the app is alive even while we're still deciding what to show.
    useEffect(() => {
        (async () => {
            try {
                const { sdk } = await import('@farcaster/miniapp-sdk');
                await sdk.actions.ready();
                console.log('🟢 [AuthGate] sdk.actions.ready() called');
            } catch (e) {
                console.warn('[AuthGate] sdk.actions.ready() failed:', e);
            }
        })();
    }, []);

    // ── PHASE 1: SDK still initialising ──────────────────────────────────────
    const sdkReady = isSDKLoaded || sdkForceReady;
    if (!sdkReady || (!graceExpired && !context?.user?.fid)) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#1a002e] via-[#2d0052] to-[#1a002e]">
                <div className="flex flex-col items-center gap-6">
                    {/* Logo / brand mark */}
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-[0_0_40px_rgba(236,72,153,0.6)] animate-pulse p-2">
                            <img
                                src="/logo sin fondo party land.png"
                                alt="Party Land Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="absolute -inset-2 rounded-full border-2 border-pink-400/30 animate-ping" />
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <h1 className="text-2xl font-black text-white tracking-wide">Party Land</h1>
                        <div className="flex items-center gap-2 text-pink-300">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-semibold">Loading…</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── PHASE 2: SDK loaded but no Farcaster context — LOCK SCREEN ───────────
    const hasFarcasterContext = !!(context?.user?.fid || fid);

    if (!hasFarcasterContext) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#1a002e] via-[#2d0052] to-[#1a002e] px-6">
                {/* Animated background particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full bg-pink-500/10 animate-pulse"
                            style={{
                                width: `${40 + i * 20}px`,
                                height: `${40 + i * 20}px`,
                                left: `${10 + i * 11}%`,
                                top: `${5 + (i % 4) * 22}%`,
                                animationDelay: `${i * 0.4}s`,
                                animationDuration: `${2 + i * 0.3}s`,
                            }}
                        />
                    ))}
                </div>

                <div className="relative flex flex-col items-center gap-8 max-w-sm w-full">
                    {/* Lock icon */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-600 to-purple-700 flex items-center justify-center shadow-[0_0_60px_rgba(236,72,153,0.5)] border-2 border-pink-400/40">
                            <Lock className="w-11 h-11 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="absolute -inset-1 rounded-3xl border border-pink-400/20 animate-pulse" />
                    </div>

                    {/* Title */}
                    <div className="flex flex-col items-center gap-3 text-center">
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            Party Land
                        </h1>
                        <div className="w-16 h-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
                        <p className="text-lg font-bold text-pink-300">
                            Sign In Required
                        </p>
                        <p className="text-white/60 text-sm leading-relaxed max-w-[260px]">
                            Party Land is a Farcaster Mini App. Open it inside{' '}
                            <span className="text-pink-300 font-bold">Warpcast</span>{' '}
                            to authenticate automatically and start playing.
                        </p>
                    </div>

                    {/* Action card */}
                    <div className="w-full bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10 shadow-2xl flex flex-col gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-base">1️⃣</span>
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">Open Warpcast</p>
                                <p className="text-white/50 text-xs">Download it or open the app on your device</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-pink-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-base">2️⃣</span>
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">Find Party Land</p>
                                <p className="text-white/50 text-xs">Search for "Party Land" in Mini Apps</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-yellow-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-base">3️⃣</span>
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">Play & Earn Tokens</p>
                                <p className="text-white/50 text-xs">Your progress, tokens and skins are saved</p>
                            </div>
                        </div>
                    </div>

                    {/* CTA button */}
                    <a
                        href="https://warpcast.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-base py-4 rounded-2xl shadow-[0_6px_0_rgba(157,23,77,0.8)] active:translate-y-1 active:shadow-none transition-all border border-pink-400/30"
                    >
                        <ExternalLink className="w-5 h-5" />
                        Open in Warpcast
                    </a>

                    <p className="text-white/30 text-xs text-center">
                        Party Land © 2026 · Farcaster Mini App
                    </p>
                </div>
            </div>
        );
    }

    // ── PHASE 3: Authenticated but DB syncing ────────────────────────────────
    if (isSyncing) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#1a002e] via-[#2d0052] to-[#1a002e]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-[0_0_40px_rgba(236,72,153,0.6)] p-2">
                            <img
                                src="/logo sin fondo party land.png"
                                alt="Party Land Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        {/* Spinning ring around logo */}
                        <div className="absolute -inset-2">
                            <div className="w-full h-full rounded-full border-2 border-transparent border-t-pink-400 border-r-purple-400 animate-spin" />
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <h1 className="text-2xl font-black text-white tracking-wide">Party Land</h1>
                        <p className="text-pink-300 text-sm font-semibold">Connecting your account…</p>
                        {fid && (
                            <p className="text-white/40 text-xs">FID: {fid}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ── PHASE 4: Fully authenticated → render the game ───────────────────────
    return <>{children}</>;
}
