// GameOverScreen component
'use client';
import { Button } from '~/components/ui/Button';
import { RotateCcw, Home, Coins } from 'lucide-react';
import PinkPantherPlayer from '../PinkPantherPlayer';

interface GameOverScreenProps {
  score: number;
  tokensEarned: number;
  onRestart: () => void;
  onBackToMenu: () => void;
  selectedSkin?: string;
}

export default function GameOverScreen({ score, tokensEarned, onRestart, onBackToMenu, selectedSkin = 'classic' }: GameOverScreenProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 py-8 w-full">
        {/* Character above the title */}
        <div className="flex items-center justify-center w-full mb-4">
          <div className="relative scale-[2.5]">
            <PinkPantherPlayer
              x={0}
              y={0}
              isSlowed={true}
              isMoving={false}
              isFalling={true}
              direction="right"
              skin={selectedSkin}
            />
            {/* Sad tear effect */}
            <div className="absolute top-12 left-8">
              <svg width="20" height="30" viewBox="0 0 10 15">
                <ellipse cx="5" cy="8" rx="3" ry="6" fill="#87CEEB" opacity="0.6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Title below the character */}
        <div className="flex flex-col items-center gap-3 w-full">
          <h1 className="text-4xl font-black text-white drop-shadow-2xl text-center">GAME OVER</h1>
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 text-center border border-white/20 shadow-2xl max-w-sm w-full">
            <p className="text-white/90 text-base mb-1 font-semibold">You reached floor:</p>
            <p className="text-5xl font-black text-yellow-300 mb-4 drop-shadow-lg">{100 - score}</p>
            <div className="border-t border-white/20 pt-3 mb-3">
              <p className="text-white/90 text-base mb-1 font-semibold">Floors Descended:</p>
              <p className="text-4xl font-black text-pink-300 mb-4 drop-shadow-lg">{score}</p>
            </div>
            {tokensEarned > 0 && (
              <div className="pt-3 border-t border-white/20">
                <p className="text-yellow-400 text-base mb-2 font-bold">Tokens Earned</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-purple-900" />
                  </div>
                  <p className="text-3xl font-black text-yellow-300 drop-shadow-lg">+{tokensEarned}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
          <Button
            onClick={onRestart}
            size="lg"
            className="text-xl font-black px-8 py-5 bg-yellow-400 hover:bg-yellow-300 text-purple-900 rounded-2xl shadow-xl transform hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-6 h-6" />
            TRY AGAIN
          </Button>
          <Button
            onClick={onBackToMenu}
            size="lg"
            className="text-lg font-black px-8 py-4 bg-white/20 hover:bg-white/30 text-white border-2 border-white rounded-2xl backdrop-blur-sm flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            MENU
          </Button>
        </div>
      </div>
      <div className="absolute bottom-3 text-center text-white/70 text-sm font-medium">
        <p>Keep trying!</p>
      </div>
    </div>
  );
}
