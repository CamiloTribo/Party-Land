'use client';

import { ArrowLeft, Lock, Eye, Coins, DollarSign, ShoppingBag, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { useUserGameData } from '~/hooks/useUserGameData';
import PinkPantherPlayer from '../PinkPantherPlayer';
import { useState } from 'react';
import { PurchaseModal } from './PurchaseModal';
import { soundManager } from '~/lib/SoundManager';

interface ShopScreenProps {
  onBack: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

// 16 Token Skins
const TOKEN_SKINS = [
  { id: 'classic', name: 'Classic Pink', cost: 0, description: 'Original cat' },
  { id: 'inspector', name: 'Inspector Pink', cost: 100, description: 'Detective mode' },
  { id: 'miami', name: 'Miami Pink', cost: 250, description: 'Very cool' },
  { id: 'golden', name: 'Golden Panther', cost: 500, description: 'Pure luxury' },
  { id: 'ninja', name: 'Ninja Pink', cost: 750, description: 'Stealth mode' },
  { id: 'cyber', name: 'Cyber Pink', cost: 1000, description: 'From future' },
  { id: 'royal', name: 'Royal Pink', cost: 1500, description: 'Royalty' },
  { id: 'space', name: 'Space Pink', cost: 2000, description: 'Cosmic' },
  { id: 'vampire', name: 'Vampire Pink', cost: 2500, description: 'Night hunter' },
  { id: 'pirate', name: 'Pirate Pink', cost: 3000, description: 'Sea raider' },
  { id: 'wizard', name: 'Wizard Pink', cost: 4000, description: 'Magical' },
  { id: 'knight', name: 'Knight Pink', cost: 5000, description: 'Brave knight' },
  { id: 'samurai', name: 'Samurai Pink', cost: 7500, description: 'Warrior' },
  { id: 'robot', name: 'Robot Pink', cost: 10000, description: 'Tech AI' },
  { id: 'diamond', name: 'Diamond Pink', cost: 15000, description: 'Precious' },
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

export default function ShopScreen({ onBack, soundEnabled, onToggleSound }: ShopScreenProps) {
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
  const [previewSkin, setPreviewSkin] = useState<string | null>(null);
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

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors shadow-lg z-10"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-white" />
            ) : (
              <VolumeX className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Balance Badges */}
          <div className="flex gap-2">
            <div className="flex items-center gap-1 bg-purple-800/80 px-3 py-1.5 rounded-full border-2 border-pink-500/40">
              <Coins className="w-4 h-4 text-pink-400" />
              <span className="text-lg font-black text-pink-400">{tokens}</span>
            </div>
            <div className="flex items-center gap-1 bg-purple-800/80 px-3 py-1.5 rounded-full border-2 border-blue-500/40">
              <DollarSign className="w-4 h-4 text-blue-400" />
              <span className="text-lg font-black text-blue-400">{usdcBalance.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="px-4 pb-3">
          <h1 className="text-3xl font-black text-yellow-300 text-center drop-shadow-lg flex items-center justify-center gap-2">
            <ShoppingBag className="w-7 h-7" /> SKIN SHOP
          </h1>
        </div>

        {/* Tabs */}
        <div className="px-4 pb-3">
          <div className="flex bg-black/20 p-1 rounded-full max-w-sm mx-auto backdrop-blur-sm border border-white/5">
            <div
              className={`absolute inset-y-1 rounded-full transition-all duration-300 shadow-lg ${shopType === 'tokens'
                ? 'left-1 w-[calc(50%-4px)] bg-gradient-to-r from-pink-600 to-purple-600'
                : 'left-[50%] w-[calc(50%-4px)] bg-gradient-to-r from-blue-600 to-cyan-600'
                }`}
            />
            <button
              onClick={() => {
                soundManager.play('click');
                setShopType('tokens');
              }}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition-colors ${shopType === 'tokens' ? 'text-white' : 'text-white/60'
                }`}
            >
              <Coins className="w-4 h-4" />
              Token Skins
            </button>
            <button
              onClick={() => {
                soundManager.play('click');
                setShopType('usdc');
              }}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition-colors ${shopType === 'usdc' ? 'text-white' : 'text-white/60'
                }`}
            >
              <DollarSign className="w-4 h-4" />
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
                  soundManager.play('click');
                  if (isUnlocked && !isSelected) {
                    setSelectedSkin(skin.id);
                  } else if (!isUnlocked && (canAfford || skin.cost === 0)) {
                    handlePurchaseClick(skin);
                  }
                }}
                disabled={isSelected || (!isUnlocked && !canAfford && skin.cost > 0)}
                className={`
                  relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all
                  ${isSelected
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
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg border border-white/30 flex items-center gap-0.5">
                      <span className="text-[10px]">$</span> USDC
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
                  {/* Preview Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      soundManager.play('click');
                      setPreviewSkin(skin.id);
                    }}
                    className="absolute top-0 left-0 z-10 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white p-1 rounded-lg transition-all"
                  >
                    <Eye className="w-3 h-3" />
                  </button>

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
                      className={`w-full h-8 text-xs font-bold rounded-xl flex items-center justify-center ${isSelected ? 'bg-green-500 text-white' : 'bg-white/10 text-white'
                        }`}
                    >
                      {isSelected ? '✓ SELECTED' : 'SELECT'}
                    </div>
                  ) : (
                    <div
                      className={`w-full h-8 text-xs font-bold rounded-xl flex items-center justify-center gap-1 ${canAfford || skin.cost === 0
                        ? shopType === 'usdc'
                          ? 'bg-blue-600 text-white'
                          : 'bg-pink-600 text-white'
                        : 'bg-white/5 text-white/30'
                        }`}
                    >
                      {canAfford || skin.cost === 0 ? (
                        <>
                          {shopType === 'usdc' ? <DollarSign className="w-3 h-3" /> : <Coins className="w-3 h-3" />} {skin.cost === 0 ? 'FREE' : skin.cost}
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

      {/* Skin Preview Modal */}
      {previewSkin && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewSkin(null)}
        >
          <div
            className="relative w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const skin = [...TOKEN_SKINS, ...USDC_SKINS].find(s => s.id === previewSkin);
              if (!skin) return null;

              return (
                <div className="bg-gray-900 rounded-2xl overflow-hidden border-2 border-white/20">
                  {/* Header */}
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">{skin.name}</h3>
                        <p className="text-sm text-white/60">{skin.description}</p>
                      </div>
                      <button
                        onClick={() => setPreviewSkin(null)}
                        className="text-white/60 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Large Skin Preview */}
                  <div className="bg-gradient-to-br from-purple-900 to-pink-900 h-96 relative flex items-center justify-center">
                    <div className="transform scale-[3]">
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

                    {/* Info Badge */}
                    {shopType === 'usdc' && (
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-center">
                          <div className="text-white/90 text-xs font-bold mb-1 flex items-center justify-center gap-1">
                            <Sparkles className="w-3 h-3" /> PREMIUM SKIN
                          </div>
                          <div className="text-white/70 text-[10px]">
                            Exclusive USDC skin
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-4 bg-gray-800/50">
                    <button
                      onClick={() => setPreviewSkin(null)}
                      className="w-full bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl font-bold transition-all"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
