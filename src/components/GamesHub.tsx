/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Gamepad2, 
  Brush, 
  Zap, 
  RotateCcw, 
  Trophy, 
  Download, 
  User, 
  Bot, 
  Sparkles, 
  Palette, 
  Eraser, 
  Check, 
  Camera, 
  Smile, 
  Award,
  Flame,
  Volume2,
  Trash2
} from 'lucide-react';
import { useAppData } from '../context/DataContext';

export const GamesHub: React.FC = () => {
  const { data, setUserProfile } = useAppData();
  const [activeGame, setActiveGame] = useState<'tictactoe' | 'paint' | 'reflex'>('tictactoe');

  // ==========================================
  // 1. KÓŁKO I KRZYŻYK (TIC-TAC-TOE)
  // ==========================================
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameMode, setGameMode] = useState<'pvp' | 'ai'>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'hard'>('hard');
  const [scores, setScores] = useState({ x: 0, o: 0, ties: 0 });
  const [winnerInfo, setWinnerInfo] = useState<{ winner: string | null; line: number[] | null }>({
    winner: null,
    line: null,
  });

  const checkWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }
    if (squares.every(Boolean)) {
      return { winner: 'draw', line: null };
    }
    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winnerInfo.winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const res = checkWinner(newBoard);
    if (res) {
      setWinnerInfo(res);
      if (res.winner === 'X') setScores((s) => ({ ...s, x: s.x + 1 }));
      else if (res.winner === 'O') setScores((s) => ({ ...s, o: s.o + 1 }));
      else if (res.winner === 'draw') setScores((s) => ({ ...s, ties: s.ties + 1 }));
      return;
    }

    setIsXNext(!isXNext);
  };

  // AI Turn in Tic-Tac-Toe
  useEffect(() => {
    if (gameMode === 'ai' && !isXNext && !winnerInfo.winner) {
      const timer = setTimeout(() => {
        const emptyIndices = board
          .map((val, idx) => (val === null ? idx : null))
          .filter((val): val is number => val !== null);

        if (emptyIndices.length === 0) return;

        let chosenIndex: number;

        if (aiDifficulty === 'hard') {
          // Check if AI can win immediately
          let bestMove: number | null = null;
          for (const idx of emptyIndices) {
            const temp = [...board];
            temp[idx] = 'O';
            if (checkWinner(temp)?.winner === 'O') {
              bestMove = idx;
              break;
            }
          }
          // Block X from winning
          if (bestMove === null) {
            for (const idx of emptyIndices) {
              const temp = [...board];
              temp[idx] = 'X';
              if (checkWinner(temp)?.winner === 'X') {
                bestMove = idx;
                break;
              }
            }
          }
          // Take center
          if (bestMove === null && emptyIndices.includes(4)) {
            bestMove = 4;
          }
          chosenIndex = bestMove !== null ? bestMove : emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        } else {
          // Easy: random move
          chosenIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        }

        const newBoard = [...board];
        newBoard[chosenIndex] = 'O';
        setBoard(newBoard);

        const res = checkWinner(newBoard);
        if (res) {
          setWinnerInfo(res);
          if (res.winner === 'X') setScores((s) => ({ ...s, x: s.x + 1 }));
          else if (res.winner === 'O') setScores((s) => ({ ...s, o: s.o + 1 }));
          else if (res.winner === 'draw') setScores((s) => ({ ...s, ties: s.ties + 1 }));
        } else {
          setIsXNext(true);
        }
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [gameMode, isXNext, board, winnerInfo.winner, aiDifficulty]);

  const resetTicTacToe = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinnerInfo({ winner: null, line: null });
  };

  // ==========================================
  // 2. MINI PAINT ZSET (TĘCZOWY SZKICOWNIK)
  // ==========================================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [paintTool, setPaintTool] = useState<'brush' | 'rainbow' | 'eraser'>('brush');
  const [brushColor, setBrushColor] = useState('#ec4899'); // Pink default
  const [brushSize, setBrushSize] = useState(6);
  const [isDrawing, setIsDrawing] = useState(false);
  const [avatarToast, setAvatarToast] = useState(false);
  const [clearToast, setClearToast] = useState(false);

  // References for smooth continuous drawing without re-renders or recoloring canvas
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const rainbowHueRef = useRef<number>(0);

  // Initialize white canvas background
  useEffect(() => {
    if (activeGame === 'paint') {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
  }, [activeGame]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const coords = getCanvasCoordinates(e);
    lastPointRef.current = coords;

    // Draw an initial point dot
    ctx.beginPath();
    ctx.arc(
      coords.x, 
      coords.y, 
      Math.max(1, (paintTool === 'eraser' ? brushSize * 2.5 : brushSize) / 2), 
      0, 
      Math.PI * 2
    );
    if (paintTool === 'eraser') {
      ctx.fillStyle = '#ffffff';
    } else if (paintTool === 'rainbow') {
      ctx.fillStyle = `hsl(${rainbowHueRef.current}, 100%, 50%)`;
    } else {
      ctx.fillStyle = brushColor;
    }
    ctx.fill();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPointRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoordinates(e);
    const prev = lastPointRef.current;

    // Draw strictly this segment in its own path so previous lines are NEVER recolored
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (paintTool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = brushSize * 2.5;
    } else if (paintTool === 'rainbow') {
      rainbowHueRef.current = (rainbowHueRef.current + 4) % 360;
      ctx.strokeStyle = `hsl(${rainbowHueRef.current}, 100%, 50%)`;
      ctx.lineWidth = brushSize;
    } else {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
    }

    ctx.stroke();
    lastPointRef.current = coords;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        setIsDrawing(false);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        setClearToast(true);
        setTimeout(() => setClearToast(false), 2000);
      }
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `zset-gayspace-paint-${Date.now()}.png`;
    link.href = image;
    link.click();
  };

  const setAsProfileAvatar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Scale to clean square avatar
    const avatarCanvas = document.createElement('canvas');
    avatarCanvas.width = 256;
    avatarCanvas.height = 256;
    const actx = avatarCanvas.getContext('2d');
    if (actx) {
      actx.drawImage(canvas, 0, 0, 256, 256);
      const dataUrl = avatarCanvas.toDataURL('image/jpeg', 0.85);
      setUserProfile({ avatarUrl: dataUrl });
      setAvatarToast(true);
      setTimeout(() => setAvatarToast(false), 2500);
    }
  };

  const PRIDE_COLORS = [
    { label: 'Róż', hex: '#ec4899' },
    { label: 'Czerwień Pride', hex: '#ef4444' },
    { label: 'Pomarańcz', hex: '#f97316' },
    { label: 'Żółty', hex: '#eab308' },
    { label: 'Zieleń Pride', hex: '#10b981' },
    { label: 'Błękit', hex: '#06b6d4' },
    { label: 'Indygo', hex: '#6366f1' },
    { label: 'Fiolet ZSET', hex: '#8b5cf6' },
    { label: 'Czerń', hex: '#0f172a' },
  ];

  // ==========================================
  // 3. TEST REFLEKSU ZSET (SZYBKI KLIKER)
  // ==========================================
  const profile = data.userProfile;
  const [reflexState, setReflexState] = useState<'idle' | 'waiting' | 'ready' | 'result' | 'early'>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestReflex, setBestReflex] = useState<number | null>(() => {
    return profile?.reflexRecord || null;
  });
  const [recordSavedToast, setRecordSavedToast] = useState(false);
  const startTimeRef = useRef<number>(0);
  const reflexTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync with profile record if it changes externally
  useEffect(() => {
    if (profile?.reflexRecord) {
      setBestReflex((prev) => (prev ? Math.min(prev, profile.reflexRecord!) : profile.reflexRecord!));
    }
  }, [profile?.reflexRecord]);

  const startReflexTest = () => {
    setReflexState('waiting');
    setReactionTime(null);
    setRecordSavedToast(false);

    // Random delay between 1.8s and 4.2s
    const delay = Math.floor(Math.random() * 2400) + 1800;

    if (reflexTimerRef.current) clearTimeout(reflexTimerRef.current);

    reflexTimerRef.current = setTimeout(() => {
      setReflexState('ready');
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handleReflexClick = () => {
    if (reflexState === 'waiting') {
      // Clicked too early!
      if (reflexTimerRef.current) clearTimeout(reflexTimerRef.current);
      setReflexState('early');
    } else if (reflexState === 'ready') {
      const timeMs = Date.now() - startTimeRef.current;
      setReactionTime(timeMs);
      setReflexState('result');

      // Check if this is a new best score on the user profile
      const currentBest = bestReflex ?? profile?.reflexRecord ?? null;
      if (currentBest === null || timeMs < currentBest) {
        setBestReflex(timeMs);
        setUserProfile({ reflexRecord: timeMs });
        setRecordSavedToast(true);
        setTimeout(() => setRecordSavedToast(false), 4000);
      }
    } else if (reflexState === 'idle' || reflexState === 'result' || reflexState === 'early') {
      startReflexTest();
    }
  };

  const getReflexRating = (ms: number) => {
    if (ms < 180) return { title: 'E-sportowy Bóg ZSET ⚡', desc: 'Kosmiczny czas reakcji! Czy grasz w reprezentacji szkoły w CS-a?', color: 'text-amber-400' };
    if (ms < 230) return { title: 'Mistrzowski refleks! 🔥', desc: 'Błyskawiczne palce, idealne na lekcje programowania!', color: 'text-emerald-400' };
    if (ms < 300) return { title: 'Bardzo dobry wynik! 👍', desc: 'Standardowy, świetny refleks wypoczętego ucznia ZSET.', color: 'text-purple-400' };
    return { title: 'Czas na kawkę na Rynku ☕', desc: 'Mózg trochę zaspany po 6 godzinach w pracowni, ale spokojnie!', color: 'text-blue-400' };
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 border border-purple-800/50 p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Strefa Rozrywki ZSET</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight">
              Gierki na Okienka i Przerwy
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Zrelaksuj się po lekcjach: zagraj w kółko i krzyżyk, porysuj w tęczowym Paintcie lub przetestuj swój czas reakcji!
            </p>
          </div>

          {/* Game Switcher Tabs */}
          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md self-stretch sm:self-auto overflow-x-auto">
            {[
              { id: 'tictactoe', label: 'Kółko i Krzyżyk', icon: Gamepad2 },
              { id: 'paint', label: 'Mini Paint ZSET', icon: Brush },
              { id: 'reflex', label: 'Test Refleksu', icon: Zap },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeGame === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveGame(tab.id as typeof activeGame)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GAME 1: KÓŁKO I KRZYŻYK */}
      {/* ========================================================================= */}
      {activeGame === 'tictactoe' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Board Area */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col items-center">
            {/* Status bar */}
            <div className="w-full max-w-md flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Tura:</span>
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 ${
                    isXNext
                      ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20'
                      : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                  }`}
                >
                  <span>{isXNext ? '❌ Gracz X' : gameMode === 'ai' ? '🤖 Bot ZSET (O)' : '⭕ Gracz O'}</span>
                </span>
              </div>

              <button
                onClick={resetTicTacToe}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Nowa runda</span>
              </button>
            </div>

            {/* 3x3 Grid */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-xs sm:max-w-sm aspect-square p-3 sm:p-4 bg-slate-100 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner">
              {board.map((val, idx) => {
                const isWinningCell = winnerInfo.line?.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => handleCellClick(idx)}
                    disabled={Boolean(val) || Boolean(winnerInfo.winner) || (gameMode === 'ai' && !isXNext)}
                    className={`rounded-2xl text-3xl sm:text-4xl font-black font-display flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed select-none ${
                      isWinningCell
                        ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg ring-4 ring-emerald-400/40 animate-pulse'
                        : val === 'X'
                        ? 'bg-white dark:bg-slate-900 text-pink-500 shadow-sm'
                        : val === 'O'
                        ? 'bg-white dark:bg-slate-900 text-indigo-500 shadow-sm'
                        : 'bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-transparent hover:text-slate-300'
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>

            {/* Winner Banner */}
            {winnerInfo.winner && (
              <div className="mt-6 w-full max-w-md p-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-center shadow-lg animate-in zoom-in-95">
                <div className="font-black text-lg flex items-center justify-center gap-2 font-display">
                  <Trophy className="w-5 h-5 text-amber-300" />
                  {winnerInfo.winner === 'draw' ? (
                    <span>Remis! Świetna walka!</span>
                  ) : (
                    <span>
                      {winnerInfo.winner === 'X'
                        ? '🎉 Wygrywa Gracz X!'
                        : gameMode === 'ai'
                        ? '🤖 Bot ZSET zgarnia rundę!'
                        : '🎉 Wygrywa Gracz O!'}
                    </span>
                  )}
                </div>
                <button
                  onClick={resetTicTacToe}
                  className="mt-2.5 px-4 py-1.5 rounded-xl bg-white text-purple-900 font-bold text-xs hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
                >
                  Zagraj jeszcze raz
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Settings & Scoreboard */}
          <div className="lg:col-span-4 space-y-6">
            {/* Scoreboard Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 font-display">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Wyniki pojedynków</span>
              </h4>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900/40">
                  <span className="text-[11px] text-pink-600 dark:text-pink-400 font-bold block">X (Ty)</span>
                  <span className="text-2xl font-black text-pink-600 dark:text-pink-300 font-display">{scores.x}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 font-bold block">Remisy</span>
                  <span className="text-2xl font-black text-slate-700 dark:text-slate-300 font-display">{scores.ties}</span>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/40">
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold block">
                    {gameMode === 'ai' ? 'Bot' : 'O'}
                  </span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-300 font-display">{scores.o}</span>
                </div>
              </div>

              <button
                onClick={() => setScores({ x: 0, o: 0, ties: 0 })}
                className="w-full py-2 rounded-xl text-xs text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium cursor-pointer"
              >
                Wyzeruj punktację
              </button>
            </div>

            {/* Game Mode Settings */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 font-display">
                <Gamepad2 className="w-4 h-4 text-purple-500" />
                <span>Tryb rozgrywki</span>
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setGameMode('ai'); resetTicTacToe(); }}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    gameMode === 'ai'
                      ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-300 ring-2 ring-purple-500/30'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Bot className="w-5 h-5" />
                  <span>Gra z Botem ZSET</span>
                </button>

                <button
                  onClick={() => { setGameMode('pvp'); resetTicTacToe(); }}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    gameMode === 'pvp'
                      ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-300 ring-2 ring-purple-500/30'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>2 Graczy (1 ekran)</span>
                </button>
              </div>

              {gameMode === 'ai' && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                    Poziom trudności bota:
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAiDifficulty('easy')}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        aiDifficulty === 'easy'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Łatwy (Luzik)
                    </button>
                    <button
                      onClick={() => setAiDifficulty('hard')}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        aiDifficulty === 'hard'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Trudny (Informatyk)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GAME 2: MINI PAINT ZSET */}
      {/* ========================================================================= */}
      {activeGame === 'paint' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Canvas Area */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-display">
                  Tęczowy Szkicownik ZSET
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 font-bold">
                  Szkolny Paint
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={clearCanvas}
                  title="Wyczyść całe płótno szkicownika"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-600 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Wyczyść</span>
                </button>
                <button
                  onClick={downloadCanvas}
                  title="Pobierz rysunek jako obrazek PNG"
                  className="px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Pobierz PNG</span>
                </button>
                <button
                  onClick={setAsProfileAvatar}
                  title="Ustaw ten rysunek jako swój awatar profilowy i zaktualizuj go na czacie!"
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Ustaw jako mój awatar!</span>
                </button>
              </div>
            </div>

            {/* Drawing Canvas */}
            <div className="w-full flex-1 flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-2 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <canvas
                ref={canvasRef}
                width={600}
                height={420}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="bg-white rounded-xl shadow-md cursor-crosshair touch-none w-full max-w-[600px] aspect-[600/420]"
              />
            </div>

            {clearToast && (
              <div className="p-3 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Płótno szkicownika zostało całkowicie wyczyszczone!</span>
              </div>
            )}

            {avatarToast && (
              <div className="p-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>Rysunek został pomyślnie zapisany jako Twój nowy awatar profilowy!</span>
              </div>
            )}
          </div>

          {/* Paint Tools & Palette Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Tool Selection */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 font-display">
                <Brush className="w-4 h-4 text-purple-500" />
                <span>Narzędzia rysowania</span>
              </h4>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaintTool('brush')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paintTool === 'brush'
                      ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-300 ring-2 ring-purple-500/30'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Brush className="w-4 h-4" />
                  <span>Pędzel</span>
                </button>

                <button
                  onClick={() => setPaintTool('rainbow')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paintTool === 'rainbow'
                      ? 'bg-gradient-to-r from-red-500 via-amber-400 to-indigo-500 text-white shadow-md ring-2 ring-purple-500/40'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Tęcza Pride</span>
                </button>

                <button
                  onClick={() => setPaintTool('eraser')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paintTool === 'eraser'
                      ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/30'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Eraser className="w-4 h-4" />
                  <span>Gumka</span>
                </button>
              </div>

              {/* Brush Size Slider */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold">Grubość pędzla:</span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{brushSize}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="36"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <div className="flex justify-between gap-1 pt-1">
                  {[3, 6, 12, 24].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setBrushSize(sz)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                        brushSize === sz
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {sz}px
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Colors Palette */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 font-display">
                <Palette className="w-4 h-4 text-purple-500" />
                <span>Paleta kolorów ZSET</span>
              </h4>

              <div className="grid grid-cols-5 gap-2">
                {PRIDE_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    onClick={() => { setBrushColor(col.hex); setPaintTool('brush'); }}
                    title={col.label}
                    className={`w-10 h-10 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
                      brushColor === col.hex && paintTool === 'brush'
                        ? 'ring-4 ring-purple-500/50 scale-105 shadow-md'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex }}
                  >
                    {brushColor === col.hex && paintTool === 'brush' && (
                      <Check className={`w-4 h-4 ${col.hex === '#eab308' || col.hex === '#ffffff' ? 'text-slate-900' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Color Picker Input */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => { setBrushColor(e.target.value); setPaintTool('brush'); }}
                  className="w-9 h-9 rounded-xl border-0 p-0 cursor-pointer bg-transparent"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Wybierz dowolny własny kolor...
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GAME 3: TEST REFLEKSU ZSET */}
      {/* ========================================================================= */}
      {activeGame === 'reflex' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Reflex Click Area */}
          <div className="lg:col-span-8 flex flex-col">
            <div
              onClick={handleReflexClick}
              className={`flex-1 min-h-[420px] rounded-3xl p-8 flex flex-col items-center justify-center text-center select-none cursor-pointer transition-all shadow-2xl relative overflow-hidden ${
                reflexState === 'waiting'
                  ? 'bg-slate-900 border-4 border-rose-500 text-white'
                  : reflexState === 'ready'
                  ? 'bg-gradient-to-r from-red-500 via-amber-400 via-emerald-400 via-sky-400 via-indigo-500 to-purple-600 animate-pulse text-white shadow-2xl scale-[1.01]'
                  : reflexState === 'early'
                  ? 'bg-amber-600 text-white'
                  : reflexState === 'result'
                  ? 'bg-gradient-to-br from-purple-900 to-indigo-950 text-white border border-purple-700'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
              }`}
            >
              {reflexState === 'idle' && (
                <div className="space-y-4 max-w-md">
                  <div className="w-16 h-16 rounded-3xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center shadow-md">
                    <Zap className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black font-display">
                    Test Czasu Reakcji ZSET
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Kliknij w dowolne miejsce, aby rozpocząć. Czekaj na tęczowe, a gdy ekran zmieni barwy na tęczę i pojawi się napis <strong>„Spust!”</strong> — kliknij tak szybko, jak potrafisz!
                  </p>
                  <button className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer">
                    Kliknij, aby rozpocząć
                  </button>
                </div>
              )}

              {reflexState === 'waiting' && (
                <div className="space-y-3">
                  <div className="text-4xl sm:text-5xl font-black font-display tracking-tight text-rose-400 animate-pulse">
                    Czekaj na tęczowe...
                  </div>
                  <p className="text-sm text-slate-300 font-medium">
                    Nie klikaj jeszcze! Wypatruj kolorów tęczy na całym ekranie!
                  </p>
                </div>
              )}

              {reflexState === 'ready' && (
                <div className="space-y-3 animate-in zoom-in-95">
                  <div className="text-6xl sm:text-8xl font-black font-display tracking-tight uppercase drop-shadow-lg text-white">
                    SPUST! 🌈
                  </div>
                  <p className="text-base sm:text-xl text-white font-black uppercase tracking-wider drop-shadow-md">
                    KLIKAJ TERAZ! ⚡
                  </p>
                </div>
              )}

              {reflexState === 'early' && (
                <div className="space-y-3 max-w-sm">
                  <div className="text-3xl font-black font-display">
                    Falstart! Za wcześnie! 😅
                  </div>
                  <p className="text-xs text-amber-100">
                    Kliknąłeś zanim ekran zmienił kolor na tęczowy. Kliknij ponownie, aby spróbować jeszcze raz!
                  </p>
                </div>
              )}

              {reflexState === 'result' && reactionTime && (
                <div className="space-y-4 max-w-md">
                  {recordSavedToast && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold animate-bounce shadow-lg">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>🎉 Nowy rekord zapisany na Twoim koncie!</span>
                    </div>
                  )}

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-purple-200 uppercase">
                    Twój wynik
                  </div>
                  <div className="text-6xl sm:text-7xl font-black font-display text-emerald-400 tracking-tight">
                    {reactionTime} <span className="text-3xl text-slate-300 font-sans">ms</span>
                  </div>

                  {(() => {
                    const rating = getReflexRating(reactionTime);
                    return (
                      <div className="space-y-1">
                        <div className={`text-xl font-bold font-display ${rating.color}`}>
                          {rating.title}
                        </div>
                        <p className="text-xs text-slate-300">
                          {rating.desc}
                        </p>
                      </div>
                    );
                  })()}

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                    <button
                      onClick={startReflexTest}
                      className="px-6 py-2.5 rounded-2xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors shadow-md cursor-pointer"
                    >
                      Spróbuj jeszcze raz
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reflex Stats Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 font-display">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Twój rekord na koncie</span>
              </h4>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/40 dark:from-amber-950/30 dark:to-slate-900 border border-amber-200 dark:border-amber-900/40 text-center space-y-1">
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold uppercase block">
                  Rekord użytkownika ({profile?.displayName || profile?.username || 'Ty'})
                </span>
                <div className="text-4xl font-black text-amber-600 dark:text-amber-400 font-display">
                  {bestReflex ? `${bestReflex} ms` : '—'}
                </div>
                {bestReflex && (
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-1 pt-1">
                    <Check className="w-3 h-3" />
                    <span>Trwale powiązany z Twoim profilem</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Średnie normy dla młodzieży:
                </div>
                <ul className="space-y-1.5 pl-3 list-disc text-[11px]">
                  <li><strong>&lt; 200 ms:</strong> Światowy poziom, refleks gracza pro</li>
                  <li><strong>200 - 250 ms:</strong> Bardzo szybki refleks</li>
                  <li><strong>250 - 300 ms:</strong> Średnia reakcja człowieka</li>
                  <li><strong>&gt; 350 ms:</strong> Zmęczenie po lekcjach w szkole</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
