'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/hooks/useGame';
import { useSound } from '@/hooks/useSound';
import { AppHeader } from '@/components/layout/AppHeader';
import { GameBoard } from '@/components/game/GameBoard';
import { Dice } from '@/components/game/Dice';
import { RollButton } from '@/components/game/RollButton';
import { TurnIndicator } from '@/components/game/TurnIndicator';
import { PlayerStatusList } from '@/components/game/PlayerStatusList';
import { ExitGameDialog } from '@/components/game/ExitGameDialog';
import { WinnerPanel } from '@/components/result/WinnerPanel';
import { HowToPlayModal } from '@/components/modals/HowToPlayModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { OnlineMultiplayerModal } from '@/components/modals/OnlineMultiplayerModal';
import { Button } from '@/components/common/Button';
import { PLAYER_COLORS } from '@/lib/game/constants';
import { PlayMode } from '@/lib/game/types';
import { getPreferences, BoardTheme } from '@/lib/storage/preferences';
import {
  Users,
  Play,
  ArrowLeft,
  Bot,
  User,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

type ScreenView = 'home' | 'setup' | 'game';

export default function HomePage() {
  const [currentView, setCurrentView] = useState<ScreenView>('home');
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [diceDotColor, setDiceDotColor] = useState<string>('#6558E8');
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('vintage-paper');

  // Load preferences
  useEffect(() => {
    const prefs = getPreferences();
    setDiceDotColor(prefs.diceDotColor || '#6558E8');
    setBoardTheme(prefs.boardTheme || 'vintage-paper');
  }, []);

  // Setup state
  const [gameMode, setGameMode] = useState<PlayMode>('vs-computer');
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);
  const [playerNames, setPlayerNames] = useState<string[]>([
    'You',
    'Robo 🤖',
    'Rocky 🤖',
    'Ziggy 🤖',
  ]);
  const [requireSixToStart, setRequireSixToStart] = useState(true);
  const [exactRollToFinish, setExactRollToFinish] = useState(true);
  const [extraTurnOnSix, setExtraTurnOnSix] = useState(false);

  // Game hook
  const {
    gameState,
    isRolling,
    isMoving,
    displayedDice,
    handleRollDice,
    startGame,
    restartCurrentGame,
  } = useGame();

  // Sound hook
  const { isMuted, toggleMute, playClick } = useSound();

  // Navigation handlers
  const handleStartGame = () => {
    const defaultBotNames = ['Robo 🤖', 'Rocky 🤖', 'Ziggy 🤖'];

    const selectedNames = playerNames.slice(0, playerCount).map((name, i) => {
      const trimmed = name.trim();
      if (trimmed.length > 0) return trimmed.slice(0, 16);
      return gameMode === 'vs-computer'
        ? i === 0
          ? 'You'
          : defaultBotNames[i - 1] || `Bot ${i}`
        : `Player ${i + 1}`;
    });

    const botFlags = Array.from({ length: playerCount }).map((_, i) =>
      gameMode === 'vs-computer' ? i > 0 : false
    );

    startGame(
      selectedNames,
      {
        mode: gameMode,
        playerCount,
        requireSixToStart,
        exactRollToFinish,
        extraTurnOnSix,
      },
      botFlags
    );
    setCurrentView('game');
  };

  const handleNameChange = (index: number, val: string) => {
    setPlayerNames((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const handleModeChange = (mode: PlayMode) => {
    playClick();
    setGameMode(mode);
    if (mode === 'vs-computer') {
      setPlayerNames(['You', 'Robo 🤖', 'Rocky 🤖', 'Ziggy 🤖']);
    } else {
      setPlayerNames(['Player 1', 'Player 2', 'Player 3', 'Player 4']);
    }
  };

  const currentPlayer =
    gameState.players[gameState.currentPlayerIndex] || gameState.players[0];
  const winner = gameState.players.find((p) => p.id === gameState.winnerId);
  const isBotTurn = Boolean(currentPlayer?.isBot);

  return (
    <main className="min-h-screen flex flex-col items-center justify-between bg-[#FFF8EF] pb-6 px-2 sm:px-4">
      {/* Universal App Header */}
      <AppHeader
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onOpenHowToPlay={() => setShowHowToPlay(true)}
        onOpenSettings={() => setShowSettings(true)}
        showHomeButton={currentView !== 'home'}
        onHomeClick={() => {
          if (currentView === 'game' && gameState.status === 'playing') {
            setShowExitConfirm(true);
          } else {
            setCurrentView('home');
          }
        }}
      />

      {/* Screen 1: Home Screen */}
      {currentView === 'home' && (
        <div className="w-full max-w-lg mx-auto flex-1 flex flex-col items-center justify-center py-4 px-4 text-center">
          {/* Hero Logo & Badge */}
          <div className="relative mb-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#6558E8] via-[#7F74F6] to-[#A298FA] flex items-center justify-center text-5xl sm:text-6xl shadow-xl shadow-[#6558E8]/30 mx-auto select-none">
              🎲
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#FFB84D] text-[#4A3200] font-black text-xs px-3 py-1 rounded-full shadow-md">
              100 SQUARES
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#25233A] tracking-tight mb-2">
            Snakes &amp; Ladders
          </h1>
          <p className="text-sm sm:text-base text-[#77758A] max-w-xs mx-auto mb-8 font-medium">
            The beloved board game adventure made for quick, joyful mobile play.
          </p>

          {/* Action cards */}
          <div className="w-full space-y-3.5 mb-8">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                playClick();
                setGameMode('vs-computer');
                setCurrentView('setup');
              }}
              className="flex items-center justify-center gap-3 text-lg py-4 shadow-lg shadow-[#6558E8]/30"
            >
              <Bot className="w-6 h-6 fill-current" />
              <span>Play vs Robo 🤖</span>
            </Button>

            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => {
                playClick();
                setGameMode('pass-and-play');
                setCurrentView('setup');
              }}
              className="flex items-center justify-center gap-3 text-base py-3.5"
            >
              <Users className="w-5 h-5 text-[#6558E8]" />
              <span>Pass &amp; Play (Friends)</span>
            </Button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-3 gap-2 w-full max-w-sm pt-2">
            <div className="p-3 bg-white rounded-2xl border border-[#E9E2D9] text-center shadow-sm">
              <span className="text-lg block mb-1">🤖</span>
              <span className="text-xs font-bold text-[#25233A] block">Auto Bot</span>
              <span className="text-[10px] text-[#77758A]">Smart AI</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-[#E9E2D9] text-center shadow-sm">
              <span className="text-lg block mb-1">🎲</span>
              <span className="text-xs font-bold text-[#25233A] block">Custom 3D</span>
              <span className="text-[10px] text-[#77758A]">Choose colors</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-[#E9E2D9] text-center shadow-sm">
              <span className="text-lg block mb-1">🪜</span>
              <span className="text-xs font-bold text-[#25233A] block">Classic Rules</span>
              <span className="text-[10px] text-[#77758A]">Customizable</span>
            </div>
          </div>
        </div>
      )}

      {/* Screen 2: Game Setup Screen */}
      {currentView === 'setup' && (
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-start py-2 px-3">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => {
                playClick();
                setCurrentView('home');
              }}
              className="w-10 h-10 rounded-2xl bg-white border border-[#E9E2D9] flex items-center justify-center text-[#25233A] hover:bg-[#F9F5EF] active:scale-95 transition-all shadow-sm"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl sm:text-2xl font-black text-[#25233A]">
              Set up your game
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#E9E2D9] shadow-sm space-y-5">
            {/* Game Mode Selector */}
            <div>
              <label className="text-xs font-bold text-[#77758A] uppercase tracking-wider block mb-2">
                Game Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleModeChange('vs-computer')}
                  className={`h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    gameMode === 'vs-computer'
                      ? 'bg-[#6558E8] text-white shadow-md shadow-[#6558E8]/25'
                      : 'bg-[#FFF8EF] text-[#25233A] border border-[#E9E2D9] hover:bg-gray-100'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  <span>vs Computer 🤖</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('pass-and-play')}
                  className={`h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    gameMode === 'pass-and-play'
                      ? 'bg-[#6558E8] text-white shadow-md shadow-[#6558E8]/25'
                      : 'bg-[#FFF8EF] text-[#25233A] border border-[#E9E2D9] hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Pass &amp; Play</span>
                </button>
              </div>
            </div>

            {/* Player count selector */}
            <div>
              <label className="text-xs font-bold text-[#77758A] uppercase tracking-wider block mb-2">
                {gameMode === 'vs-computer' ? 'Total Players (You + Opponents)' : 'Number of Players'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([2, 3, 4] as const).map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => {
                      playClick();
                      setPlayerCount(cnt);
                    }}
                    className={`h-12 rounded-2xl font-black text-base flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                      playerCount === cnt
                        ? 'bg-[#6558E8] text-white shadow-md shadow-[#6558E8]/25'
                        : 'bg-[#FFF8EF] text-[#25233A] border border-[#E9E2D9] hover:bg-gray-100'
                    }`}
                  >
                    <span>{cnt} Players</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Player names & customizable inputs */}
            <div>
              <label className="text-xs font-bold text-[#77758A] uppercase tracking-wider block mb-2">
                Customize Player Names
              </label>
              <div className="space-y-2.5">
                {Array.from({ length: playerCount }).map((_, idx) => {
                  const color = PLAYER_COLORS[idx % PLAYER_COLORS.length];
                  const isBot = gameMode === 'vs-computer' && idx > 0;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-1.5 bg-[#FFF8EF] rounded-2xl border border-[#E9E2D9] focus-within:border-[#6558E8] focus-within:bg-white transition-all"
                    >
                      <div
                        style={{ backgroundColor: color.bgHex }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-sm shrink-0 border border-white"
                      >
                        {isBot ? <Bot className="w-5 h-5" /> : idx + 1}
                      </div>
                      <input
                        type="text"
                        maxLength={16}
                        value={playerNames[idx]}
                        onChange={(e) => handleNameChange(idx, e.target.value)}
                        placeholder={
                          idx === 0
                            ? 'Your Name'
                            : isBot
                            ? `Opponent ${idx} 🤖`
                            : `Player ${idx + 1}`
                        }
                        className="flex-1 bg-transparent border-none text-sm font-bold text-[#25233A] focus:outline-none px-1"
                      />
                      <span className="text-[11px] font-semibold text-[#77758A] pr-2">
                        {idx === 0 ? 'You (Human)' : isBot ? 'Auto Bot 🤖' : 'Player'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rule options */}
            <div className="pt-2 border-t border-[#E9E2D9]/70 space-y-2.5">
              <label className="text-xs font-bold text-[#77758A] uppercase tracking-wider block">
                Rule Options
              </label>

              {/* Six to start */}
              <div
                onClick={() => setRequireSixToStart(!requireSixToStart)}
                className="flex items-center justify-between p-2.5 bg-[#FFF8EF] rounded-xl border border-[#E9E2D9] cursor-pointer hover:bg-[#FAF4EB]"
              >
                <div>
                  <span className="font-bold text-xs text-[#25233A] block">
                    Roll 6 to Enter Board
                  </span>
                  <span className="text-[10px] text-[#77758A]">
                    Token stays in yard until rolling 6
                  </span>
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    requireSixToStart ? 'bg-[#6558E8] text-white' : 'border border-gray-300 bg-white'
                  }`}
                >
                  {requireSixToStart && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </div>

              {/* Exact roll to finish */}
              <div
                onClick={() => setExactRollToFinish(!exactRollToFinish)}
                className="flex items-center justify-between p-2.5 bg-[#FFF8EF] rounded-xl border border-[#E9E2D9] cursor-pointer hover:bg-[#FAF4EB]"
              >
                <div>
                  <span className="font-bold text-xs text-[#25233A] block">
                    Exact Roll to Win (100)
                  </span>
                  <span className="text-[10px] text-[#77758A]">
                    Overshooting bounces or stays
                  </span>
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    exactRollToFinish ? 'bg-[#6558E8] text-white' : 'border border-gray-300 bg-white'
                  }`}
                >
                  {exactRollToFinish && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </div>

              {/* Extra turn on 6 */}
              <div
                onClick={() => setExtraTurnOnSix(!extraTurnOnSix)}
                className="flex items-center justify-between p-2.5 bg-[#FFF8EF] rounded-xl border border-[#E9E2D9] cursor-pointer hover:bg-[#FAF4EB]"
              >
                <div>
                  <span className="font-bold text-xs text-[#25233A] block">
                    Bonus Roll on 6
                  </span>
                  <span className="text-[10px] text-[#77758A]">
                    Rolling a 6 grants another turn
                  </span>
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    extraTurnOnSix ? 'bg-[#6558E8] text-white' : 'border border-gray-300 bg-white'
                  }`}
                >
                  {extraTurnOnSix && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {/* Launch button */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleStartGame}
                className="py-3.5 text-base shadow-lg shadow-[#6558E8]/30"
              >
                Start Playing Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Screen 3: Game Room Screen */}
      {currentView === 'game' && (
        <div className="w-full max-w-lg mx-auto flex-1 flex flex-col items-center justify-between gap-3 py-1">
          {/* Turn status banner */}
          <TurnIndicator
            currentPlayer={currentPlayer}
            isRolling={isRolling}
            isMoving={isMoving}
            lastMessage={gameState.lastEvent?.text}
          />

          {/* 10x10 Board */}
          <GameBoard gameState={gameState} boardTheme={boardTheme} />

          {/* Interactive Action Area: Real 3D Dice & Roll Button */}
          <div className="w-full flex items-center justify-center gap-4 py-1">
            <Dice
              value={displayedDice ?? gameState.diceValue}
              isRolling={isRolling}
              onClick={handleRollDice}
              dotColor={diceDotColor}
              disabled={
                isRolling ||
                isMoving ||
                isBotTurn ||
                gameState.status === 'finished'
              }
            />
            <div className="flex-1 max-w-xs">
              <RollButton
                onRoll={handleRollDice}
                disabled={
                  isRolling ||
                  isMoving ||
                  gameState.status === 'finished'
                }
                isRolling={isRolling}
                isMoving={isMoving}
                isBotTurn={isBotTurn}
                botName={currentPlayer.name}
              />
              {gameState.lastEvent && (
                <p className="text-[11px] font-semibold text-[#77758A] mt-1.5 text-center line-clamp-1">
                  {gameState.lastEvent.text}
                </p>
              )}
            </div>
          </div>

          {/* Player status strip */}
          <PlayerStatusList
            players={gameState.players}
            currentPlayerIndex={gameState.currentPlayerIndex}
          />
        </div>
      )}

      {/* Modals & Dialogs */}
      {gameState.status === 'finished' && winner && (
        <WinnerPanel
          winner={winner}
          players={gameState.players}
          onPlayAgain={restartCurrentGame}
          onHome={() => setCurrentView('home')}
        />
      )}

      <ExitGameDialog
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirmExit={() => {
          setShowExitConfirm(false);
          setCurrentView('home');
        }}
      />

      <HowToPlayModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChanged={() => {
          const updated = getPreferences();
          setDiceDotColor(updated.diceDotColor);
          setBoardTheme(updated.boardTheme);
        }}
      />

      <OnlineMultiplayerModal
        isOpen={showOnlineModal}
        onClose={() => setShowOnlineModal(false)}
      />
    </main>
  );
}
