'use client';

import { ArrowLeft, Lock, Eye } from 'lucide-react';
import { useState } from 'react';
import { useUserGameData } from '~/hooks/useUserGameData';
import { PurchaseModal } from './PurchaseModal';

interface ShopThemesScreenProps {
  onBack: () => void;
}

// 16 Token Themes
const TOKEN_THEMES = [
  // Básicos gratis (4)
  { id: 'classic-pink', name: 'Classic Pink', cost: 0, bg: 'bg-gradient-to-br from-[#831843] to-[#be185d]', description: 'Original pink vibes' },
  { id: 'ocean-blue', name: 'Ocean Blue', cost: 0, bg: 'bg-gradient-to-br from-[#0c4a6e] to-[#0369a1]', description: 'Deep sea adventure' },
  { id: 'forest-green', name: 'Forest Green', cost: 0, bg: 'bg-gradient-to-br from-[#14532d] to-[#15803d]', description: "Nature's playground" },
  { id: 'sunset-orange', name: 'Sunset Orange', cost: 0, bg: 'bg-gradient-to-br from-[#7c2d12] to-[#c2410c]', description: 'Warm golden hour' },
  // Premium con tokens (12)
  { id: 'royal-purple', name: 'Royal Purple', cost: 500, bg: 'bg-gradient-to-br from-[#581c87] to-[#6b21a8]', description: 'Majestic & elegant' },
  { id: 'fire-red', name: 'Fire Red', cost: 1000, bg: 'bg-gradient-to-br from-[#7f1d1d] to-[#991b1b]', description: 'Burning passion' },
  { id: 'cyber-neon', name: 'Cyber Neon', cost: 1500, bg: 'bg-gradient-to-br from-[#164e63] to-[#6b21a8]', description: 'Futuristic glow' },
  { id: 'golden-luxury', name: 'Golden Luxury', cost: 2000, bg: 'bg-gradient-to-br from-[#713f12] to-[#a16207]', description: 'Pure elegance' },
  { id: 'midnight-dark', name: 'Midnight Dark', cost: 2500, bg: 'bg-gradient-to-br from-[#334155] to-[#0f172a]', description: 'Mystery night' },
  { id: 'candy-pop', name: 'Candy Pop', cost: 3000, bg: 'bg-gradient-to-br from-[#ec4899] to-[#3b82f6]', description: 'Sweet & colorful' },
  { id: 'toxic-slime', name: 'Toxic Slime', cost: 4000, bg: 'bg-gradient-to-br from-[#65a30d] to-[#15803d]', description: 'Radioactive vibes' },
  { id: 'arctic-ice', name: 'Arctic Ice', cost: 5000, bg: 'bg-gradient-to-br from-[#67e8f9] to-[#0ea5e9]', description: 'Frozen wonderland' },
  { id: 'lava-flow', name: 'Lava Flow', cost: 7500, bg: 'bg-gradient-to-br from-[#ea580c] to-[#18181b]', description: 'Volcanic power' },
  { id: 'galaxy-space', name: 'Galaxy Space', cost: 10000, bg: 'bg-gradient-to-br from-[#312e81] to-[#ec4899]', description: 'Among the stars' },
  { id: 'rainbow-dream', name: 'Rainbow Dream', cost: 15000, bg: 'bg-gradient-to-br from-[#ef4444] to-[#8b5cf6]', description: 'All colors united' },
  { id: 'diamond-shine', name: 'Diamond Shine', cost: 25000, bg: 'bg-gradient-to-br from-[#e5e7eb] to-[#a78bfa]', description: 'Ultimate brilliance' },
];

