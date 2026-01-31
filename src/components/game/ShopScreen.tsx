'use client';

import { ArrowLeft, Lock } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { useUserGameData } from '~/hooks/useUserGameData';
import PinkPantherPlayer from '../PinkPantherPlayer';
import { useState } from 'react';
import { PurchaseModal } from './PurchaseModal';

interface ShopScreenProps {
  onBack: () => void;
}

// 16 Token Skins (completas)
const TOKEN_SKINS = [
  { id: 'classic', name: 'Classic Pink', cost: 0, description: 'El gato original' },
  { id: 'inspector', name: 'Inspector Pink', cost: 100, description: 'Modo detective' },
  { id: 'miami', name: 'Miami Pink', cost: 250, description: 'Muy cool' },
  { id: 'golden', name: 'Golden Panther', cost: 500, description: 'Puro lujo' },
  { id: 'ninja', name: 'Ninja Pink', cost: 750, description: 'Modo sigiloso' },
  { id: 'cyber', name: 'Cyber Pink', cost: 1000, description: 'Del futuro' },
  { id: 'royal', name: 'Royal Pink', cost: 1500, description: 'Realeza' },
  { id: 'space', name: 'Space Pink', cost: 2000, description: 'Espacial' },
  { id: 'vampire', name: 'Vampire Pink', cost: 2500, description: 'De la noche' },
  { id: 'pirate', name: 'Pirate Pink', cost: 3000, description: 'Pirata' },
  { id: 'wizard', name: 'Wizard Pink', cost: 4000, description: 'Mágico' },
  { id: 'knight', name: 'Knight Pink', cost: 5000, description: 'Caballero' },
  { id: 'samurai', name: 'Samurai Pink', cost: 7500, description: 'Guerrero' },
  { id: 'robot', name: 'Robot Pink', cost: 10000, description: 'Tech AI' },
  { id: 'diamond', name: 'Diamond Pink', cost: 15000, description: 'Precioso' },
  { id: 'legendary', name: 'Legendary Pink', cost: 25000, description: 'Ultimate' },
];

// 16 USDC Exclusive Skins (superhéroes) - Price: 0.23 USDC for testing
const USDC_SKINS = [
  { id: 'superman', name: 'Super Pink', cost: 2.3, description: 'Faster than bullet!' },
  { id: 'harry-potter', name: 'Wizard Potter', cost: 2.3, description: 'The boy who meowed' },
  { id: 'batman', name: 'Dark Knight', cost: 2.3, description: "I'm Pinkman!" },
  { id: 'spiderman', name: 'Spider Pink', cost: 2.3, description: 'Friendly hero' },
  { id: 'iron-man', name: 'Iron Pink', cost: 2.3, description: 'Metal suit' },
  { id: 'captain-america', name: 'Captain Pink', cost: 2.3, description: 'All day!' },
  { id: 'thor', name: 'Pink Thunder', cost: 2.3, description: 'God of Thunder' },
  { id: 'hulk', name: 'Pink Smash', cost: 2.3, description: 'Smash!' },
  { id: 'wonder-woman', name: 'Wonder Pink', cost: 2.3, description: 'Amazon warrior' },
  { id: 'flash', name: 'Flash Pink', cost: 2.3, description: 'Speedster' },
  { id: 'deadpool', name: 'Deadpool Pink', cost: 2.3, description: 'Merc mouth' },
  { id: 'joker', name: 'Pink Joker', cost: 2.3, description: 'Why so pink?' },
  { id: 'luke-skywalker', name: 'Jedi Pink', cost: 2.3, description: 'May the pink' },
  { id: 'darth-vader', name: 'Dark Lord', cost: 2.3, description: 'Your father' },
  { id: 'mario', name: 'Mario Pink', cost: 2.3, description: "Let's-a pink!" },
  { id: 'sonic', name: 'Sonic Pink', cost: 2.3, description: 'Gotta go pink!' },
];

