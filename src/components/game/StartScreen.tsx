'use client'

import { Button } from '~/components/ui/Button';
import { Volume2, VolumeX, ShoppingBag, Coins, DollarSign } from 'lucide-react';
import PinkPantherPlayer from '../PinkPantherPlayer';
import { useUserGameData } from '~/hooks/useUserGameData';
import { GameAuthButton } from './GameAuthButton';
import { useMiniApp } from '@neynar/react';
import { useEffect } from 'react';

interface StartScreenProps {
  onStart: () => void;
  onOpenShop: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export default function StartScreen({ onStart, onOpenShop, soundEnabled, onToggleSound }: StartScreenProps) {
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
    <div className="fixed inset-0 flex flex-col items-center bg-gradient-to-b from-pink-600 via-pink-500 to-pink-600 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,50,150,0.3),transparent)]" />
      
      {/* Tokens Badge - Top Left */}
      <div className="absolute top-3 left-3 flex items-center gap-2 bg-[#2a003f]/90 px-4 py-2 rounded-full border-2 border-[#ff69b4]/60 z-10 backdrop-blur-sm shadow-xl">
        <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center">
          <Coins className="w-4 h-4 text-purple-900" />
        </div>
        <span className="font-black text-2xl text-[#ff69b4] min-w-[50px]">{tokens}</span>
      </div>
      
      {/* Sound Toggle - Top Right */}
      <button
        onClick={onToggleSound}
        className="absolute top-3 right-3 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors shadow-lg z-10"
      >
        {soundEnabled ? (
          <Volume2 className="w-6 h-6 text-white" />
        ) : (
          <VolumeX className="w-6 h-6 text-white" />
        )}
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
      
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 py-16 relative z-0 w-full">
        {/* Character above the title */}
        <div className="flex items-center justify-center w-full mb-4">
          <div className="relative scale-[2.5]">
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
        {/* Title below the character */}
        <div className="flex flex-col items-center gap-1 mb-1">
          <h1 className="text-5xl font-black text-yellow-300 leading-tight text-center drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)]" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.3)' }}>
            100 FLOOR
          </h1>
          <h1 className="text-5xl font-black text-yellow-300 text-center drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)]" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.3)' }}>
            DROP
          </h1>
        </div>
        <p className="text-white text-base font-semibold drop-shadow-md text-center">
          Dodge obstacles and reach floor 0!
        </p>
        <div className="w-48 h-4 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-lg shadow-xl border-2 border-yellow-700" />
        <div className="flex flex-col gap-3 w-full max-w-xs mt-4 relative z-20">
          <Button
            onClick={onStart}
            size="lg"
            className="text-2xl font-black px-8 py-6 bg-yellow-400 hover:bg-yellow-300 text-purple-900 rounded-2xl shadow-xl"
          >
            PLAY
          </Button>
          <Button
            onClick={onOpenShop}
            size="lg"
            className="text-lg font-black px-8 py-4 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl shadow-xl flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            SHOP
          </Button>

          {/* Auth / Profile Section */}
          <div className="w-full flex justify-center mt-2">
            <GameAuthButton
              username={username}
              displayName={displayName}
              pfpUrl={pfpUrl}
              fid={fid}
            />
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-4 text-center text-white/90 text-xs px-4 font-medium">
        <p>Use the buttons to move ← →</p>
        <p className="mt-0.5">Find the gaps in each floor!</p>
      </div>
    </div>
  )
}
