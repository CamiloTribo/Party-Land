"use client";

import { useState } from "react";
import StartScreen from "./StartScreen";
import GameScreen from "./GameScreen";
import GameOverScreen from "./GameOverScreen";
import VictoryScreen from "./VictoryScreen";
import ShopScreen from "./ShopScreen";
import { useUserGameData } from '~/hooks/useUserGameData';

// Game state type
type GameState = "start" | "playing" | "gameover" | "victory" | "shop";

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
    console.log('✅ Opening shop!');
    setGameState('shop');
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
      {gameState === 'shop' && (
        <ShopScreen onBack={handleCloseShop} />
      )}
    </main>
  );
}
