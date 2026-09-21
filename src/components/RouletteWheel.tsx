/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Sparkles, 
  Trophy, 
  Layers, 
  Check, 
  Dice5,
  X,
  Volume2,
  FileText,
  ClipboardList
} from 'lucide-react';
import { WheelOption } from '../types';
import { playWheelTick, playWinFanfare } from '../utils/audio';
import { useAppData } from '../context/DataContext';

const RAINBOW_COLORS = [
  '#e40303', // Pride Red
  '#ff8c00', // Pride Orange
  '#ffed00', // Pride Yellow
  '#008026', // Pride Green
  '#24408e', // Pride Blue
  '#732982', // Pride Purple
  '#e040fb', // Pink
  '#00e5ff', // Cyan
];

const PRESETS: { [name: string]: string[] } = {
  'Kto stawia jedzenie w Lesznie?': [
    'Kuba',
    'Patryk',
    'Michał',
    'Kacper',
    'Oliwier',
    'Zrzutka po równo!',
  ],
  'Gdzie idziemy na przerwie z ZSET?': [
    'Park 1000-lecia (ławki)',
    'Kebab na mieście',
    'Kawiarnia Rynek',
    'Sklepik szkolny',
    'Korytarz przy pracowni',
    'Plac przed szkołą',
  ],
  'Prawda czy Wyzwanie?': [
    'Prawda: Kto ze szkoły Ci się podoba?',
    'Wyzwanie: Zagadaj do crusha na korytarzu!',
    'Prawda: Jaka była Twoja największa wtopa na lekcji?',
    'Wyzwanie: Powiedz komplement osobie po lewej',
    'Prawda: Jaki przedmiot w ZSET jest najgorszy?',
    'Wyzwanie: Zatańcz krótki układ do rytmu metronomu',
  ],
  'Co robimy po lekcjach?': [
    'Kawa i ciacho w centrum',
    'Spacer po Lesznie',
    'Wspólne granie na Discordzie',
    'Nauka do egzaminu zawodowego',
    'Planszówki w bezpiecznym miejscu',
    'Kebab i chillout',
  ],
};

