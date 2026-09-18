import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Plus, 
  Minus, 
  Volume2, 
  Music, 
  Activity, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { playMetronomeClick } from '../utils/audio';

interface TempoMarking {
  name: string;
  min: number;
  max: number;
}

const TEMPO_MARKINGS: TempoMarking[] = [
  { name: 'Grave', min: 20, max: 40 },
  { name: 'Largo', min: 40, max: 60 },
  { name: 'Adagio', min: 66, max: 76 },
  { name: 'Andante', min: 76, max: 108 },
  { name: 'Moderato', min: 108, max: 120 },
  { name: 'Allegro', min: 120, max: 168 },
  { name: 'Presto', min: 168, max: 200 },
  { name: 'Prestissimo', min: 200, max: 260 },
];

const DEFAULT_BPM = 120;
const DEFAULT_BEATS = 4;
const DEFAULT_SOUND: 'classic' | 'digital' | 'wood' | 'bell' = 'classic';

export const Metronome: React.FC = () => {
  // Metronome settings are intentionally session-only (transient) and NOT saved across page reloads.
  // Every refresh or new visit starts strictly at: 120 BPM (Moderato), 4/4, Classic sound.
  const [bpm, setBpm] = useState<number>(DEFAULT_BPM);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState<number>(DEFAULT_BEATS);
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [soundType, setSoundType] = useState<'classic' | 'digital' | 'wood' | 'bell'>(DEFAULT_SOUND);

  const handleResetDefaults = () => {
    setBpm(DEFAULT_BPM);
    setBeatsPerMeasure(DEFAULT_BEATS);
    setSoundType(DEFAULT_SOUND);
    setCurrentBeat(0);
  };

  // Tap tempo state
  const tapTimesRef = useRef<number[]>([]);

  // Timer reference for scheduling
  const timerRef = useRef<number | null>(null);
  const currentBeatRef = useRef<number>(0);
  const bpmRef = useRef<number>(bpm);
  const beatsPerMeasureRef = useRef<number>(beatsPerMeasure);
  const soundTypeRef = useRef(soundType);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    beatsPerMeasureRef.current = beatsPerMeasure;
  }, [beatsPerMeasure]);

  useEffect(() => {
    soundTypeRef.current = soundType;
  }, [soundType]);

  const tick = () => {
    const isAccent = currentBeatRef.current === 0;
    playMetronomeClick(isAccent, soundTypeRef.current);
    setCurrentBeat(currentBeatRef.current);

    currentBeatRef.current = (currentBeatRef.current + 1) % beatsPerMeasureRef.current;
  };

  useEffect(() => {
    if (isPlaying) {
      currentBeatRef.current = 0;
      tick();
      const intervalMs = (60 / bpm) * 1000;
      timerRef.current = window.setInterval(tick, intervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCurrentBeat(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, bpm, beatsPerMeasure]);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleTapTempo = () => {
    const now = performance.now();
    const times = tapTimesRef.current;

    // Reset if last tap was more than 2.5 seconds ago
    if (times.length > 0 && now - times[times.length - 1] > 2500) {
      tapTimesRef.current = [now];
      return;
    }

    times.push(now);
    if (times.length > 4) {
      times.shift();
    }

    if (times.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < times.length; i++) {
        intervals.push(times[i] - times[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 30 && calculatedBpm <= 260) {
        setBpm(calculatedBpm);
      }
    }
  };

  const tempoName =
    TEMPO_MARKINGS.find((t) => bpm >= t.min && bpm <= t.max)?.name || 'Moderato';

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
          <Activity className="w-4 h-4" />
          <span>Precyzyjny Metronom Audio</span>
        </div>
        <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white">
          Metronom Szkolny ZSET
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Idealny do prób muzycznych, ćwiczenia rytmu, nauki skupienia lub zabawy w grupie.
        </p>
      </div>

      {/* Main Metronome Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-7 relative overflow-hidden">
        {/* Subtle rainbow glow on top edge */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-600" />

        {/* Transient Session Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">Domyślny start przy każdej wizycie:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Takt 4/4 • Brzmienie Klasyczny • Moderato 120 BPM
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetDefaults}
            title="Przywróć domyślne ustawienia (120 BPM, 4/4, Klasyczny)"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950/60 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-500" />
            <span>Domyślne (120 BPM)</span>
          </button>
        </div>

        {/* Big BPM Display & Tempo description */}
        <div className="text-center space-y-1">
          <div className="text-xs uppercase font-bold tracking-widest text-purple-600 dark:text-purple-400">
            {tempoName}
          </div>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-6xl sm:text-7xl font-black font-display tracking-tight text-slate-900 dark:text-white">
              {bpm}
            </span>
            <span className="text-xl font-bold text-slate-400">BPM</span>
          </div>
        </div>

        {/* Visual Beats Indicator */}
        <div className="flex items-center justify-center gap-3 py-2">
          {Array.from({ length: beatsPerMeasure }).map((_, idx) => {
            const isCurrent = isPlaying && currentBeat === idx;
            const isAccent = idx === 0;

            return (
              <div
                key={idx}
                className={`transition-all duration-100 flex flex-col items-center gap-1.5`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${
                    isCurrent
                      ? isAccent
                        ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white scale-110 shadow-lg shadow-red-500/30'
                        : 'bg-purple-600 text-white scale-105 shadow-md shadow-purple-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {idx + 1}
                </div>
                <span className="text-[10px] font-semibold text-slate-400">
                  {isAccent ? 'Akcent' : 'Takt'}
                </span>
              </div>
            );
          })}
        </div>

        {/* BPM Slider & Step Buttons */}
        <div className="space-y-4 max-w-xl mx-auto">
          <input
            type="range"
            min={30}
            max={250}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setBpm((b) => Math.max(30, b - 5))}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              -5
            </button>
            <button
              onClick={() => setBpm((b) => Math.max(30, b - 1))}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1"
            >
              <Minus className="w-3 h-3" /> 1
            </button>
            <button
              onClick={handleTapTempo}
              className="px-5 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-200 dark:hover:bg-purple-900 border border-purple-300 dark:border-purple-800"
            >
              👉 TAP TEMPO
            </button>
            <button
              onClick={() => setBpm((b) => Math.min(250, b + 1))}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> 1
            </button>
            <button
              onClick={() => setBpm((b) => Math.min(250, b + 5))}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              +5
            </button>
          </div>
        </div>

        {/* Play / Stop Big Action Button */}
        <div className="flex justify-center pt-2">
          <button
            id="btn-toggle-metronome"
            onClick={handleTogglePlay}
            className={`px-10 py-4 rounded-3xl font-bold text-lg flex items-center gap-3 shadow-xl transition-all transform active:scale-95 ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-6 h-6 fill-current" />
                <span>Zatrzymaj</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-current" />
                <span>Uruchom Metronom</span>
              </>
            )}
          </button>
        </div>

        {/* Controls: Time Signature & Sound Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          {/* Time Signature */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Metrum (ilość uderzeń w takcie):
            </label>
            <div className="flex gap-2">
              {[2, 3, 4, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => setBeatsPerMeasure(num)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    beatsPerMeasure === num
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {num}/4
                </button>
              ))}
            </div>
          </div>

          {/* Sound Type */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Brzmienie dźwięku:
            </label>
            <div className="flex gap-2">
              {[
                { id: 'classic', label: 'Klasyczny' },
                { id: 'wood', label: 'Drewno' },
                { id: 'digital', label: 'Cyfrowy' },
                { id: 'bell', label: 'Dzwonek' },
              ].map((snd) => (
                <button
                  key={snd.id}
                  onClick={() => setSoundType(snd.id as typeof soundType)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                    soundType === snd.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {snd.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
