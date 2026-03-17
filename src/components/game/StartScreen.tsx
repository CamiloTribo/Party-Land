'use client'

import { ArrowRight, Percent, Zap, Megaphone } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { soundManager } from '~/lib/SoundManager';
import { Volume2, VolumeX, Shirt, Coins, DollarSign, Users, Trophy, HelpCircle, User, Sparkles } from 'lucide-react';
import PinkPantherPlayer from '../PinkPantherPlayer';
import { useUserGameData } from '~/hooks/useUserGameData';
import { GameAuthButton } from './GameAuthButton';
import { WelcomeRewardModal } from './WelcomeRewardModal';
import { OfferModal } from './OfferModal';
import { AirdropModal } from './AirdropModal';
import { NewsDrawer } from './NewsDrawer';
import { FCSkinModal } from './FCSkinModal';
import { useMiniApp } from '@neynar/react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StartScreenProps {
  onStart: () => void;
  onSelectGames: () => void;
  onOpenShop: () => void;
  onOpenReferrals: () => void;
  onOpenRankings: () => void;
  onOpenProfile: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetTutorial?: () => void;
}

export default function StartScreen({
  onStart,
  onSelectGames,
  onOpenShop,
  onOpenReferrals,
  onOpenRankings,
  onOpenProfile,
  soundEnabled,
  onToggleSound,
  onResetTutorial
}: StartScreenProps) {
  const { context } = useMiniApp();
  const {
    tokens,
    selectedSkin,
    username,
    displayName,
    pfpUrl,
    fid,
    usdcBalance,
    usdcLoading,
    walletAddress,
    welcomeRewardClaimed,
    claimReward
  } = useUserGameData(context || undefined);

  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [showAirdrop, setShowAirdrop] = useState(false);
  const [showWeek2Tag, setShowWeek2Tag] = useState(true);

  // Show the 'WEEK 2' animated pill for 5 seconds on mount, then hide it
  useEffect(() => {
    const timer = setTimeout(() => setShowWeek2Tag(false), 5000);
    return () => clearTimeout(timer);
  }, []);
  const [showNews, setShowNews] = useState(false);
  const [showFCSkin, setShowFCSkin] = useState(false);
  const [showFCSkinAnnouncement, setShowFCSkinAnnouncement] = useState(false);

  // Check if we should show the welcome reward modal

  // Check if we should show the welcome reward modal
  useEffect(() => {
    if (fid && !welcomeRewardClaimed) {
      const timer = setTimeout(() => setShowRewardModal(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [fid, welcomeRewardClaimed]);

  // Announcement: show FC Skin modal once after welcome is done
  useEffect(() => {
    if (!fid || !welcomeRewardClaimed) return;
    const seen = localStorage.getItem('party_land_fc_skin_announced_v1');
    if (!seen) {
      const t = setTimeout(() => setShowFCSkinAnnouncement(true), 1200);
      return () => clearTimeout(t);
    }
  }, [fid, welcomeRewardClaimed]);

  // Debug logging
  useEffect(() => {
    console.log('🎮 [StartScreen] Farcaster context:', context);
    console.log('👤 [StartScreen] User data:', { username, displayName, fid });
    console.log('💰 [StartScreen] Wallet:', walletAddress);
    console.log('💵 [StartScreen] USDC Balance:', usdcBalance);
  }, [context, username, displayName, fid, walletAddress, usdcBalance]);

  return (
    <div className="fixed inset-0 flex flex-col items-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/wallpaper party land.png")' }}
      />

      {/* Overlay to ensure readability if needed */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Balances Section - Top Left */}
      <div id="tutorial-balances" className="absolute top-3 left-3 flex flex-row items-center gap-2 z-10">
        {/* Tokens Badge */}
        <div className="flex items-center gap-2 bg-[#2a003f]/90 px-4 py-2 rounded-full border-2 border-[#ff69b4]/60 backdrop-blur-sm shadow-xl">
          <div className="shrink-0 w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center">
            <Coins className="w-4 h-4 text-purple-900" />
          </div>
          <span className="font-black text-xl md:text-2xl text-[#ff69b4]">
            {tokens.toLocaleString()}
          </span>
        </div>

        {/* USDC Balance Badge */}
        <div className="flex items-center gap-2 bg-[#2a003f]/90 px-4 py-2 rounded-full border-2 border-blue-400/60 backdrop-blur-sm shadow-xl">
          <div className="shrink-0 w-7 h-7 rounded-full bg-blue-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-xl md:text-2xl text-blue-400">
            {usdcLoading ? '...' : `$${usdcBalance.toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* 📣 News Center Button — left side, below balances */}
      <button
        onClick={() => { soundManager.play('bubble'); setShowNews(true); }}
        className="absolute top-16 left-3 w-12 h-12 z-10 flex items-center justify-center"
        title="News & Updates"
      >
        <span className="relative flex w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-800 items-center justify-center shadow-[0_0_18px_rgba(192,38,211,0.55)] border-2 border-fuchsia-400/50">
          <Megaphone className="w-5 h-5 text-white" strokeWidth={2} />
        </span>
        {/* Unread badge */}
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center shadow-md border border-red-700">
          3
        </span>
      </button>

      {/* 🟣 Farcaster Skin Shortcut Button — same circle style as other buttons */}
      <button
        onClick={() => { soundManager.play('bubble'); setShowFCSkin(true); }}
        className="absolute top-[120px] left-3 w-12 h-12 z-10 flex items-center justify-center"
        title="FC Pink — Farcaster Exclusive Skin"
      >
        <span className="relative flex w-12 h-12 rounded-full bg-[#8465CB] items-center justify-center shadow-[0_0_18px_rgba(132,101,203,0.60)] border-2 border-violet-400/50 overflow-hidden">
          <img src="/logo farcaster.jpeg" alt="Farcaster" className="w-full h-full object-cover" />
        </span>
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-black text-violet-300 text-[7px] font-black px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-md tracking-wide border border-violet-500/40">
          SKIN
        </span>
      </button>

      <button
        onClick={() => {
          onToggleSound();
          if (!soundEnabled) soundManager.play('bubble');
        }}
        className="absolute top-3 right-3 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors shadow-lg z-10"
      >
        {soundEnabled ? (
          <Volume2 className="w-6 h-6 text-white" />
        ) : (
          <VolumeX className="w-6 h-6 text-white" />
        )}
      </button>

      {/* User Profile Hub Button */}
      <button
        onClick={() => {
          soundManager.play('click');
          onOpenProfile();
        }}
        className="absolute top-16 right-3 w-12 h-12 bg-indigo-600/90 hover:bg-indigo-500/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-[0_4px_0_rgb(49,46,129)] active:translate-y-1 active:shadow-none z-10"
        title="User Profile"
      >
        <User className="w-6 h-6 text-yellow-400" />
      </button>

      {/* Launch Offer Button — pulsing below Profile */}
      <button
        onClick={() => { soundManager.play('bubble'); setShowOffer(true); }}
        className="absolute top-[130px] right-2.5 w-14 h-14 z-10 flex items-center justify-center"
        title="Limited Offer"
      >
        {/* Ping animation ring — red urgency */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-30 animate-ping" />
        {/* Button disc — black with yellow icon + red glow */}
        <span className="relative flex w-14 h-14 rounded-full bg-gradient-to-br from-zinc-900 to-black items-center justify-center shadow-[0_0_24px_rgba(220,38,38,0.65)] border-2 border-yellow-400/60">
          <Percent className="w-6 h-6 text-yellow-400" strokeWidth={2.5} />
        </span>
        {/* Black Friday badge — negro + amarillo */}
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-black text-yellow-400 text-[8px] font-black px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-md tracking-wide border border-yellow-500/40">
          OFFER
        </span>
      </button>

      {/* 🪂 Airdrop Button — with animated WEEK 2 tag */}
      <div className="absolute top-[200px] right-2.5 z-10 flex flex-col items-end">
        {/* Animated WEEK 2 pill that expands from the button then hides */}
        <AnimatePresence>
          {showWeek2Tag && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0, originX: 1 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              transition={{ type: 'spring', damping: 18, stiffness: 200 }}
              className="mb-1.5 mr-1 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-red-500/40 whitespace-nowrap tracking-wide border border-red-400/50"
            >
              🪂 WEEK 2 IS LIVE!
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => { soundManager.play('bubble'); setShowAirdrop(true); }}
          className="relative w-14 h-14 flex items-center justify-center"
          title="Weekly Airdrop"
        >
          <span className="absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-30 animate-ping" />
          <span className="relative flex w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 items-center justify-center shadow-[0_0_22px_rgba(139,92,246,0.65)] border-2 border-violet-400/50">
            <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
          </span>
          {/* Red NEW badge */}
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-md tracking-wide border border-red-400/40">
            NEW
          </span>
        </button>
      </div>

      {/* Guide Button - Floating above Referrals */}
      {onResetTutorial && (
        <button
          onClick={() => {
            soundManager.play('bubble');
            onResetTutorial();
          }}
          className="absolute bottom-[90px] right-3 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-[0_4px_0_rgb(49,46,129)] active:translate-y-1 active:shadow-none z-10"
          title="How to Play"
        >
          <HelpCircle className="w-7 h-7 text-white" />
        </button>
      )}

      {/* Referrals Button - Bottom Right */}
      <button
        id="tutorial-referrals"
        onClick={() => {
          soundManager.play('bubble');
          onOpenReferrals();
        }}
        className="absolute bottom-3 right-3 w-14 h-14 bg-pink-600 hover:bg-pink-500 backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-[0_4px_0_rgb(157,23,77)] active:translate-y-1 active:shadow-none z-10 animate-bounce"
        title="Invite Friends"
      >
        <Users className="w-7 h-7 text-white" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-end pb-24 gap-3 px-4 relative z-0 w-full">
        {/* Character - Shifted down to fit better with the wallpaper logo */}
        <div className="flex items-center justify-center w-full mb-6">
          <div className="relative scale-[2.2] drop-shadow-[0_0_15px_rgba(255,105,180,0.5)]">
            <PinkPantherPlayer
              x={0}
              y={0}
              isSlowed={false}
              isMoving={false}
              isFalling={false}
              direction="right"
              skin={selectedSkin}
            />
          </div>
        </div>

        <p className="text-white text-lg font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center italic">
          READY FOR THE PARTY?
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs mt-2 relative z-20">
          <Button
            id="tutorial-play"
            onClick={() => {
              soundManager.play('start');
              onSelectGames();
            }}
            size="lg"
            className="text-2xl font-black px-8 py-7 bg-yellow-400 hover:bg-yellow-300 text-purple-900 rounded-2xl shadow-[0_8px_0_rgb(161,98,7)] active:translate-y-1 active:shadow-none transition-all"
          >
            PLAY NOW
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              id="tutorial-rankings"
              onClick={() => {
                soundManager.play('click');
                onOpenRankings();
              }}
              size="lg"
              className="text-lg font-black py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-[0_6px_0_rgb(49,46,129)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-5 h-5 text-yellow-400" />
              RANKINGS
            </Button>
            <Button
              id="tutorial-inventory"
              onClick={() => {
                soundManager.play('click');
                onOpenShop();
              }}
              size="lg"
              className="text-lg font-black py-4 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl shadow-[0_6px_0_rgb(157,23,77)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Shirt className="w-5 h-5" />
              INVENTORY
            </Button>
          </div>

          {/* Auth / Profile Section */}
          <div className="w-full flex justify-center mt-4">
            <GameAuthButton
              username={username}
              displayName={displayName}
              pfpUrl={pfpUrl}
              fid={fid}
            />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-1 px-6 z-10">
        <p className="text-white/90 text-[10px] font-bold uppercase tracking-widest drop-shadow-md">
          Multiple games • One progression • Pure Fun
        </p>
      </div>

      {/* Welcome Reward Modal */}
      <WelcomeRewardModal
        isOpen={showRewardModal}
        onClaim={async () => {
          await claimReward();
          // Don't close here — modal switches to success/share screen itself
        }}
        onClose={() => setShowRewardModal(false)}
      />

      {/* Launch Offer Modal */}
      <OfferModal
        isOpen={showOffer}
        onClose={() => setShowOffer(false)}
      />

      {/* Airdrop Modal */}
      <AirdropModal
        isOpen={showAirdrop}
        onClose={() => setShowAirdrop(false)}
      />

      {/* News Center Drawer */}
      <NewsDrawer
        isOpen={showNews}
        onClose={() => setShowNews(false)}
        onOpenFCSkin={() => setShowFCSkin(true)}
        onOpenAirdrop={() => setShowAirdrop(true)}
        onOpenOffer={() => setShowOffer(true)}
      />

      {/* FC Pink Skin Modal */}
      <FCSkinModal
        isOpen={showFCSkin}
        onClose={() => setShowFCSkin(false)}
      />

      {/* FC Skin Announcement — shows once via localStorage */}
      {showFCSkinAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => {
            localStorage.setItem('party_land_fc_skin_announced_v1', '1');
            setShowFCSkinAnnouncement(false);
          }} />
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#1a0540] to-[#0d001a] rounded-t-[32px] px-5 pt-6 pb-8 shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/20" />
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-violet-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> NEW SKIN
              </span>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-20 shrink-0">
                <div className="absolute inset-0 bg-violet-500/20 rounded-2xl blur-lg" />
                <PinkPantherPlayer x={8} y={0} isSlowed={false} isMoving={false} isFalling={false} direction="right" skin="farcaster" />
              </div>
              <div>
                <h3 className="text-white font-black text-xl leading-tight">FC Pink is here!</h3>
                <p className="text-violet-300 text-sm mt-1">The exclusive Farcaster skin. Purple hood, ∞ symbol, pulsing glow.</p>
                <p className="text-white font-black text-base mt-2">$0.23 USDC · Forever</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.setItem('party_land_fc_skin_announced_v1', '1');
                setShowFCSkinAnnouncement(false);
                setShowFCSkin(true);
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Sparkles className="w-4 h-4" /> Get FC Pink Now
            </button>
            <button
              onClick={() => {
                localStorage.setItem('party_land_fc_skin_announced_v1', '1');
                setShowFCSkinAnnouncement(false);
              }}
              className="w-full py-2.5 mt-2 text-purple-500 text-sm font-semibold"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
