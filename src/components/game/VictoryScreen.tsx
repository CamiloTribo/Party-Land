// VictoryScreen component
'use client';
import { Button } from '~/components/ui/Button';
import { Home, Share2, Coins } from 'lucide-react';
import PinkPantherPlayer from '../PinkPantherPlayer';
import { shareToFarcaster } from '~/lib/utils';

interface VictoryScreenProps {
  score: number;
  tokensEarned: number;
  onRestart: () => void;
  onBackToMenu: () => void;
  selectedSkin: string;
}

export default function VictoryScreen({ score, tokensEarned, onRestart, onBackToMenu, selectedSkin }: VictoryScreenProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-yellow-400 via-pink-500 to-purple-600 overflow-hidden">
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
      <div className="relative mb-4 z-10 scale-[2]">
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
      <h1 className="text-5xl font-black text-white mb-2 z-10 text-center drop-shadow-2xl" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.4)' }}>
        VICTORY!
      </h1>
      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-5 mb-4 text-center z-10 border border-white/30 shadow-2xl max-w-sm w-full">
        <p className="text-white text-base mb-1 font-bold drop-shadow-md">You reached floor 0!</p>
        <p className="text-5xl font-black text-yellow-300 mb-4 drop-shadow-lg">{score} floors</p>
        <div className="border-t-2 border-white/30 pt-3 mt-2">
          <p className="text-emerald-300 text-base mb-1 font-bold">Victory Bonus</p>
          <p className="text-3xl font-black text-emerald-300 mb-3 drop-shadow-lg">+500</p>
        </div>
        <div className="border-t-2 border-white/30 pt-3">
          <p className="text-white text-base mb-1 font-semibold">Total Score</p>
          <p className="text-4xl font-black text-white mb-3 drop-shadow-lg">{tokensEarned}</p>
        </div>
        {tokensEarned > 0 && (
          <div className="border-t-2 border-white/30 pt-3">
            <p className="text-yellow-400 text-base mb-2 font-bold">Tokens Earned</p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center font-black text-purple-900 text-base">
                <Coins className="w-4 h-4" />
              </div>
              <p className="text-4xl font-black text-yellow-300 drop-shadow-lg">+{tokensEarned}</p>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs z-10">
        <Button
          onClick={() => shareToFarcaster(`I just reached floor 0 in Party Land! Final score: ${score} floors. Tokens earned: ${tokensEarned}. Play with me on Farcaster! #PartyLand`)}
          size="lg"
          className="text-xl font-black px-8 py-5 bg-[#ff69b4] hover:bg-[#ff4da6] text-white rounded-2xl shadow-xl transform hover:scale-105 transition-transform flex items-center justify-center gap-2"
        >
          <Share2 className="w-6 h-6" />
          SHARE WIN
        </Button>
        <Button
          onClick={onRestart}
          size="lg"
          className="text-lg font-black px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-purple-900 rounded-2xl shadow-xl"
        >
          PLAY AGAIN
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
  );
}
