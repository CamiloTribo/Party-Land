// VictoryScreen component
'use client';
import { Button } from '~/components/ui/Button';
import { Home } from 'lucide-react';
import PinkPantherPlayer from '../PinkPantherPlayer';

interface VictoryScreenProps {
  score: number;
  tokensEarned: number;
  onRestart: () => void;
  onBackToMenu: () => void;
  selectedSkin: string;
}

export default function VictoryScreen({ score, tokensEarned, onRestart, onBackToMenu, selectedSkin }: VictoryScreenProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-6 bg-gradient-to-b from-yellow-400 via-pink-500 to-purple-600 overflow-hidden">
      {/* Confetti effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-white rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      <div className="relative mb-8 z-10 scale-[2.5]">
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
      <h1 className="text-7xl font-black text-white mb-3 z-10 text-center drop-shadow-2xl" style={{ textShadow: '5px 5px 0 rgba(0,0,0,0.4)' }}>
        VICTORY!
      </h1>
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 mb-8 text-center z-10 border border-white/30 shadow-2xl max-w-sm w-full">
        <p className="text-white text-xl mb-2 font-bold drop-shadow-md">You reached floor 0!</p>
        <p className="text-6xl font-black text-yellow-300 mb-6 drop-shadow-lg">{score} floors</p>
        <div className="border-t-2 border-white/30 pt-5 mt-2">
          <p className="text-emerald-300 text-xl mb-1 font-bold">Victory Bonus</p>
          <p className="text-4xl font-black text-emerald-300 mb-5 drop-shadow-lg">+500</p>
        </div>
        <div className="border-t-2 border-white/30 pt-5">
          <p className="text-white text-lg mb-1 font-semibold">Total Score</p>
          <p className="text-5xl font-black text-white mb-5 drop-shadow-lg">{tokensEarned}</p>
        </div>
        {tokensEarned > 0 && (
          <div className="border-t-2 border-white/30 pt-5">
            <p className="text-yellow-400 text-xl mb-3 font-bold">Tokens Earned</p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-black text-purple-900 text-xl">
                🪙
              </div>
              <p className="text-5xl font-black text-yellow-300 drop-shadow-lg">+{tokensEarned}</p>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 w-full max-w-xs z-10">
        <Button
          onClick={onRestart}
          size="lg"
          className="text-2xl font-black px-8 py-7 bg-yellow-400 hover:bg-yellow-300 text-purple-900 rounded-2xl shadow-xl transform hover:scale-105 transition-transform"
        >
          PLAY AGAIN
        </Button>
        <Button
          onClick={onBackToMenu}
          size="lg"
          className="text-xl font-black px-8 py-6 bg-white/20 hover:bg-white/30 text-white border-2 border-white rounded-2xl backdrop-blur-sm flex items-center justify-center gap-2"
        >
          <Home className="w-6 h-6" />
          MENU
        </Button>
      </div>
    </div>
  );
}
