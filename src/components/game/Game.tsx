"use client";


import { useState, useRef } from "react";
import StartScreen from "./StartScreen";
import GameScreen from "./GameScreen";
import GameOverScreen from "./GameOverScreen";
import VictoryScreen from "./VictoryScreen";
import ShopMenuScreen from "./ShopMenuScreen";
import ShopScreen from "./ShopScreen";
import ShopThemesScreen from "./ShopThemesScreen";
import GameSelectionScreen from "./GameSelectionScreen";
import ReferralsScreen from "./ReferralsScreen";
import RankingsScreen from "./RankingsScreen";
import UserProfileHub from "./UserProfileHub";
import { OnboardingTutorial } from "./OnboardingTutorial";
import { useUserGameData } from '~/hooks/useUserGameData';
import { soundManager } from '~/lib/SoundManager';
import { useEffect } from 'react';

type GameState = "start" | "game-selection" | "playing" | "gameover" | "victory" | "shop-menu" | "shop-skins" | "shop-themes" | "referrals" | "rankings" | "profile";

export default function Game() {
  const [gameState, setGameState] = useState<GameState>("start");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [finalScore, setFinalScore] = useState(0);
  const [tokensEarned, setTokensEarned] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  // Security: one-shot flag — only ONE game result (win or lose) can be rewarded per play session
  const gameResultProcessed = useRef(false);
  // Security: track the actual score the game engine reports
  const lastGameScore = useRef(0);

  // Check if tutorial has been seen
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const done = localStorage.getItem('party_land_tutorial_done') === 'true';
      if (!done) {
        // Delay to start tutorial after initial load
        setTimeout(() => setShowTutorial(true), 2500);
      }
    }
  }, []);

  const handleTutorialComplete = () => {
    localStorage.setItem('party_land_tutorial_done', 'true');
    setShowTutorial(false);
    setGameState('start'); // Just in case we ended in a shop screen
  };

  const handleTutorialStep = (step: number) => {
    // Cross-screen transitions based on tutorial step
    if (step === 3) setGameState('shop-skins');
    if (step === 4) setGameState('shop-themes');
    if (step === 5 || step === 1 || step === 2 || step === 0 || step === 6) {
      if (gameState !== 'start') setGameState('start');
    }
  };

  // Sync with SoundManager singleton
  useEffect(() => {
    soundManager.toggle(soundEnabled);
  }, [soundEnabled]);

  // Handle Background Music transitions
  useEffect(() => {
    if (gameState === 'playing') {
      soundManager.playMusic('game-theme-panther');
    } else {
      soundManager.playMusic('main-theme');
    }
  }, [gameState]);

  const {
    addTokens,
    selectedSkin,
    selectedTheme,
    fid,
  } = useUserGameData();

  // Auto-register notifications and signal readiness on mount
  useEffect(() => {
    const initSdk = async () => {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk');
        const context = await sdk.context;

        // Signal that the app is ready (removes splash screen and satisfies 'Ready' check)
        await sdk.actions.ready();

        // Solo intentamos si estamos en una mini-app y no hemos registrado ya (idempotente por el SDK)
        if (context) {
          console.log('🔔 [Game] Auto-registering notifications...');
          await sdk.actions.addFrame();
        }
      } catch (err) {
        console.error('🔔 [Game] SDK init failed:', err);
      }
    };
    initSdk();
  }, []);

  // Handlers
  const handleSelectGames = () => {
    setGameState('game-selection');
  };

  const handleSelectGame = (gameId: string) => {
    console.log(`🎮 Selected game: ${gameId}`);
    // Por ahora solo tenemos 100 Floor Drop
    if (gameId === '100-floor-drop') {
      handleStartGame();
    }
  };

  // Security: Reset the one-shot flag every time a new game starts
  const handleStartGame = () => {
    setGameState('playing');
    setTokensEarned(0);
    gameResultProcessed.current = false;
    lastGameScore.current = 0;
  };

  // Game flow
  const handleGameOver = (score: number) => {
    // Security: only process a result ONCE per game session
    if (gameResultProcessed.current) {
      console.warn('[SECURITY] handleGameOver called after result already processed – ignoring');
      return;
    }
    // Security: clamp score to physical game bounds (0-100 floors)
    const safeScore = Math.max(0, Math.min(100, Math.floor(score)));
    gameResultProcessed.current = true;
    lastGameScore.current = safeScore;

    setFinalScore(safeScore);
    setTokensEarned(safeScore);
    addTokens(safeScore, 'Game Over Reward');
    setGameState('gameover');
  };

  const handleVictory = (score: number) => {
    // Security: only process a result ONCE per game session
    if (gameResultProcessed.current) {
      console.warn('[SECURITY] handleVictory called after result already processed – ignoring');
      return;
    }
    // Security: victory score is always exactly 100 (cleared all 100 floors)
    const safeScore = Math.max(0, Math.min(100, Math.floor(score)));
    const victoryTokens = safeScore + 500;
    gameResultProcessed.current = true;
    lastGameScore.current = safeScore;

    setFinalScore(safeScore);
    setTokensEarned(victoryTokens);
    addTokens(victoryTokens, 'Victory Reward');
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
          onSelectGames={handleSelectGames}
          onOpenShop={handleOpenShop}
          onOpenReferrals={() => setGameState('referrals')}
          onOpenRankings={() => setGameState('rankings')}
          onOpenProfile={() => setGameState('profile')}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onResetTutorial={() => setShowTutorial(true)}
        />
      )}
      {gameState === 'game-selection' && (
        <GameSelectionScreen
          onSelectGame={handleSelectGame}
          onBack={() => setGameState('start')}
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
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}
      {gameState === 'shop-skins' && (
        <ShopScreen
          onBack={() => setGameState('shop-menu')}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}
      {gameState === 'shop-themes' && (
        <ShopThemesScreen
          onBack={() => setGameState('shop-menu')}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}
      {gameState === 'referrals' && (
        <ReferralsScreen
          onBack={() => setGameState('start')}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}
      {gameState === 'rankings' && (
        <RankingsScreen
          onBack={() => setGameState('start')}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          myFid={fid}
        />
      )}
      {gameState === 'profile' && (
        <UserProfileHub
          onBack={() => setGameState('start')}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* Cross-screen Onboarding Tutorial */}
      {showTutorial && (
        <OnboardingTutorial
          onComplete={handleTutorialComplete}
          onStepChange={handleTutorialStep}
        />
      )}
    </main>
  );
}