// 16 USDC Themes (superhéroes)
const USDC_THEMES = [
  { id: 'gotham-city', name: 'Gotham City', cost: 2.3, bg: 'bg-gradient-to-br from-[#232526] to-[#434343]', description: "Dark knight's domain" },
  { id: 'metropolis-sky', name: 'Metropolis Sky', cost: 2.3, bg: 'bg-gradient-to-br from-[#2563eb] to-[#f43f5e]', description: 'Hope shines bright' },
  { id: 'spider-web', name: 'Spider Web', cost: 2.3, bg: 'bg-gradient-to-br from-[#be123c] to-[#2563eb]', description: 'Swing through city' },
  { id: 'arc-reactor', name: 'Arc Reactor', cost: 2.3, bg: 'bg-gradient-to-br from-[#f59e42] to-[#be123c]', description: 'Powered by tech' },
  { id: 'gamma-rage', name: 'Gamma Rage', cost: 2.3, bg: 'bg-gradient-to-br from-[#22d3ee] to-[#a21caf]', description: 'Incredible strength' },
  { id: 'asgard-thunder', name: 'Asgard Thunder', cost: 2.3, bg: 'bg-gradient-to-br from-[#fbbf24] to-[#2563eb]', description: 'Realm of gods' },
  { id: 'hogwarts-magic', name: 'Hogwarts Magic', cost: 2.3, bg: 'bg-gradient-to-br from-[#f59e42] to-[#be123c]', description: 'Wizarding world' },
  { id: 'the-force', name: 'The Force', cost: 2.3, bg: 'bg-gradient-to-br from-[#2563eb] to-[#be123c]', description: 'Light & dark side' },
  { id: 'matrix-code', name: 'Matrix Code', cost: 2.3, bg: 'bg-gradient-to-br from-[#0f2027] to-[#00ff99]', description: 'Digital reality' },
  { id: 'chaotic-madness', name: 'Chaotic Madness', cost: 2.3, bg: 'bg-gradient-to-br from-[#a21caf] to-[#22d3ee]', description: 'Why so serious?' },
  { id: 'speed-force', name: 'Speed Force', cost: 2.3, bg: 'bg-gradient-to-br from-[#fbbf24] to-[#be123c]', description: 'Lightning fast' },
  { id: 'merc-style', name: 'Merc Style', cost: 2.3, bg: 'bg-gradient-to-br from-[#be123c] to-[#0f172a]', description: 'Maximum effort' },
  { id: 'amazonian-warrior', name: 'Amazonian Warrior', cost: 2.3, bg: 'bg-gradient-to-br from-[#f43f5e] to-[#2563eb]', description: 'Strength & honor' },
  { id: 'star-spangled', name: 'Star Spangled', cost: 2.3, bg: 'bg-gradient-to-br from-[#2563eb] to-[#f43f5e]', description: 'Freedom forever' },
  { id: 'sonic-boom', name: 'Sonic Boom', cost: 2.3, bg: 'bg-gradient-to-br from-[#2563eb] to-[#fbbf24]', description: 'Gotta go fast!' },
  { id: 'mushroom-kingdom', name: 'Mushroom Kingdom', cost: 2.3, bg: 'bg-gradient-to-br from-[#be123c] to-[#22c55e]', description: "Let's-a-go!" },
];

