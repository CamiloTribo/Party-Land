'use client';

import { ArrowLeft, Gamepad2, Lock } from 'lucide-react';
import { Button } from '~/components/ui/Button';

interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  comingSoon?: boolean;
}

const GAMES: Game[] = [
  {
    id: '100-floor-drop',
    name: '100 Floor Drop',
    description: 'Descend 100 floors in this addictive arcade game!',
    icon: '🎯',
    available: true,
  },
  {
    id: 'party-race',
    name: 'Party Race',
    description: 'Race against friends in crazy obstacle courses!',
    icon: '🏁',
    available: false,
    comingSoon: true,
  },
  {
    id: 'token-hunter',
    name: 'Token Hunter',
    description: 'Collect tokens in this fast-paced adventure!',
    icon: '💎',
    available: false,
    comingSoon: true,
  },
];

interface GameSelectionScreenProps {
  onSelectGame: (gameId: string) => void;
  onBack: () => void;
}

export default function GameSelectionScreen({ onSelectGame, onBack }: GameSelectionScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="w-full h-full"
          style={{ 
            backgroundImage: "radial-gradient(#ff69b4 1px, transparent 1px)", 
            backgroundSize: "30px 30px" 
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white hover:text-pink-300 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="font-bold">Back</span>
        </button>
      </div>

      {/* Title */}
      <div className="relative z-10 px-4 pb-8 pt-4">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Gamepad2 className="w-10 h-10 text-yellow-300" />
          <h1 className="text-5xl font-black text-yellow-300 text-center drop-shadow-lg">
            PARTY LAND
          </h1>
        </div>
        <p className="text-white/80 text-center text-lg font-semibold">
          Choose Your Game
        </p>
        <p className="text-white/60 text-center text-sm mt-1">
          All games share the same coins, skins & themes!
        </p>
      </div>

      {/* Games Grid */}
      <div className="relative z-10 px-4 flex flex-col gap-4 max-w-lg mx-auto">
        {GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => game.available && onSelectGame(game.id)}
            disabled={!game.available}
            className={`
              relative group p-6 rounded-3xl transition-all duration-300 border-2 overflow-hidden shadow-2xl
              ${game.available 
                ? 'hover:scale-[1.02] active:scale-[0.98] border-white/20 cursor-pointer' 
                : 'opacity-60 cursor-not-allowed border-white/10'
              }
            `}
          >
            {/* Background Gradient */}
            <div className={`
              absolute inset-0 transition-all duration-300
              ${game.available 
                ? 'bg-gradient-to-br from-pink-600/90 to-purple-800/90' 
                : 'bg-gradient-to-br from-gray-600/90 to-gray-800/90'
              }
            `} />

            {/* Hover Glow */}
            {game.available && (
              <div className="absolute inset-0 bg-pink-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}

            {/* Content */}
            <div className="relative flex items-center gap-4 z-10">
              {/* Icon */}
              <div className={`
                p-4 rounded-2xl backdrop-blur-sm border-2 shadow-inner flex-shrink-0
                ${game.available 
                  ? 'bg-white/10 border-white/20 group-hover:bg-white/20' 
                  : 'bg-white/5 border-white/10'
                }
              `}>
                <div className="text-5xl">
                  {game.available ? game.icon : <Lock className="w-10 h-10 text-white/40" />}
                </div>
              </div>

              {/* Text */}
              <div className="flex flex-col text-left flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-black text-white tracking-wide">
                    {game.name}
                  </div>
                  {game.comingSoon && (
                    <span className="px-2 py-0.5 bg-yellow-400/90 text-purple-900 text-xs font-black rounded-full">
                      SOON
                    </span>
                  )}
                </div>
                <div className="text-sm text-white/90 font-medium mt-1">
                  {game.description}
                </div>
              </div>

              {/* Arrow */}
              {game.available && (
                <div className="opacity-60 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
                  <ArrowLeft className="rotate-180 w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-6 left-0 right-0 text-center px-4">
        <p className="text-white/60 text-sm">
          🎮 More games coming soon! Stay tuned!
        </p>
      </div>
    </div>
  );
}
