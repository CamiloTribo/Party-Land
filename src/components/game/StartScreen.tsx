'use client'

import { ArrowRight } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { soundManager } from '~/lib/SoundManager';
import { Volume2, VolumeX, ShoppingBag, Coins, DollarSign, Bell } from 'lucide-react';
import PinkPantherPlayer from '../PinkPantherPlayer';
import { useUserGameData } from '~/hooks/useUserGameData';
import { GameAuthButton } from './GameAuthButton';
import { useMiniApp } from '@neynar/react';
import { useEffect } from 'react';

interface StartScreenProps {
  onStart: () => void;
  onSelectGames: () => void; // Nueva prop para ir a selección de juegos
  onOpenShop: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export default function StartScreen({ onStart, onSelectGames, onOpenShop, soundEnabled, onToggleSound }: StartScreenProps) {
  const { context } = useMiniApp();
  const { tokens, selectedSkin, username, displayName, pfpUrl, fid, usdcBalance, usdcLoading, walletAddress } = useUserGameData(context || undefined);

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

      {/* Tokens Badge - Top Left */}
      <div className="absolute top-3 left-3 flex items-center gap-2 bg-[#2a003f]/90 px-4 py-2 rounded-full border-2 border-[#ff69b4]/60 z-10 backdrop-blur-sm shadow-xl">
        <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center">
          <Coins className="w-4 h-4 text-purple-900" />
        </div>
        <span className="font-black text-2xl text-[#ff69b4] min-w-[50px]">{tokens}</span>
      </div>

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

      <button
        onClick={async () => {
          console.log('🔔 [StartScreen] Requesting notification via addFrame (v0.2.2)');
          soundManager.play('click');
          try {
            const sdk = (await import('@farcaster/miniapp-sdk')).sdk;
            const result = await sdk.actions.addFrame();
            console.log('🔔 [StartScreen] Notification result:', result);
          } catch (err) {
            console.error('🔔 [StartScreen] Notification error:', err);
          }
        }}
        className="absolute top-16 right-3 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors shadow-lg z-10"
      >
        <Bell className="w-6 h-6 text-white" />
      </button>

      {/* USDC Balance Badge - Top Center */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#2a003f]/90 px-4 py-2 rounded-full border-2 border-blue-400/60 z-10 backdrop-blur-sm shadow-xl">
        <div className="w-7 h-7 rounded-full bg-blue-400 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-white" />
        </div>
        <span className="font-black text-2xl text-blue-400 min-w-[50px]">
          {usdcLoading ? '...' : usdcBalance.toFixed(2)}
        </span>
      </div>

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
            onClick={() => {
              soundManager.play('start');
              onSelectGames();
            }}
            size="lg"
            className="text-2xl font-black px-8 py-7 bg-yellow-400 hover:bg-yellow-300 text-purple-900 rounded-2xl shadow-[0_8px_0_rgb(161,98,7)] active:translate-y-1 active:shadow-none transition-all"
          >
            PLAY NOW
          </Button>
          <Button
            onClick={() => {
              console.log('🔊 [StartScreen] Shop clicked. Sound enabled:', soundEnabled);
              soundManager.play('click');
              onOpenShop();
            }}
            size="lg"
            className="text-xl font-black px-8 py-4 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl shadow-[0_6px_0_rgb(157,23,77)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-6 h-6" />
            SHOP
          </Button>

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
      <div className="absolute bottom-4 text-center text-white/90 text-[10px] px-6 font-bold uppercase tracking-widest drop-shadow-md">
        <p>Multiple games • One progression • Pure Fun</p>
      </div>
    </div>
  )
}
