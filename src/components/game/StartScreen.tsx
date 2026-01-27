'use client'

import { Button } from '~/components/ui/Button';
import { Volume2, VolumeX, ShoppingBag } from 'lucide-react';
import PinkPantherPlayer from '../PinkPantherPlayer';
import { useUserGameData } from '~/hooks/useUserGameData';

interface StartScreenProps {
  onStart: () => void;
  onOpenShop: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export default function StartScreen({ onStart, onOpenShop, soundEnabled, onToggleSound }: StartScreenProps) {
  const { tokens, selectedSkin, username } = useUserGameData();

  return (
    <div className="fixed inset-0 flex flex-col items-center bg-gradient-to-b from-pink-600 via-pink-500 to-pink-600">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,50,150,0.3),transparent)]" />
      <div className="absolute top-6 left-6 flex items-center gap-3 bg-[#2a003f]/90 px-5 py-3 rounded-full border-2 border-[#ff69b4]/60 z-10 backdrop-blur-sm shadow-xl">
        <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center font-black text-purple-900">
          🪙
        </div>
        <span className="font-black text-4xl text-[#ff69b4] min-w-[70px]">{tokens}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 pt-24 pb-32 relative z-0">
        {/* Character above the title */}
        <div className="flex items-center justify-center w-full mb-12">
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
        <div className="flex flex-col items-center gap-2 mb-2">
          <h1 className="text-7xl font-black text-yellow-300 leading-tight text-center drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)]" style={{ textShadow: '5px 5px 0 rgba(0,0,0,0.3)' }}>
            100 FLOOR
          </h1>
          <h1 className="text-7xl font-black text-yellow-300 text-center drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)]" style={{ textShadow: '5px 5px 0 rgba(0,0,0,0.3)' }}>
            DROP
          </h1>
        </div>
        <p className="text-white text-lg font-semibold drop-shadow-md text-center">
          Dodge obstacles and reach floor 0!
        </p>
        <div className="w-56 h-5 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-lg shadow-xl border-2 border-yellow-700" />
        <div className="flex flex-col gap-5 w-full max-w-xs mt-10 relative z-20">
          <Button
            onClick={onStart}
            size="lg"
            className="text-3xl font-black px-8 py-8 bg-yellow-400 hover:bg-yellow-300 text-purple-900 rounded-2xl shadow-xl"
          >
            PLAY
          </Button>
          <Button
            onClick={onOpenShop}
            size="lg"
            className="text-xl font-black px-8 py-6 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl shadow-xl flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-6 h-6" />
            SHOP
          </Button>

          {/* Username Display */}
          {username && (
            <div className="w-full flex justify-center mt-2">
              <div className="border-2 border-white rounded-full px-6 py-2 bg-transparent backdrop-blur-sm shadow-lg">
                <span className="text-white font-bold text-lg drop-shadow-md">
                  {username}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Sound toggle */}
      <button
        onClick={onToggleSound}
        className="absolute top-6 right-6 w-14 h-14 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors shadow-lg z-10"
      >
        {soundEnabled ? (
          <Volume2 className="w-7 h-7 text-white" />
        ) : (
          <VolumeX className="w-7 h-7 text-white" />
        )}
      </button>
      {/* Instructions */}
      <div className="absolute bottom-8 text-center text-white/90 text-sm px-6 font-medium">
        <p>Use the buttons to move ← →</p>
        <p className="mt-1">Find the gaps in each floor!</p>
      </div>
    </div>
  )
}
