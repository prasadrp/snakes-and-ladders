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
import { PLAYER_COLORS } from '@/lib/game/constants';
import { PlayMode } from '@/lib/game/types';
import { getPreferences, BoardTheme } from '@/lib/storage/preferences';
import {
  Users,
  ArrowLeft,
  Bot,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Gamepad2,
  Globe,
  KeyRound,
  Play,
  RotateCcw,
} from 'lucide-react';

type ScreenView = 'home' | 'create-room' | 'join-room' | 'room-lobby' | 'setup' | 'game';

export default function HomePage() {
  const [currentView, setCurrentView] = useState<ScreenView>('home');
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [diceDotColor, setDiceDotColor] = useState<string>('#6558E8');
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('vintage-paper');

  // Online Room State
  const [onlineHostName, setOnlineHostName] = useState('You');
  const [onlineJoinName, setOnlineJoinName] = useState('Player 2');
  const [enteredRoomCode, setEnteredRoomCode] = useState('');
  const [activeRoomCode, setActiveRoomCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [roomLobbyPlayers, setRoomLobbyPlayers] = useState<string[]>([]);

  // Load preferences
  useEffect(() => {
    const prefs = getPreferences();
    setDiceDotColor(prefs.diceDotColor || '#6558E8');
    setBoardTheme(prefs.boardTheme || 'vintage-paper');
  }, []);

  // Offline Setup state
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

  // Start Offline / Custom Game
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

  // Create Room Action
  const handleCreateRoom = () => {
    const code = `LADDER-${Math.floor(1000 + Math.random() * 9000)}`;
    const host = onlineHostName.trim() || 'You';
    setActiveRoomCode(code);
    setRoomLobbyPlayers([host, 'Robo 🤖']);
    setCurrentView('room-lobby');
  };

  // Join Room Action
  const handleJoinRoom = () => {
    const code = enteredRoomCode.trim() || 'LADDER-88';
    const guest = onlineJoinName.trim() || 'Player 2';
    setActiveRoomCode(code);
    setRoomLobbyPlayers(['Host Player', guest]);
    setCurrentView('room-lobby');
  };

  // Launch Room Game from Lobby
  const handleStartLobbyGame = () => {
    startGame(
      roomLobbyPlayers,
      {
        mode: 'pass-and-play',
        playerCount: roomLobbyPlayers.length as 2 | 3 | 4,
        requireSixToStart,
        exactRollToFinish,
        extraTurnOnSix,
      },
      roomLobbyPlayers.map((name) => name.includes('🤖'))
    );
    setCurrentView('game');
  };

  const handleCopyCode = () => {
    playClick();
    if (activeRoomCode) {
      navigator.clipboard.writeText(activeRoomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
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
    <main className="min-h-screen flex flex-col items-center justify-between bg-[#FFF8EF] bg-[radial-gradient(#E8DFD5_1.5px,transparent_1.5px)] [background-size:24px_24px] pb-6 px-3 sm:px-4">
      {/* Universal App Header with sound and settings */}
      <AppHeader
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onOpenHowToPlay={() => setShowHowToPlay(true)}
        onOpenSettings={() => setShowSettings(true)}
        minimal={currentView === 'home'}
        showHomeButton={currentView !== 'home'}
        onHomeClick={() => {
          if (currentView === 'game' && gameState.status === 'playing') {
            setShowExitConfirm(true);
          } else {
            setCurrentView('home');
          }
        }}
      />

      {/* ========================================================
          SCREEN 1: HOME SCREEN (Custom Casual Game Theme)
         ======================================================== */}
      {currentView === 'home' && (
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col items-center justify-center py-4 px-2 text-center animate-fadeIn">
          {/* Hero Branding Badge */}
          <div className="relative mb-3 flex flex-col items-center select-none">
            {/* Animated 3D Game Dice Badge */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#6558E8] via-[#7F74F6] to-[#A298FA] flex items-center justify-center text-5xl sm:text-6xl shadow-xl shadow-[#6558E8]/35 border-4 border-white transform hover:rotate-6 transition-all duration-300">
                🎲
              </div>
              <div className="absolute -top-2 -right-2 bg-[#FFB84D] text-[#4A3200] font-black text-[11px] px-2.5 py-1 rounded-full shadow-md border-2 border-white flex items-center gap-1">
                <span>⭐</span>
                <span>100 TILES</span>
              </div>
            </div>

            {/* Title with Gaming Typography */}
            <h1 className="text-3xl sm:text-4xl font-heading text-[#25233A] tracking-wide mt-4 mb-1 drop-shadow-xs">
              SNAKES &amp; LADDERS
            </h1>
            <p className="text-xs sm:text-sm font-bold text-[#77758A] max-w-xs mx-auto">
              Classic Board Adventure with Real 3D Dice
            </p>

            {/* Quick feature tags */}
            <div className="flex items-center justify-center gap-1.5 mt-2.5 select-none flex-wrap">
              <span className="text-[10px] font-extrabold bg-[#6558E8]/10 text-[#6558E8] px-2.5 py-0.5 rounded-full border border-[#6558E8]/20">
                🤖 AI Robo
              </span>
              <span className="text-[10px] font-extrabold bg-[#FFB84D]/20 text-[#B45309] px-2.5 py-0.5 rounded-full border border-[#FFB84D]/30">
                🎲 3D Physics
              </span>
              <span className="text-[10px] font-extrabold bg-[#10B981]/15 text-[#047857] px-2.5 py-0.5 rounded-full border border-[#10B981]/25">
                📜 Vintage Paper
              </span>
            </div>
          </div>

          {/* Mode Selection Cards */}
          <div className="w-full space-y-3.5 my-4">
            {/* CARD 1: Play vs Robo 🤖 (Solo vs Computer) */}
            <div
              onClick={() => {
                playClick();
                handleModeChange('vs-computer');
                setCurrentView('setup');
              }}
              className="group cursor-pointer w-full p-4 rounded-3xl bg-gradient-to-r from-[#6558E8] to-[#7C3AED] text-white shadow-[0_6px_0_#4338CA] hover:shadow-[0_4px_0_#4338CA] hover:translate-y-0.5 active:translate-y-1.5 active:shadow-[0_1px_0_#4338CA] transition-all border-2 border-white/20 text-left relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-3xl shadow-sm shrink-0">
                    🤖
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-xl sm:text-2xl text-white tracking-wide">
                        Play vs Robo
                      </span>
                      <span className="text-[10px] font-black bg-[#FFB84D] text-[#4A3200] px-2 py-0.5 rounded-md shadow-xs">
                        QUICK
                      </span>
                    </div>
                    <p className="text-xs text-white/85 font-medium mt-0.5">
                      Single player vs smart AI with auto-dice rolls
                    </p>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/25 flex items-center justify-center text-white shrink-0 group-hover:translate-x-1 transition-transform">
                  <Play className="w-5 h-5 fill-current" />
                </div>
              </div>
            </div>

            {/* CARD 2: Pass & Play (Friends on same device) */}
            <div
              onClick={() => {
                playClick();
                handleModeChange('pass-and-play');
                setCurrentView('setup');
              }}
              className="group cursor-pointer w-full p-4 rounded-3xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-[0_6px_0_#047857] hover:shadow-[0_4px_0_#047857] hover:translate-y-0.5 active:translate-y-1.5 active:shadow-[0_1px_0_#047857] transition-all border-2 border-white/20 text-left relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-3xl shadow-sm shrink-0">
                    👥
                  </div>
                  <div>
                    <span className="font-heading text-xl sm:text-2xl text-white tracking-wide block">
                      Pass &amp; Play
                    </span>
                    <p className="text-xs text-white/85 font-medium mt-0.5">
                      2 to 4 friends taking turns on one screen
                    </p>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/25 flex items-center justify-center text-white shrink-0 group-hover:translate-x-1 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* CARD 3: Multiplayer Rooms (Create or Join via Code) */}
            <div className="w-full p-4 rounded-3xl bg-white border-2 border-[#E9E2D9] shadow-[0_6px_0_#DCD3C7] text-left">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-xl">🌐</span>
                <span className="font-heading text-lg text-[#25233A] tracking-wide">
                  Play with Code
                </span>
                <span className="text-[10px] font-extrabold bg-[#6558E8]/10 text-[#6558E8] px-2 py-0.5 rounded-md ml-auto">
                  ROOMS
                </span>
              </div>
              <p className="text-xs text-[#77758A] font-medium mb-3">
                Create a private game room code or enter a code from friends:
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setCurrentView('create-room');
                  }}
                  className="py-3 px-3 rounded-2xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-heading text-sm tracking-wide shadow-[0_4px_0_#B91C1C] active:translate-y-1 active:shadow-[0_1px_0_#B91C1C] transition-all flex items-center justify-center gap-1.5 select-none"
                >
                  <Globe className="w-4 h-4" />
                  <span>Create Room</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setCurrentView('join-room');
                  }}
                  className="py-3 px-3 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-heading text-sm tracking-wide shadow-[0_4px_0_#115E59] active:translate-y-1 active:shadow-[0_1px_0_#115E59] transition-all flex items-center justify-center gap-1.5 select-none"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Join Code</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SCREEN 2: CREATE ROOM (Theme Integrated)
         ======================================================== */}
      {currentView === 'create-room' && (
        <div className="w-full max-w-sm mx-auto flex-1 flex flex-col items-center justify-center py-4 px-2 animate-fadeIn">
          <div className="w-full bg-white rounded-3xl p-6 sm:p-7 shadow-[0_10px_25px_rgba(0,0,0,0.05)] border-2 border-[#E9E2D9] text-center">
            {/* Header Icon */}
            <div className="w-14 h-14 rounded-2xl bg-[#EF4444]/10 border-2 border-[#EF4444]/30 text-[#EF4444] flex items-center justify-center text-3xl mx-auto mb-3 shadow-xs">
              🌐
            </div>

            <h2 className="text-2xl sm:text-3xl font-heading text-[#25233A] mb-1">
              Create Room
            </h2>
            <p className="text-xs font-semibold text-[#77758A] mb-5">
              Host your own game room &amp; invite players
            </p>

            {/* Input Form */}
            <div className="w-full text-left mb-6">
              <label className="text-xs font-bold text-[#77758A] tracking-wider block mb-2 uppercase">
                YOUR NAME
              </label>
              <input
                type="text"
                maxLength={20}
                value={onlineHostName}
                onChange={(e) => setOnlineHostName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#E9E2D9] focus:border-[#EF4444] focus:outline-none text-[#25233A] font-bold text-base placeholder:text-[#94A3B8] transition-all bg-[#FFF8EF]"
              />
            </div>

            {/* Actions */}
            <div className="w-full space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  handleCreateRoom();
                }}
                className="w-full py-3.5 rounded-2xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-heading text-lg tracking-wide shadow-[0_5px_0_#B91C1C] active:translate-y-1 active:shadow-[0_1px_0_#B91C1C] transition-all flex items-center justify-center gap-2 select-none"
              >
                <span>🚀</span>
                <span>Create Room</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClick();
                  setCurrentView('home');
                }}
                className="w-full py-3 rounded-2xl bg-white hover:bg-gray-50 text-[#25233A] font-bold text-sm border-2 border-[#E9E2D9] shadow-[0_3px_0_#E9E2D9] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 select-none"
              >
                <span>← Back</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SCREEN 3: JOIN WITH CODE (Theme Integrated)
         ======================================================== */}
      {currentView === 'join-room' && (
        <div className="w-full max-w-sm mx-auto flex-1 flex flex-col items-center justify-center py-4 px-2 animate-fadeIn">
          <div className="w-full bg-white rounded-3xl p-6 sm:p-7 shadow-[0_10px_25px_rgba(0,0,0,0.05)] border-2 border-[#E9E2D9] text-center">
            {/* Key Icon */}
            <div className="w-14 h-14 rounded-2xl bg-[#0D9488]/10 border-2 border-[#0D9488]/30 text-[#0D9488] flex items-center justify-center text-3xl mx-auto mb-3 shadow-xs">
              🔑
            </div>

            <h2 className="text-2xl sm:text-3xl font-heading text-[#25233A] mb-1">
              Join with Code
            </h2>
            <p className="text-xs font-semibold text-[#77758A] mb-5">
              Enter room code shared by your friend
            </p>

            {/* Inputs */}
            <div className="w-full text-left space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-[#77758A] tracking-wider block mb-2 uppercase">
                  YOUR NAME
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={onlineJoinName}
                  onChange={(e) => setOnlineJoinName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#E9E2D9] focus:border-[#0D9488] focus:outline-none text-[#25233A] font-bold text-base placeholder:text-[#94A3B8] transition-all bg-[#FFF8EF]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#77758A] tracking-wider block mb-2 uppercase">
                  ROOM CODE
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={enteredRoomCode}
                  onChange={(e) => setEnteredRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. LADDER-88"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#E9E2D9] focus:border-[#0D9488] focus:outline-none text-[#25233A] font-mono font-bold text-base tracking-wider placeholder:text-[#94A3B8] transition-all uppercase bg-[#FFF8EF]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="w-full space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  handleJoinRoom();
                }}
                className="w-full py-3.5 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-heading text-lg tracking-wide shadow-[0_5px_0_#115E59] active:translate-y-1 active:shadow-[0_1px_0_#115E59] transition-all flex items-center justify-center gap-2 select-none"
              >
                <span>🎮</span>
                <span>Join Game</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClick();
                  setCurrentView('home');
                }}
                className="w-full py-3 rounded-2xl bg-white hover:bg-gray-50 text-[#25233A] font-bold text-sm border-2 border-[#E9E2D9] shadow-[0_3px_0_#E9E2D9] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 select-none"
              >
                <span>← Back</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SCREEN 4: ROOM LOBBY
         ======================================================== */}
      {currentView === 'room-lobby' && (
        <div className="w-full max-w-sm mx-auto flex-1 flex flex-col items-center justify-center py-4 px-2 animate-fadeIn">
          <div className="w-full bg-white rounded-3xl p-6 sm:p-7 shadow-[0_10px_25px_rgba(0,0,0,0.05)] border-2 border-[#E9E2D9] text-center">
            <div className="w-13 h-13 rounded-2xl bg-[#6558E8]/10 text-[#6558E8] flex items-center justify-center text-3xl mx-auto mb-2 shadow-xs">
              🎲
            </div>

            <h2 className="text-2xl font-heading text-[#25233A] mb-1">
              Room Lobby
            </h2>
            <p className="text-xs font-semibold text-[#77758A] mb-4">
              Share code with friends to join!
            </p>

            {/* Room Code Box */}
            <div className="w-full p-3.5 bg-[#FFF8EF] rounded-2xl border-2 border-[#E9E2D9] flex items-center justify-between mb-4">
              <div className="text-left">
                <span className="text-[10px] font-black text-[#77758A] block uppercase tracking-wider">
                  Room Code
                </span>
                <span className="font-mono font-black text-xl text-[#25233A] tracking-wider">
                  {activeRoomCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3.5 py-2 rounded-xl bg-white border-2 border-[#E9E2D9] text-[#25233A] font-bold text-xs flex items-center gap-1.5 shadow-xs hover:bg-gray-50 active:scale-95 transition-all"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Players in Room */}
            <div className="w-full text-left mb-5">
              <span className="text-[11px] font-black text-[#77758A] tracking-wider block mb-2 uppercase">
                Players in Room ({roomLobbyPlayers.length}/4)
              </span>
              <div className="space-y-2">
                {roomLobbyPlayers.map((name, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF8EF] border border-[#E9E2D9]"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        style={{ backgroundColor: PLAYER_COLORS[idx % PLAYER_COLORS.length].bgHex }}
                        className="w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center shadow-xs"
                      >
                        {idx + 1}
                      </div>
                      <span className="text-sm font-bold text-[#25233A]">{name}</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      READY
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lobby actions */}
            <div className="w-full space-y-2">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  handleStartLobbyGame();
                }}
                className="w-full py-3.5 rounded-2xl bg-[#6558E8] hover:bg-[#5245DC] text-white font-heading text-lg tracking-wide shadow-[0_5px_0_#4338CA] active:translate-y-1 active:shadow-[0_1px_0_#4338CA] transition-all flex items-center justify-center gap-2 select-none"
              >
                <span>🎮</span>
                <span>Start Match</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClick();
                  setCurrentView('home');
                }}
                className="w-full py-2.5 rounded-2xl bg-white hover:bg-gray-50 text-[#77758A] font-bold text-xs border border-[#E9E2D9] active:scale-98 transition-all flex items-center justify-center gap-1.5 select-none"
              >
                <span>← Leave Room</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SCREEN 5: GAME SETUP SCREEN (vs Robo / Pass & Play)
         ======================================================== */}
      {currentView === 'setup' && (
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-start py-2 px-2 animate-fadeIn">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => {
                playClick();
                setCurrentView('home');
              }}
              className="w-10 h-10 rounded-2xl bg-white border-2 border-[#E9E2D9] shadow-[0_3px_0_#DCD3C7] active:translate-y-0.5 flex items-center justify-center text-[#25233A] hover:bg-gray-50 transition-all"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-heading text-[#25233A]">
              Game Setup
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-5 border-2 border-[#E9E2D9] shadow-sm space-y-5">
            {/* Game Mode Selector: vs Robo 🤖 vs Pass & Play */}
            <div>
              <label className="text-xs font-bold text-[#77758A] uppercase tracking-wider block mb-2">
                Game Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleModeChange('vs-computer')}
                  className={`h-12 rounded-2xl font-heading text-base flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    gameMode === 'vs-computer'
                      ? 'bg-[#6558E8] text-white shadow-[0_4px_0_#4338CA]'
                      : 'bg-[#FFF8EF] text-[#25233A] border-2 border-[#E9E2D9] hover:bg-gray-100'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  <span>vs Robo 🤖</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('pass-and-play')}
                  className={`h-12 rounded-2xl font-heading text-base flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    gameMode === 'pass-and-play'
                      ? 'bg-[#6558E8] text-white shadow-[0_4px_0_#4338CA]'
                      : 'bg-[#FFF8EF] text-[#25233A] border-2 border-[#E9E2D9] hover:bg-gray-100'
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
                {gameMode === 'vs-computer' ? 'Total Players (You + Bots)' : 'Number of Players'}
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
                    className={`h-12 rounded-2xl font-heading text-base flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                      playerCount === cnt
                        ? 'bg-[#6558E8] text-white shadow-[0_4px_0_#4338CA]'
                        : 'bg-[#FFF8EF] text-[#25233A] border-2 border-[#E9E2D9] hover:bg-gray-100'
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
                      className="flex items-center gap-2.5 p-1.5 bg-[#FFF8EF] rounded-2xl border-2 border-[#E9E2D9] focus-within:border-[#6558E8] focus-within:bg-white transition-all"
                    >
                      <div
                        style={{ backgroundColor: color.bgHex }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-heading text-base shadow-sm shrink-0 border border-white"
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
                      <span className="text-[11px] font-extrabold text-[#77758A] pr-2">
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
                className="flex items-center justify-between p-2.5 bg-[#FFF8EF] rounded-2xl border border-[#E9E2D9] cursor-pointer hover:bg-[#FAF4EB]"
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
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    requireSixToStart ? 'bg-[#6558E8] text-white shadow-xs' : 'border-2 border-gray-300 bg-white'
                  }`}
                >
                  {requireSixToStart && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </div>

              {/* Exact roll to finish */}
              <div
                onClick={() => setExactRollToFinish(!exactRollToFinish)}
                className="flex items-center justify-between p-2.5 bg-[#FFF8EF] rounded-2xl border border-[#E9E2D9] cursor-pointer hover:bg-[#FAF4EB]"
              >
                <div>
                  <span className="font-bold text-xs text-[#25233A] block">
                    Exact Roll to Win (100)
                  </span>
                  <span className="text-[10px] text-[#77758A]">
                    Overshooting stays until exact roll
                  </span>
                </div>
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    exactRollToFinish ? 'bg-[#6558E8] text-white shadow-xs' : 'border-2 border-gray-300 bg-white'
                  }`}
                >
                  {exactRollToFinish && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </div>

              {/* Extra turn on 6 */}
              <div
                onClick={() => setExtraTurnOnSix(!extraTurnOnSix)}
                className="flex items-center justify-between p-2.5 bg-[#FFF8EF] rounded-2xl border border-[#E9E2D9] cursor-pointer hover:bg-[#FAF4EB]"
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
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    extraTurnOnSix ? 'bg-[#6558E8] text-white shadow-xs' : 'border-2 border-gray-300 bg-white'
                  }`}
                >
                  {extraTurnOnSix && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {/* Launch button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartGame}
                className="w-full py-4 rounded-2xl bg-[#6558E8] hover:bg-[#5245DC] text-white font-heading text-xl tracking-wide shadow-[0_5px_0_#4338CA] active:translate-y-1 active:shadow-[0_1px_0_#4338CA] transition-all flex items-center justify-center gap-2 select-none"
              >
                <span>🎮</span>
                <span>Launch Game</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SCREEN 6: ACTIVE GAME BOARD SCREEN
         ======================================================== */}
      {currentView === 'game' && (
        <div className="w-full max-w-lg mx-auto flex-1 flex flex-col items-center justify-between gap-3 py-1 animate-fadeIn">
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
                <p className="text-[11px] font-bold text-[#77758A] mt-1.5 text-center line-clamp-1">
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
    </main>
  );
}
