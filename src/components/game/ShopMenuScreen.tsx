'use client';

import { ArrowLeft, Shirt, Palette, ShoppingBag, Coins, DollarSign, Lightbulb } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { useUserGameData } from '~/hooks/useUserGameData';

interface ShopMenuScreenProps {
  onSelectSkins: () => void;
  onSelectThemes: () => void;
  onBack: () => void;
}

export default function ShopMenuScreen({
  onSelectSkins,
  onSelectThemes,
  onBack,
}: ShopMenuScreenProps) {
  const { tokens, usdcBalance } = useUserGameData();
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="w-full h-full"
          style={{ backgroundImage: "radial-gradient(#ff69b4 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-pink-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="font-bold">Back</span>
          </button>
        </div>

        <div className="px-4 pb-4">
          <h1 className="text-4xl font-black text-yellow-300 text-center drop-shadow-lg mb-2 flex items-center justify-center gap-2">
            <ShoppingBag className="w-9 h-9" /> SHOP
          </h1>
          <p className="text-white/80 text-center text-sm">
            Customize your game
          </p>
        </div>

        {/* Token Badges */}
        <div className="flex justify-center gap-3 px-4 mb-8">
          <div className="flex items-center gap-2 bg-purple-800/80 px-4 py-2 rounded-full border-2 border-pink-500/40 shadow-lg backdrop-blur-sm">
            <Coins className="w-5 h-5 text-pink-400" />
            <span className="font-bold text-xl text-pink-400">{tokens}</span>
          </div>
          <div className="flex items-center gap-2 bg-purple-800/80 px-4 py-2 rounded-full border-2 border-blue-500/40 shadow-lg backdrop-blur-sm">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-xl text-blue-400">{usdcBalance.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Menu Buttons */}
      <div className="relative z-10 flex flex-col gap-6 px-4 max-w-md mx-auto">
        {/* SKINS Button */}
        <button
          onClick={onSelectSkins}
          className="relative group p-6 rounded-3xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-2 border-white/20 overflow-hidden shadow-2xl"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600/90 to-purple-800/90 opacity-100 transition-all duration-300" />

          {/* Hover Glow */}
          <div className="absolute inset-0 bg-pink-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative flex items-center gap-6 z-10">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border-2 border-white/20 shadow-inner group-hover:bg-white/20 transition-colors">
              <Shirt className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>

            <div className="flex flex-col text-left flex-1">
              <div className="text-2xl font-black text-white tracking-wide mb-1">SKINS</div>
              <div className="text-sm text-white/90 font-medium">Customize your panther</div>
            </div>

            {/* Arrow Icon */}
            <div className="opacity-60 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
              <ArrowLeft className="rotate-180 w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </button>

        {/* THEMES Button */}
        <button
          onClick={onSelectThemes}
          className="relative group p-6 rounded-3xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-2 border-white/20 overflow-hidden shadow-2xl"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-cyan-800/90 opacity-100 transition-all duration-300" />

          {/* Hover Glow */}
          <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative flex items-center gap-6 z-10">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border-2 border-white/20 shadow-inner group-hover:bg-white/20 transition-colors">
              <Palette className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>

            <div className="flex flex-col text-left flex-1">
              <div className="text-2xl font-black text-white tracking-wide mb-1">THEMES</div>
              <div className="text-sm text-white/90 font-medium">Personalize your world</div>
            </div>

            {/* Arrow Icon */}
            <div className="opacity-60 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
              <ArrowLeft className="rotate-180 w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </button>

        {/* Info Text */}
        <div className="mt-4 bg-purple-800/40 backdrop-blur-sm rounded-2xl p-4 border-2 border-pink-500/30">
          <p className="text-white/90 text-sm text-center flex items-center justify-center gap-2">
            <Lightbulb className="w-4 h-4" /> Earn tokens by playing and unlock exclusive items with USDC!
          </p>
        </div>
      </div>
    </div>
  );
}
