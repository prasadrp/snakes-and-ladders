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
import { Button } from '@/components/common/Button';
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
} from 'lucide-react';

type ScreenView = 'home' | 'create-room' | 'join-room' | 'room-lobby' | 'setup' | 'game';

/**
 * 3D Isometric Dice SVG matching user screenshot
 * White cube with dark border, red dot on top face, black dots on side faces
 */
function IsometricDiceLogo({ className = 'w-24 h-24 sm:w-28 sm:h-28' }: { className?: string }) {
  return (
    <div className={`relative ${className} mx-auto flex items-center justify-center select-none`}>
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Floor shadow */}
        <ellipse cx="60" cy="112" rx="42" ry="7" fill="#000000" fillOpacity="0.08" />

        {/* Top Face */}
        <polygon
          points="60,18 106,42 60,66 14,42"
          fill="#FFFFFF"
          stroke="#1E293B"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        {/* Red center pip on top face */}
        <ellipse cx="60" cy="42" rx="6.5" ry="4.5" fill="#E11D48" />

        {/* Left Face */}
        <polygon
          points="14,42 60,66 60,108 14,84"
          fill="#F8FAFC"
          stroke="#1E293B"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        {/* Left Face Pips (3 black dots) */}
        <ellipse cx="28" cy="54" rx="3.5" ry="5" fill="#1E293B" transform="rotate(-15 28 54)" />
        <ellipse cx="37" cy="75" rx="3.5" ry="5" fill="#1E293B" transform="rotate(-15 37 75)" />
        <ellipse cx="46" cy="96" rx="3.5" ry="5" fill="#1E293B" transform="rotate(-15 46 96)" />

        {/* Right Face */}
        <polygon
          points="60,66 106,42 106,84 60,108"
          fill="#E2E8F0"
          stroke="#1E293B"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        {/* Right Face Pips (4 black dots) */}
        <ellipse cx="76" cy="58" rx="3.5" ry="5" fill="#1E293B" transform="rotate(15 76 58)" />
        <ellipse cx="92" cy="50" rx="3.5" ry="5" fill="#1E293B" transform="rotate(15 92 50)" />
        <ellipse cx="76" cy="96" rx="3.5" ry="5" fill="#1E293B" transform="rotate(15 76 96)" />
        <ellipse cx="92" cy="88" rx="3.5" ry="5" fill="#1E293B" transform="rotate(15 92 88)" />
      </svg>
    </div>
  );
}

/**
 * Cyan Globe Badge matching screenshot
 */
