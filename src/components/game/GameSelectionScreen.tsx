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
    <div className="fixed inset-0 bg-[#2d0050] overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#ff69b4_0%,transparent_50%)] opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,#7c3aed_0%,transparent_50%)] opacity-20" />

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 p-5 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white transition-all border border-white/20 shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-wider">Back</span>
        </button>

        <div className="flex -space-x-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-purple-500 bg-purple-900 flex items-center justify-center text-xs">
              {['🎮', '🎯', '✨'][i]}
            </div>
          ))}
        </div>
      </div>

      {/* Title Section */}
      <div className="relative z-10 px-6 pb-10 pt-2 flex flex-col items-center">
        <div className="relative mb-2">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full blur opacity-50"></div>
          <Gamepad2 className="w-12 h-12 text-yellow-300 relative" />
        </div>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-600 text-center drop-shadow-xl uppercase tracking-tighter">
          The Games
        </h1>
        <div className="h-1 w-20 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full mt-2" />
        <p className="text-white/70 text-center text-sm font-medium mt-3 italic">
          "All your progress, in every world"
        </p>
      </div>

      {/* Games List */}
      <div className="relative z-10 px-4 flex flex-col gap-5 max-w-lg mx-auto pb-20">
        {GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => game.available && onSelectGame(game.id)}
            disabled={!game.available}
            className={`
              relative group p-5 rounded-[2.5rem] transition-all duration-300 border-2 overflow-hidden shadow-2xl
              ${game.available
                ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:border-pink-500/50 hover:bg-white/15 cursor-pointer active:scale-95'
                : 'bg-black/20 border-white/5 cursor-not-allowed grayscale'
              }
            `}
          >
            {/* Content */}
            <div className="relative flex items-center gap-5 z-10">
              {/* Icon Container */}
              <div className={`
                w-20 h-20 rounded-[1.8rem] backdrop-blur-xl border-2 shadow-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:rotate-6
                ${game.available
                  ? 'bg-gradient-to-br from-pink-500/20 to-purple-600/20 border-white/30'
                  : 'bg-white/5 border-white/10'
                }
              `}>
                <div className="text-4xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                  {game.available ? game.icon : <Lock className="w-10 h-10 text-white/20" />}
                </div>
              </div>

              {/* Text Info */}
              <div className="flex flex-col text-left flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-black text-white tracking-tight truncate">
                    {game.name}
                  </span>
                  {game.comingSoon && (
                    <span className="px-2 py-0.5 bg-pink-600/90 text-white text-[9px] font-black rounded-full uppercase tracking-widest whitespace-nowrap">
                      SOON
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/60 font-medium leading-relaxed line-clamp-2">
                  {game.description}
                </p>
              </div>

              {/* Play Indicator */}
              {game.available && (
                <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                  <ArrowLeft className="rotate-180 w-5 h-5 text-purple-900" strokeWidth={4} />
                </div>
              )}
            </div>

            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
        ))}
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-6 left-0 right-0 text-center px-4 pointer-events-none">
        <div className="inline-block bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em]">
            New arenas unlocking every month
          </p>
        </div>
      </div>
    </div>
  );
}