export const RouletteWheel: React.FC = () => {
  const { data, setWheelOptions, clearWheelOptions } = useAppData();
  const options = data.wheelOptions || [];

  const [newOptionText, setNewOptionText] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [bulkText, setBulkText] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeOptions = options.filter((o) => o.active);

  // Draw wheel on canvas
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = width / 2 - 12;

    ctx.clearRect(0, 0, width, height);

    if (activeOptions.length === 0) {
      // Clean, welcoming empty state on the canvas
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();

      // Dashed rainbow border
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 18px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Koło jest czyste', cx, cy - 14);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px Outfit, sans-serif';
      ctx.fillText('Wpisz swoje opcje poniżej', cx, cy + 16);
      return;
    }

    const arc = (Math.PI * 2) / activeOptions.length;

    activeOptions.forEach((opt, idx) => {
      const angle = idx * arc;

      // Slice
      ctx.beginPath();
      ctx.fillStyle = opt.color;
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle, angle + arc);
      ctx.lineTo(cx, cy);
      ctx.fill();

      // Border between slices
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 4;
      ctx.font = 'bold 15px Outfit, sans-serif';

      let text = opt.text;
      if (text.length > 20) text = text.slice(0, 18) + '...';
      ctx.fillText(text, radius - 24, 5);
      ctx.restore();
    });

    // Center circular badge with rainbow border
    ctx.beginPath();
    ctx.arc(cx, cy, 34, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center pride dot
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#ec4899';
    ctx.fill();
  };

  useEffect(() => {
    drawWheel();
  }, [activeOptions, rotation]);

  const handleSpin = () => {
    if (isSpinning || activeOptions.length < 2) return;

    setIsSpinning(true);
    setWinner(null);

    const fullSpins = 5 + Math.floor(Math.random() * 4);
    const extraDegrees = Math.floor(Math.random() * 360);
    const totalRotationDeg = fullSpins * 360 + extraDegrees;

    const startRot = rotation % 360;
    const targetRot = rotation + totalRotationDeg;
    const duration = 4800;
    const startTime = performance.now();

    let lastTickAngle = 0;
    const sliceAngle = 360 / activeOptions.length;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 3.8);
      const currentRotation = startRot + (targetRot - startRot) * easeOut;
      setRotation(currentRotation);

      if (Math.abs(currentRotation - lastTickAngle) >= sliceAngle * 0.7) {
        playWheelTick();
        lastTickAngle = currentRotation;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const normalizedRotation = currentRotation % 360;
        const pointerAngle = (360 - (normalizedRotation % 360) + 270) % 360;
        const winningIndex = Math.floor(pointerAngle / sliceAngle) % activeOptions.length;
        const win = activeOptions[winningIndex];

        if (win) {
          setWinner(win.text);
          playWinFanfare();

          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: RAINBOW_COLORS,
          });
        }
      }
    };

    requestAnimationFrame(animate);
  };

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionText.trim()) return;

    const nextColor = RAINBOW_COLORS[options.length % RAINBOW_COLORS.length];
    const newOpt: WheelOption = {
      id: 'opt-' + Date.now(),
      text: newOptionText.trim(),
      color: nextColor,
      active: true,
    };

    setWheelOptions((prev) => [...prev, newOpt]);
    setNewOptionText('');
  };

  const handleBulkAdd = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    const currentLen = options.length;
    const newItems: WheelOption[] = lines.map((text, idx) => ({
      id: 'opt-' + (currentLen + idx) + '-' + Date.now(),
      text,
      color: RAINBOW_COLORS[(currentLen + idx) % RAINBOW_COLORS.length],
      active: true,
    }));

    setWheelOptions((prev) => [...prev, ...newItems]);
    setBulkText('');
    setShowBulkModal(false);
  };

  const handleDeleteOption = (id: string) => {
    setWheelOptions((prev) => prev.filter((o) => o.id !== id));
  };

  const handleToggleOption = (id: string) => {
    setWheelOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, active: !o.active } : o))
    );
  };

  const handleLoadPreset = (presetName: string) => {
    const list = PRESETS[presetName];
    if (!list) return;

    const newOpts = list.map((text, idx) => ({
      id: 'opt-' + idx + '-' + Date.now(),
      text,
      color: RAINBOW_COLORS[idx % RAINBOW_COLORS.length],
      active: true,
    }));

    setWheelOptions(newOpts);
    setWinner(null);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Losowanie i Zabawa ZSET</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
            Ruletka Koło Fortuny
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Czyste koło do szybkich losowań. Resetuje się automatycznie po każdym odświeżeniu strony.
          </p>
        </div>

        {/* Action buttons: Clear & Optional Templates */}
        <div className="flex items-center gap-2">
          {options.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Czy na pewno wyczyścić i zresetować koło?')) {
                  clearWheelOptions();
                  setWinner(null);
                  setRotation(0);
                }
              }}
              className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Resetuj koło</span>
            </button>
          )}

          {/* Optional template loader */}
          <div className="relative group">
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  handleLoadPreset(e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="" disabled>Załaduj gotowy szablon...</option>
              {Object.keys(PRESETS).map((pName) => (
                <option key={pName} value={pName}>
                  {pName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Wheel Display Section */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl relative overflow-hidden">
          {/* Top Indicator Arrow */}
          <div className="relative z-20 -mb-5 flex flex-col items-center">
            <div className="w-0 h-0 border-x-[18px] border-x-transparent border-t-[30px] border-t-rose-500 drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]" />
            <div className="w-3 h-3 rounded-full bg-white -mt-1 shadow-md border border-slate-300" />
          </div>

          {/* Rotating Wheel Canvas */}
          <div className="relative p-2">
            <canvas
              ref={canvasRef}
              width={420}
              height={420}
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'none' : 'transform 0.3s ease-out',
                maxWidth: '100%',
                height: 'auto',
              }}
              className="rounded-full shadow-2xl"
            />
          </div>

          {/* Spin Trigger Button */}
          <div className="mt-6 flex flex-col items-center gap-2 w-full sm:w-auto text-center">
            <button
              id="btn-spin-wheel"
              onClick={handleSpin}
              disabled={isSpinning || activeOptions.length < 2}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-purple-600/30 transition-all transform active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>
                {isSpinning
                  ? 'Koło się kręci...'
                  : activeOptions.length < 2
                  ? 'Dodaj min. 2 opcje, aby zakręcić'
                  : 'ZAKRĘĆ KOŁEM!'}
              </span>
            </button>
            {activeOptions.length < 2 && (
              <span className="text-xs text-slate-400">
                Wpisz co najmniej 2 opcje po prawej stronie, aby odblokować losowanie.
              </span>
            )}
          </div>

          {/* Winner Announcement Card */}
          {winner && (
            <div className="mt-6 w-full max-w-md p-4 rounded-2xl bg-gradient-to-r from-purple-900/60 via-pink-900/50 to-indigo-900/60 border border-purple-500/50 shadow-xl text-center space-y-2 animate-bounce-short">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Wylosowany Wynik</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                🎉 {winner} 🎉
              </h3>
            </div>
          )}
        </div>

        {/* Options Customizer Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 font-display">
                  <Dice5 className="w-4 h-4 text-purple-500" />
                  <span>Twoje opcje ({activeOptions.length} na kole)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Wpisuj dowolne własne teksty lub wklej listę hurtowo
                </p>
              </div>

              <button
                onClick={() => setShowBulkModal(true)}
                className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Wklej listę</span>
              </button>
            </div>

            {/* Add Option Form */}
            <form onSubmit={handleAddOption} className="flex gap-2">
              <input
                type="text"
                id="input-wheel-option"
                placeholder="Wpisz nową opcję na koło..."
                value={newOptionText}
                onChange={(e) => setNewOptionText(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                id="btn-add-wheel-option"
                disabled={!newOptionText.trim()}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-sm flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Dodaj</span>
              </button>
            </form>

            {/* Options List */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {options.length === 0 ? (
                <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
                  <Dice5 className="w-8 h-8 mx-auto mb-2 opacity-40 text-purple-500" />
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Koło fortuny jest czyste
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Wpisz swoją pierwszą opcję w formularzu powyżej lub wklej całą listę.
                  </div>
                </div>
              ) : (
                options.map((opt) => (
                  <div
                    key={opt.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      opt.active
                        ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                        : 'bg-slate-100/60 dark:bg-slate-900/60 border-transparent opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: opt.color }}
                      />
                      <span
                        className={`text-sm font-medium truncate ${
                          opt.active
                            ? 'text-slate-800 dark:text-slate-100'
                            : 'text-slate-400 line-through'
                        }`}
                      >
                        {opt.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Toggle Active */}
                      <button
                        onClick={() => handleToggleOption(opt.id)}
                        title={opt.active ? 'Wyłącz z koła' : 'Włącz do koła'}
                        className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                          opt.active
                            ? 'text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/40'
                            : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteOption(opt.id)}
                        title="Usuń opcję"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Helper tips */}
            <div className="text-[11px] text-slate-400 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              💡 <strong>Bezpieczny zapis:</strong> Wpisane opcje koła są natychmiast zapamiętywane w Twojej pamięci profilu.
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-display flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-purple-500" />
                <span>Wklej listę opcji hurtowo</span>
              </h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 my-3">
              Wklej lub wpisz pozycje — każda opcja w nowej linii (np. lista osób, dań lub miejsc):
            </p>

            <textarea
              rows={6}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`Kuba\nPatryk\nMichał\nKebab na mieście\nKawa na Rynku`}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={handleBulkAdd}
                disabled={!bulkText.trim()}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Dodaj wszystkie do koła
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