function GlobeBadge({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  if (size === 'lg') {
    return (
      <div className="w-16 h-16 rounded-full bg-[#00B4D8] border-[3.5px] border-[#1E293B] flex items-center justify-center shadow-sm select-none">
        <svg
          viewBox="0 0 24 24"
          className="w-10 h-10 text-white"
          fill="none"
          stroke="#1E293B"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" fill="#00B4D8" />
          <line x1="2" y1="12" x2="22" y2="12" stroke="#FFFFFF" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="#FFFFFF" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-[#00B4D8] border-2 border-[#1E293B] flex items-center justify-center shadow-sm shrink-0 select-none">
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5 text-white"
        fill="none"
        stroke="#1E293B"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" fill="#00B4D8" />
        <line x1="2" y1="12" x2="22" y2="12" stroke="#FFFFFF" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="#FFFFFF" />
      </svg>
    </div>
  );
}

export default function HomePage() {
  const [currentView, setCurrentView] = useState<ScreenView>('home');
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [diceDotColor, setDiceDotColor] = useState<string>('#6558E8');
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('vintage-paper');

  // Online Room State
  const [onlineHostName, setOnlineHostName] = useState('Player 1');
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
    const guest = onlineJoinName.trim() || 'Guest';
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
    <main className="min-h-screen flex flex-col items-center justify-between bg-[#FFF9F3] bg-[radial-gradient(#E8DFD5_1.5px,transparent_1.5px)] [background-size:24px_24px] pb-6 px-3 sm:px-4">
      {/* Universal App Header with minimal sound & settings icons */}
      <AppHeader
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onOpenHowToPlay={() => setShowHowToPlay(true)}
        onOpenSettings={() => setShowSettings(true)}
        minimal={currentView === 'home' || currentView === 'create-room' || currentView === 'join-room' || currentView === 'room-lobby'}
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
          SCREEN 1: HOME SCREEN (Exact 1:1 match to Screenshot 1)
         ======================================================== */}
      {currentView === 'home' && (
        <div className="w-full max-w-sm mx-auto flex-1 flex flex-col items-center justify-center py-6 px-2 text-center animate-fadeIn">
          {/* 3D Isometric Dice Graphic */}
          <div className="mb-4">
            <IsometricDiceLogo />
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl font-black text-[#1E293B] tracking-tight mb-2">
            Snakes &amp; Ladders
          </h1>

          {/* Emoji row: 🐍 🪜 🎲 🏆 */}
          <div className="flex items-center justify-center gap-3 text-2xl mb-8 select-none">
            <span>🐍</span>
            <span>🪜</span>
            <span>🎲</span>
            <span>🏆</span>
          </div>

          {/* 3 Main Action Buttons */}
          <div className="w-full space-y-4">
            {/* Button 1: Create Room */}
            <button
              type="button"
              onClick={() => {
                playClick();
                setCurrentView('create-room');
              }}
              className="w-full py-4 px-6 rounded-2xl bg-[#F85959] hover:bg-[#EE4444] text-white font-extrabold text-lg sm:text-xl shadow-[0_5px_0_#D43838] active:translate-y-1 active:shadow-[0_2px_0_#D43838] transition-all flex items-center justify-center gap-3 select-none"
            >
              <GlobeBadge size="sm" />
              <span>Create Room</span>
            </button>

            {/* Button 2: Join with Code */}
            <button
              type="button"
              onClick={() => {
                playClick();
                setCurrentView('join-room');
              }}
              className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-[#FAFAFA] text-[#1E293B] font-extrabold text-lg sm:text-xl border-2 border-[#E2E8F0] shadow-[0_5px_0_#CBD5E1] active:translate-y-1 active:shadow-[0_2px_0_#CBD5E1] transition-all flex items-center justify-center gap-3 select-none"
            >
              <span className="text-2xl shrink-0 -rotate-45">🔑</span>
              <span>Join with Code</span>
            </button>

            {/* Button 3: Local Game (Offline) */}
            <button
              type="button"
              onClick={() => {
                playClick();
                handleModeChange('vs-computer');
                setCurrentView('setup');
              }}
              className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-[#FAFAFA] text-[#1E293B] font-extrabold text-lg sm:text-xl border-2 border-[#E2E8F0] shadow-[0_5px_0_#CBD5E1] active:translate-y-1 active:shadow-[0_2px_0_#CBD5E1] transition-all flex items-center justify-center gap-3 select-none"
            >
              <span className="text-2xl shrink-0">🏠</span>
              <span>Local Game (Offline)</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          SCREEN 2: CREATE ROOM (Exact 1:1 match to Screenshot 2)
         ======================================================== */}
      {currentView === 'create-room' && (
        <div className="w-full max-w-sm mx-auto flex-1 flex flex-col items-center justify-center py-4 px-2 animate-fadeIn">
          <div className="w-full bg-white rounded-[2.25rem] p-7 sm:p-9 shadow-[0_15px_35px_rgba(0,0,0,0.06)] border border-[#F1EBE3] flex flex-col items-center text-center">
            {/* Globe icon */}
            <div className="mb-3">
              <GlobeBadge size="lg" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] mb-7">
              Create Room
            </h2>

            {/* Form */}
            <div className="w-full text-left mb-7">
              <label className="text-[11px] font-extrabold text-[#64748B] tracking-wider block mb-2 uppercase">
                YOUR NAME
              </label>
              <input
                type="text"
                maxLength={20}
                value={onlineHostName}
                onChange={(e) => setOnlineHostName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#E2E8F0] focus:border-[#F85959] focus:outline-none text-[#1E293B] font-bold text-base placeholder:text-[#94A3B8] transition-all"
              />
            </div>

            {/* Actions */}
            <div className="w-full space-y-3">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  handleCreateRoom();
                }}
                className="w-full py-4 rounded-2xl bg-[#F85959] hover:bg-[#EE4444] text-white font-extrabold text-lg shadow-[0_5px_0_#D43838] active:translate-y-1 active:shadow-[0_2px_0_#D43838] transition-all flex items-center justify-center gap-2 select-none"
              >
                <span>🚀</span>
                <span>Create</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClick();
                  setCurrentView('home');
                }}
                className="w-full py-3.5 rounded-2xl bg-white hover:bg-gray-50 text-[#334155] font-bold text-base border-2 border-[#E2E8F0] shadow-[0_3px_0_#E2E8F0] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 select-none"
              >
                <span>← Back</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SCREEN 3: JOIN WITH CODE (Exact 1:1 match to Screenshot 3)
         ======================================================== */}
      {currentView === 'join-room' && (
        <div className="w-full max-w-sm mx-auto flex-1 flex flex-col items-center justify-center py-4 px-2 animate-fadeIn">
          <div className="w-full bg-white rounded-[2.25rem] p-7 sm:p-9 shadow-[0_15px_35px_rgba(0,0,0,0.06)] border border-[#F1EBE3] flex flex-col items-center text-center">
            {/* Key icon */}
            <div className="w-16 h-16 rounded-full bg-amber-50 border-[3.5px] border-[#1E293B] flex items-center justify-center text-3xl mb-3 shadow-sm select-none">
              <span className="transform -rotate-45 block">🔑</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] mb-7">
              Join with Code
            </h2>

            {/* Form */}
            <div className="w-full text-left space-y-4 mb-7">
              <div>
                <label className="text-[11px] font-extrabold text-[#64748B] tracking-wider block mb-2 uppercase">
                  YOUR NAME
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={onlineJoinName}
                  onChange={(e) => setOnlineJoinName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#E2E8F0] focus:border-[#2DD4BF] focus:outline-none text-[#1E293B] font-bold text-base placeholder:text-[#94A3B8] transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-[#64748B] tracking-wider block mb-2 uppercase">
                  ROOM CODE
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={enteredRoomCode}
                  onChange={(e) => setEnteredRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter room code..."
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#E2E8F0] focus:border-[#2DD4BF] focus:outline-none text-[#1E293B] font-mono font-bold text-base tracking-wider placeholder:text-[#94A3B8] transition-all uppercase"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="w-full space-y-3">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  handleJoinRoom();
                }}
                className="w-full py-4 rounded-2xl bg-[#2DD4BF] hover:bg-[#14B8A6] text-white font-extrabold text-lg shadow-[0_5px_0_#0D9488] active:translate-y-1 active:shadow-[0_2px_0_#0D9488] transition-all flex items-center justify-center gap-2 select-none"
              >
                <span>🎮</span>
                <span>Join</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClick();
                  setCurrentView('home');
                }}
                className="w-full py-3.5 rounded-2xl bg-white hover:bg-gray-50 text-[#334155] font-bold text-base border-2 border-[#E2E8F0] shadow-[0_3px_0_#E2E8F0] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 select-none"
              >
                <span>← Back</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SCREEN 4: ROOM LOBBY (When Room is Created or Joined)
         ======================================================== */}
      {currentView === 'room-lobby' && (
        <div className="w-full max-w-sm mx-auto flex-1 flex flex-col items-center justify-center py-4 px-2 animate-fadeIn">
          <div className="w-full bg-white rounded-[2.25rem] p-6 sm:p-8 shadow-[0_15px_35px_rgba(0,0,0,0.06)] border border-[#F1EBE3] flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center text-2xl mb-3 shadow-sm">
              🌐
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#1E293B] mb-1">
              Room Lobby
            </h2>
            <p className="text-xs text-[#64748B] mb-4">
              Share code with friends to join!
            </p>

            {/* Room Code Box */}
            <div className="w-full p-3.5 bg-[#FFF9F3] rounded-2xl border-2 border-[#E2E8F0] flex items-center justify-between mb-5">
              <div className="text-left">
                <span className="text-[10px] font-bold text-[#64748B] block uppercase tracking-wider">
                  Room Code
                </span>
                <span className="font-mono font-black text-xl text-[#1E293B] tracking-wider">
                  {activeRoomCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#CBD5E1] text-[#1E293B] font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Players in Room */}
            <div className="w-full text-left mb-6">
              <span className="text-[11px] font-extrabold text-[#64748B] tracking-wider block mb-2 uppercase">
                Players ({roomLobbyPlayers.length}/4)
              </span>
              <div className="space-y-2">
                {roomLobbyPlayers.map((name, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        style={{ backgroundColor: PLAYER_COLORS[idx % PLAYER_COLORS.length].bgHex }}
                        className="w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center shadow-xs"
                      >
                        {idx + 1}
                      </div>
                      <span className="text-sm font-bold text-[#1E293B]">{name}</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Ready
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lobby actions */}
            <div className="w-full space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  handleStartLobbyGame();
                }}
                className="w-full py-3.5 rounded-2xl bg-[#F85959] hover:bg-[#EE4444] text-white font-extrabold text-base shadow-[0_5px_0_#D43838] active:translate-y-1 active:shadow-[0_2px_0_#D43838] transition-all flex items-center justify-center gap-2 select-none"
              >
                <span>🎲</span>
                <span>Start Game</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClick();
                  setCurrentView('home');
                }}
                className="w-full py-3 rounded-2xl bg-white hover:bg-gray-50 text-[#334155] font-bold text-sm border-2 border-[#E2E8F0] shadow-[0_3px_0_#E2E8F0] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 select-none"
              >
                <span>← Leave Room</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SCREEN 5: LOCAL GAME SETUP (Opened via 'Local Game (Offline)')
         ======================================================== */}
      {currentView === 'setup' && (
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-start py-2 px-2 animate-fadeIn">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => {
                playClick();
                setCurrentView('home');
              }}
              className="w-10 h-10 rounded-2xl bg-white border-2 border-[#E2E8F0] shadow-[0_3px_0_#CBD5E1] active:translate-y-0.5 flex items-center justify-center text-[#25233A] hover:bg-gray-50 transition-all"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl sm:text-2xl font-black text-[#1E293B]">
              Offline Game Setup
            </h2>
          </div>

          <div className="bg-white rounded-[2rem] p-5 border border-[#E9E2D9] shadow-sm space-y-5">
            {/* Game Mode Selector: vs Robo 🤖 vs Pass & Play */}
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
                  <span>vs Robo 🤖</span>
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
                    Overshooting stays until exact roll
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
              <button
                type="button"
                onClick={handleStartGame}
                className="w-full py-4 rounded-2xl bg-[#6558E8] hover:bg-[#5245DC] text-white font-extrabold text-lg shadow-[0_5px_0_#4338CA] active:translate-y-1 active:shadow-[0_2px_0_#4338CA] transition-all flex items-center justify-center gap-2 select-none"
              >
                <span>🎮</span>
                <span>Start Playing Now</span>
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
    </main>
  );
}
