'use client';

import { ArrowLeft, Lock, Eye, Coins, DollarSign, Palette, Sparkles, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useUserGameData } from '~/hooks/useUserGameData';
import { PurchaseModal } from './PurchaseModal';
import { drawThemeDecorations } from './ThemeDecorations';

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
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);  const canvasRef = useRef<HTMLCanvasElement>(null);  const [selectedItem, setSelectedItem] = useState<{
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
            <Palette className="w-7 h-7" /> THEME SHOP
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
              <Coins className="w-4 h-4" />
              Tokens
            </button>
            <button
              onClick={() => setTab('usdc')}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition-colors ${
                tab === 'usdc' ? 'text-white' : 'text-white/60'
              }`}
            >
              <DollarSign className="w-4 h-4" />
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
                          {tab === 'usdc' ? <DollarSign className="w-3 h-3" /> : <Coins className="w-3 h-3" />} {theme.cost === 0 ? 'FREE' : theme.cost}
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
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Theme Preview with Canvas for decorations */}
                  <ThemePreviewCanvas themeId={theme.id} themeName={theme.name} isUSDC={tab === 'usdc'} />

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

// Theme Preview Canvas Component
function ThemePreviewCanvas({ themeId, themeName, isUSDC }: { themeId: string; themeName: string; isUSDC: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getThemeColors = (theme: string) => {
    const themeMap: Record<string, { top: string; bottom: string; decorations?: string[] }> = {
      'classic-pink': { top: '#831843', bottom: '#be185d' },
      'ocean-blue': { top: '#0c4a6e', bottom: '#0369a1' },
      'forest-green': { top: '#14532d', bottom: '#15803d' },
      'sunset-orange': { top: '#7c2d12', bottom: '#c2410c' },
      'royal-purple': { top: '#581c87', bottom: '#6b21a8' },
      'fire-red': { top: '#7f1d1d', bottom: '#991b1b' },
      'cyber-neon': { top: '#164e63', bottom: '#6b21a8' },
      'golden-luxury': { top: '#713f12', bottom: '#a16207' },
      'midnight-dark': { top: '#334155', bottom: '#0f172a' },
      'candy-pop': { top: '#ec4899', bottom: '#3b82f6' },
      'toxic-slime': { top: '#65a30d', bottom: '#15803d' },
      'arctic-ice': { top: '#67e8f9', bottom: '#0ea5e9' },
      'lava-flow': { top: '#ea580c', bottom: '#18181b' },
      'galaxy-space': { top: '#312e81', bottom: '#ec4899' },
      'rainbow-dream': { top: '#ef4444', bottom: '#8b5cf6' },
      'diamond-shine': { top: '#e5e7eb', bottom: '#a78bfa' },
      'gotham-city': { top: '#232526', bottom: '#434343', decorations: ['bat-signal', 'city-silhouette'] },
      'metropolis-sky': { top: '#2563eb', bottom: '#f43f5e', decorations: ['s-symbol', 'clouds'] },
      'spider-web': { top: '#be123c', bottom: '#2563eb', decorations: ['web-pattern', 'spider'] },
      'arc-reactor': { top: '#f59e42', bottom: '#be123c', decorations: ['arc-reactor', 'tech-grid'] },
      'gamma-rage': { top: '#22d3ee', bottom: '#a21caf', decorations: ['fist', 'cracks'] },
      'asgard-thunder': { top: '#fbbf24', bottom: '#2563eb', decorations: ['hammer', 'lightning'] },
      'hogwarts-magic': { top: '#f59e42', bottom: '#be123c', decorations: ['wand', 'stars', 'castle'] },
      'the-force': { top: '#2563eb', bottom: '#be123c', decorations: ['lightsaber', 'death-star'] },
      'matrix-code': { top: '#0f2027', bottom: '#00ff99', decorations: ['green-code', 'matrix-rain'] },
      'chaotic-madness': { top: '#a21caf', bottom: '#22d3ee', decorations: ['cards', 'smile'] },
      'speed-force': { top: '#fbbf24', bottom: '#be123c', decorations: ['lightning-bolt', 'speed-lines'] },
      'merc-style': { top: '#be123c', bottom: '#0f172a', decorations: ['swords', 'logo'] },
      'amazonian-warrior': { top: '#f43f5e', bottom: '#2563eb', decorations: ['tiara', 'stars', 'lasso'] },
      'star-spangled': { top: '#2563eb', bottom: '#f43f5e', decorations: ['shield', 'star'] },
      'sonic-boom': { top: '#2563eb', bottom: '#fbbf24', decorations: ['rings', 'speed-blur'] },
      'mushroom-kingdom': { top: '#f43f5e', bottom: '#fbbf24', decorations: ['mushroom', 'coin', 'brick'] },
    };
    return themeMap[theme] || { top: '#831843', bottom: '#be185d' };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const themeColors = getThemeColors(themeId);
    
    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, themeColors.top);
    gradient.addColorStop(1, themeColors.bottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw decorations if USDC theme
    if (themeColors.decorations) {
      drawThemeDecorations(ctx, themeId, themeColors, canvas.width, canvas.height, 0);
    }

    // Add theme name overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(themeName, canvas.width / 2, canvas.height - 40);
    
    if (themeColors.decorations) {
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('Premium Theme with Decorations', canvas.width / 2, canvas.height - 15);
    }
  }, [themeId, themeName]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={384}
      className="w-full h-96"
    />
  );
}