export default function ShopThemesScreen({ onBack }: ShopThemesScreenProps) {
  const {
    tokens,
    usdcBalance,
    unlockedThemes,
    selectedTheme,
    setSelectedTheme,
    unlockTheme,
    setTokens,
    refetchUSDC, // Para refrescar balance después de compra
  } = useUserGameData();

  const [tab, setTab] = useState<'tokens' | 'usdc'>('tokens');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'confirmation' | 'success'>('confirmation');
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    name: string;
    cost: number;
    currency: 'tokens' | 'USDC';
    bgColor?: string;
  } | null>(null);

  const themesToShow = tab === 'tokens' ? TOKEN_THEMES : USDC_THEMES;

  const handlePurchaseClick = (theme: typeof TOKEN_THEMES[0]) => {
    setSelectedItem({
      id: theme.id,
      name: theme.name,
      cost: theme.cost,
      currency: tab === 'tokens' ? 'tokens' : 'USDC',
      bgColor: theme.bg,
    });
    setModalType('confirmation');
    setModalOpen(true);
  };

  const handleConfirmPurchase = () => {
    if (!selectedItem) return;

    if (selectedItem.currency === 'tokens') {
      if (tokens >= selectedItem.cost) {
        unlockTheme(selectedItem.id);
        setTokens((prev) => prev - selectedItem.cost);
        setSelectedTheme(selectedItem.id);
        setModalType('success');
      }
    } else {
      // USDC purchase - NO RESTA BALANCE AQUÍ
      // El balance se actualizará automáticamente después de la transferencia blockchain
      // El modal PurchaseModal manejará la transferencia real
      if (usdcBalance >= selectedItem.cost) {
        setModalType('confirmation'); // Mantener en confirmación para que el modal maneje el pago
      }
    }
  };

  const handlePurchaseSuccess = () => {
    // Called after successful USDC payment
    if (selectedItem) {
      unlockTheme(selectedItem.id);
      setSelectedTheme(selectedItem.id);
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
            🎨 THEME SHOP
          </h1>
        </div>

        {/* Tabs */}
        <div className="px-4 pb-3">
          <div className="flex bg-black/20 p-1 rounded-full max-w-sm mx-auto backdrop-blur-sm border border-white/5 relative">
            <div
              className={`absolute inset-y-1 rounded-full transition-all duration-300 shadow-lg ${
                tab === 'tokens'
                  ? 'left-1 w-[calc(50%-4px)] bg-gradient-to-r from-pink-600 to-purple-600'
                  : 'left-[50%] w-[calc(50%-4px)] bg-gradient-to-r from-blue-600 to-cyan-600'
              }`}
            />
            <button
              onClick={() => setTab('tokens')}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition-colors ${
                tab === 'tokens' ? 'text-white' : 'text-white/60'
              }`}
            >
              <span className="text-base">🪙</span>
              Tokens
            </button>
            <button
              onClick={() => setTab('usdc')}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition-colors ${
                tab === 'usdc' ? 'text-white' : 'text-white/60'
              }`}
            >
              <span className="text-base">💵</span>
              USDC Exclusives
            </button>
          </div>
        </div>
      </div>

      {/* Themes Grid */}
      <div className="p-4 pb-20">
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
          {themesToShow.map((theme) => {
            const isUnlocked = unlockedThemes.includes(theme.id);
            const isSelected = selectedTheme === theme.id;
            const canAfford = tab === 'usdc' ? usdcBalance >= theme.cost : tokens >= theme.cost;

            return (
              <button
                key={theme.id}
                onClick={() => {
                  if (isUnlocked && !isSelected) {
                    setSelectedTheme(theme.id);
                  } else if (!isUnlocked && (canAfford || theme.cost === 0)) {
                    handlePurchaseClick(theme);
                  }
                }}
                disabled={isSelected || (!isUnlocked && !canAfford && theme.cost > 0)}
                className={`
                  relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all
                  ${
                    isSelected
                      ? 'border-yellow-400 shadow-xl shadow-yellow-400/20 scale-[1.02]'
                      : tab === 'usdc'
                      ? 'border-blue-500/40 hover:border-blue-400/70'
                      : 'border-purple-600/50 hover:border-purple-500/70'
                  }
                  ${!isUnlocked && !canAfford && theme.cost > 0 ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {/* USDC Badge */}
                {tab === 'usdc' && (
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

                {/* Theme Preview */}
                <div className={`h-24 w-full mb-2 rounded-xl relative ${theme.bg} ${!isUnlocked && 'opacity-40'}`}>
                  {/* Preview Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTheme(theme.id);
                    }}
                    className="absolute top-1 left-1 z-10 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white p-1.5 rounded-lg transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  
                  {!isUnlocked && theme.cost > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                      <Lock className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>

                {/* Theme Info */}
                <div className="text-center w-full mb-2">
                  <div className="font-bold text-sm text-white truncate">{theme.name}</div>
                  <div className="text-[10px] text-white/60 line-clamp-1">{theme.description}</div>
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
                        canAfford || theme.cost === 0
                          ? tab === 'usdc'
                            ? 'bg-blue-600 text-white'
                            : 'bg-pink-600 text-white'
                          : 'bg-white/5 text-white/30'
                      }`}
                    >
                      {canAfford || theme.cost === 0 ? (
                        <>
                          {tab === 'usdc' ? '💵' : '🪙'} {theme.cost === 0 ? 'FREE' : theme.cost}
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" /> {theme.cost}
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
          bgColor={selectedItem.bgColor}
        />
      )}

      {/* Theme Preview Modal */}
      {previewTheme && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewTheme(null)}
        >
          <div 
            className="relative w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const theme = [...TOKEN_THEMES, ...USDC_THEMES].find(t => t.id === previewTheme);
              if (!theme) return null;

              return (
                <div className="bg-gray-900 rounded-2xl overflow-hidden border-2 border-white/20">
                  {/* Header */}
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">{theme.name}</h3>
                        <p className="text-sm text-white/60">{theme.description}</p>
                      </div>
                      <button
                        onClick={() => setPreviewTheme(null)}
                        className="text-white/60 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Full Theme Preview */}
                  <div className={`h-96 ${theme.bg} relative`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">🎨</div>
                        <div className="text-white font-bold text-xl drop-shadow-lg">
                          {theme.name}
                        </div>
                        <div className="text-white/80 text-sm mt-2 drop-shadow-lg">
                          Full theme preview
                        </div>
                      </div>
                    </div>

                    {/* Show if theme has decorations (USDC exclusives) */}
                    {tab === 'usdc' && (
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-center">
                          <div className="text-white/90 text-xs font-bold mb-1">
                            ✨ PREMIUM THEME
                          </div>
                          <div className="text-white/70 text-[10px]">
                            Includes exclusive decorations & effects
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-4 bg-gray-800/50">
                    <button
                      onClick={() => setPreviewTheme(null)}
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
