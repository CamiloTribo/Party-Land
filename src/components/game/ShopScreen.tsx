'use client';

import { ArrowLeft, ShoppingBag, Lock } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { useUserGameData } from '~/hooks/useUserGameData';
import PinkPantherPlayer from '../PinkPantherPlayer';

interface ShopScreenProps {
  onBack: () => void;
}

// Lista de skins disponibles
const SKINS = [
  { id: 'classic', name: 'Classic Pink', cost: 0, description: 'El gato original' },
  { id: 'inspector', name: 'Inspector Pink', cost: 100, description: 'Modo detective' },
  { id: 'miami', name: 'Miami Pink', cost: 250, description: 'Muy cool' },
  { id: 'golden', name: 'Golden Panther', cost: 500, description: 'Puro lujo' },
  { id: 'ninja', name: 'Ninja Pink', cost: 750, description: 'Modo sigiloso' },
  { id: 'cyber', name: 'Cyber Pink', cost: 1000, description: 'Del futuro digital' },
];

export default function ShopScreen({ onBack }: ShopScreenProps) {
  const {
    tokens,
    unlockedSkins,
    selectedSkin,
    setSelectedSkin,
    unlockSkin,
    setTokens,
  } = useUserGameData();

  const handleBuySkin = (skinId: string, cost: number) => {
    if (tokens >= cost && !unlockedSkins.includes(skinId)) {
      unlockSkin(skinId);
      setTokens(prev => prev - cost);
      setSelectedSkin(skinId);
      console.log(`✅ Compraste ${skinId} por ${cost} tokens!`);
    }
  };

  const handleSelectSkin = (skinId: string) => {
    if (unlockedSkins.includes(skinId)) {
      setSelectedSkin(skinId);
      console.log(`✅ Skin seleccionada: ${skinId}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-purple-900/95 backdrop-blur-md border-b-2 border-pink-500/30">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-pink-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="font-bold">Back</span>
          </button>
          <div className="flex items-center gap-2 bg-purple-800/80 px-4 py-2 rounded-full border-2 border-pink-500/40">
            <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center text-sm">
              🪙
            </div>
            <span className="text-2xl font-black text-pink-400">{tokens}</span>
          </div>
        </div>
        <div className="px-4 pb-3">
          <h1 className="text-3xl font-black text-yellow-300 text-center drop-shadow-lg">
            🛍️ SHOP
          </h1>
          <p className="text-white/80 text-center text-sm mt-1">
            Compra skins con tus tokens
          </p>
        </div>
      </div>

      {/* Skins Grid */}
      <div className="p-4 pb-20">
        <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
          {SKINS.map((skin) => {
            const isUnlocked = unlockedSkins.includes(skin.id);
            const isSelected = selectedSkin === skin.id;
            const canBuy = tokens >= skin.cost;

            return (
              <div
                key={skin.id}
                className={`
                  relative bg-gradient-to-br from-purple-800/50 to-purple-900/50
                  backdrop-blur-sm rounded-2xl p-4 border-2
                  ${isSelected ? 'border-yellow-400 shadow-xl shadow-yellow-400/20' : 'border-purple-600/50'}
                  transition-all
                `}
              >
                <div className="flex items-center gap-4">
                  {/* Skin Preview */}
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 bg-purple-700/30 rounded-xl flex items-center justify-center border-2 border-purple-500/30">
                      <div className={`transform scale-[1.5] ${!isUnlocked ? 'opacity-30' : ''}`}>
                        <PinkPantherPlayer
                          x={0}
                          y={0}
                          isSlowed={false}
                          isMoving={false}
                          isFalling={false}
                          direction="right"
                          skin={skin.id}
                        />
                      </div>
                      {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="w-8 h-8 text-white/60" />
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                        <span className="text-xs">✓</span>
                      </div>
                    )}
                  </div>

                  {/* Skin Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{skin.name}</h3>
                    <p className="text-sm text-white/70 mb-2">{skin.description}</p>
                    <div className="flex items-center gap-2">
                      {skin.cost === 0 ? (
                        <span className="text-green-400 font-bold text-sm">FREE</span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-xl">🪙</span>
                          <span className="text-lg font-bold text-yellow-300">{skin.cost}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    {isUnlocked ? (
                      <Button
                        onClick={() => handleSelectSkin(skin.id)}
                        size="sm"
                        className={`
                          font-bold px-4 py-2 rounded-lg
                          ${isSelected
                            ? 'bg-yellow-400 text-purple-900'
                            : 'bg-purple-600 hover:bg-purple-500 text-white'
                          }
                        `}
                      >
                        {isSelected ? 'Equipada' : 'Equipar'}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleBuySkin(skin.id, skin.cost)}
                        disabled={!canBuy && skin.cost > 0}
                        size="sm"
                        className={`
                          font-bold px-4 py-2 rounded-lg
                          ${canBuy || skin.cost === 0
                            ? 'bg-green-500 hover:bg-green-400 text-white'
                            : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                          }
                        `}
                      >
                        {skin.cost === 0 ? 'Gratis' : 'Comprar'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-purple-800/40 backdrop-blur-sm rounded-2xl p-4 border-2 border-pink-500/30 max-w-2xl mx-auto">
          <p className="text-white/90 text-sm text-center">
            💡 Juega más para ganar tokens y desbloquear más skins!
          </p>
          <p className="text-white/70 text-xs text-center mt-2">
            Cada piso que desciendas = 1 token
          </p>
        </div>
      </div>
    </div>
  );
}