export default function ShopScreen({ onBack }: ShopScreenProps) {
  const {
    tokens,
    usdcBalance,
    unlockedSkins,
    selectedSkin,
    setSelectedSkin,
    unlockSkin,
    setTokens,
    refetchUSDC, // Para refrescar balance después de compra
  } = useUserGameData();

  const [shopType, setShopType] = useState<'tokens' | 'usdc'>('tokens');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'confirmation' | 'success'>('confirmation');
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    name: string;
    cost: number;
    currency: 'tokens' | 'USDC';
  } | null>(null);

  const currentSkins = shopType === 'tokens' ? TOKEN_SKINS : USDC_SKINS;

  const handlePurchaseClick = (skin: typeof TOKEN_SKINS[0]) => {
    setSelectedItem({
      id: skin.id,
      name: skin.name,
      cost: skin.cost,
      currency: shopType === 'tokens' ? 'tokens' : 'USDC',
    });
    setModalType('confirmation');
    setModalOpen(true);
  };

  const handleConfirmPurchase = () => {
    if (!selectedItem) return;

    if (selectedItem.currency === 'tokens') {
      // Compra con tokens
      if (tokens >= selectedItem.cost) {
        unlockSkin(selectedItem.id);
        setTokens((prev) => prev - selectedItem.cost);
        setSelectedSkin(selectedItem.id);
        setModalType('success');
      }
    } else {
      // Compra con USDC - NO RESTA BALANCE AQUÍ
      // El balance se actualizará automáticamente después de la transferencia blockchain
      // Por ahora solo verifica que tenga balance
      if (usdcBalance >= selectedItem.cost) {
        // El modal PurchaseModal manejará la transferencia real
        setModalType('confirmation'); // Mantener en confirmación para que el modal maneje el pago
      }
    }
  };

  const handlePurchaseSuccess = () => {
    // Called after successful USDC payment
    if (selectedItem) {
      unlockSkin(selectedItem.id);
      setSelectedSkin(selectedItem.id);
      refetchUSDC(); // Refresh balance from blockchain
      setModalType('success');
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
          
          {/* Balance Badges */}
          <div className="flex gap-2">
            <div className="flex items-center gap-1 bg-purple-800/80 px-3 py-1.5 rounded-full border-2 border-pink-500/40">
              <span className="text-lg">🪙</span>
              <span className="text-lg font-black text-pink-400">{tokens}</span>
            </div>
            <div className="flex items-center gap-1 bg-purple-800/80 px-3 py-1.5 rounded-full border-2 border-blue-500/40">
              <span className="text-lg">💵</span>
              <span className="text-lg font-black text-blue-400">{usdcBalance.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="px-4 pb-3">
          <h1 className="text-3xl font-black text-yellow-300 text-center drop-shadow-lg">
            🛍️ SKIN SHOP
          </h1>
        </div>

        {/* Tabs */}
        <div className="px-4 pb-3">
          <div className="flex bg-black/20 p-1 rounded-full max-w-sm mx-auto backdrop-blur-sm border border-white/5">
            <div
              className={`absolute inset-y-1 rounded-full transition-all duration-300 shadow-lg ${
                shopType === 'tokens'
                  ? 'left-1 w-[calc(50%-4px)] bg-gradient-to-r from-pink-600 to-purple-600'
                  : 'left-[50%] w-[calc(50%-4px)] bg-gradient-to-r from-blue-600 to-cyan-600'
              }`}
            />
            <button
              onClick={() => setShopType('tokens')}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition-colors ${
                shopType === 'tokens' ? 'text-white' : 'text-white/60'
              }`}
            >
              <span className="text-base">🪙</span>
              Token Skins
            </button>
            <button
              onClick={() => setShopType('usdc')}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition-colors ${
                shopType === 'usdc' ? 'text-white' : 'text-white/60'
              }`}
            >
              <span className="text-base">💵</span>
              USDC Exclusives
            </button>
          </div>
        </div>
      </div>

      {/* Skins Grid */}
      <div className="p-4 pb-20">
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
          {currentSkins.map((skin) => {
            const isUnlocked = unlockedSkins.includes(skin.id);
            const isSelected = selectedSkin === skin.id;
            const canAfford = shopType === 'tokens' ? tokens >= skin.cost : usdcBalance >= skin.cost;

            return (
              <button
                key={skin.id}
                onClick={() => {
                  if (isUnlocked && !isSelected) {
                    setSelectedSkin(skin.id);
                  } else if (!isUnlocked && (canAfford || skin.cost === 0)) {
                    handlePurchaseClick(skin);
                  }
                }}
                disabled={isSelected || (!isUnlocked && !canAfford && skin.cost > 0)}
                className={`
                  relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all
                  ${
                    isSelected
                      ? 'border-yellow-400 shadow-xl shadow-yellow-400/20 scale-[1.02]'
                      : shopType === 'usdc'
                      ? 'bg-blue-900/20 border-blue-500/40 hover:border-blue-400/70'
                      : 'bg-purple-800/30 border-purple-600/50 hover:border-purple-500/70'
                  }
                  ${!isUnlocked && !canAfford && skin.cost > 0 ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {/* USDC Badge */}
                {shopType === 'usdc' && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg border border-white/30">
                      💵 USDC
                    </div>
                  </div>
                )}

                {/* Selected Check */}
                {isSelected && (
                  <div className="absolute -top-2 -left-2 z-10 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}

                {/* Skin Preview */}
                <div className="h-20 w-full mb-2 relative flex items-center justify-center">
                  <div className={`transform scale-110 ${!isUnlocked && 'opacity-40'}`}>
                    <PinkPantherPlayer
                      x={0}
                      y={0}
                      isSlowed={false}
                      isMoving={true}
                      isFalling={false}
                      direction="right"
                      skin={skin.id}
                    />
                  </div>
                  {!isUnlocked && skin.cost > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-white/60" />
                    </div>
                  )}
                </div>

                {/* Skin Info */}
                <div className="text-center w-full mb-2">
                  <div className="font-bold text-sm text-white truncate">{skin.name}</div>
                  <div className="text-[10px] text-white/60 line-clamp-1">{skin.description}</div>
                </div>

                {/* Action Button */}
                <div className="w-full">
                  {isUnlocked ? (
                    <div
                      className={`w-full h-8 text-xs font-bold rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-green-500 text-white' : 'bg-white/10 text-white'
                      }`}
                    >
                      {isSelected ? '✓ SELECTED' : 'SELECT'}
                    </div>
                  ) : (
                    <div
                      className={`w-full h-8 text-xs font-bold rounded-xl flex items-center justify-center gap-1 ${
                        canAfford || skin.cost === 0
                          ? shopType === 'usdc'
                            ? 'bg-blue-600 text-white'
                            : 'bg-pink-600 text-white'
                          : 'bg-white/5 text-white/30'
                      }`}
                    >
                      {canAfford || skin.cost === 0 ? (
                        <>
                          {shopType === 'usdc' ? '💵' : '🪙'} {skin.cost === 0 ? 'FREE' : skin.cost}
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" /> {skin.cost}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Purchase Modal */}
      {selectedItem && (
        <PurchaseModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirmPurchase}
          onSuccess={handlePurchaseSuccess}
          type={modalType}
          item={selectedItem}
          currentBalance={selectedItem.currency === 'tokens' ? tokens : usdcBalance}
        />
      )}
    </div>
  );
}
