"use client";

import { useState } from "react";
import StartScreen from "./StartScreen";
import GameScreen from "./GameScreen";
import GameOverScreen from "./GameOverScreen";
import VictoryScreen from "./VictoryScreen";
import ShopMenuScreen from "./ShopMenuScreen";
import ShopScreen from "./ShopScreen";
import ShopThemesScreen from "./ShopThemesScreen";
import { useUserGameData } from '~/hooks/useUserGameData';

// Game state type
type GameState = "start" | "playing" | "gameover" | "victory" | "shop-menu" | "shop-skins" | "shop-themes";

export default function Game() {
  const [gameState, setGameState] = useState<GameState>("start");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [finalScore, setFinalScore] = useState(0);
  const [tokensEarned, setTokensEarned] = useState(0);

  const {
    setTokens,
    selectedSkin,
    selectedTheme,
  } = useUserGameData();

  // Handlers
  const handleStartGame = () => {
    setGameState('playing');
    setTokensEarned(0);
  };

  // Game flow
  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setTokensEarned(score);
    setTokens(prev => prev + score);
    setGameState('gameover');
  };

  const handleVictory = (score: number) => {
    setFinalScore(score);
    setTokensEarned(score + 500);
    setTokens(prev => prev + score + 500);
    setGameState('victory');
  };

  const handleRestart = () => {
    setGameState('playing');
    setTokensEarned(0);
  };

  const handleOpenShop = () => {
    console.log('✅ Opening shop menu!');
    setGameState('shop-menu');
  };

  const handleOpenSkins = () => {
    console.log('✅ Opening skins shop!');
    setGameState('shop-skins');
  };

  const handleOpenThemes = () => {
    console.log('✅ Opening themes shop!');
    setGameState('shop-themes');
  };

  const handleCloseShop = () => {
    console.log('✅ Closing shop, back to start');
    setGameState('start');
  };

  const handleToggleSound = () => setSoundEnabled((s) => !s);

  return (
    <main className="min-h-screen">
      {gameState === "start" && (
        <StartScreen
          onStart={handleStartGame}
          onOpenShop={handleOpenShop}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}
      {gameState === 'playing' && (
        <GameScreen
          onGameOver={handleGameOver}
          onVictory={handleVictory}
          soundEnabled={soundEnabled}
          selectedSkin={selectedSkin}
          selectedTheme={selectedTheme}
        />
      )}
      {gameState === 'gameover' && (
        <GameOverScreen
          score={finalScore}
          tokensEarned={tokensEarned}
          onRestart={handleRestart}
          onBackToMenu={() => setGameState('start')}
          selectedSkin={selectedSkin}
        />
      )}
      {gameState === 'victory' && (
        <VictoryScreen
          score={finalScore}
          tokensEarned={tokensEarned}
          onRestart={handleRestart}
          onBackToMenu={() => setGameState('start')}
          selectedSkin={selectedSkin}
        />
      )}
      {gameState === 'shop-menu' && (
        <ShopMenuScreen
          onSelectSkins={handleOpenSkins}
          onSelectThemes={handleOpenThemes}
          onBack={handleCloseShop}
        />
      )}
      {gameState === 'shop-skins' && (
        <ShopScreen onBack={() => setGameState('shop-menu')} />
      )}
      {gameState === 'shop-themes' && (
        <ShopThemesScreen onBack={() => setGameState('shop-menu')} />
      )}
    </main>
  );
}
