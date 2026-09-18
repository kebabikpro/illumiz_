/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Upload, 
  Check, 
  Camera, 
  User, 
  AtSign, 
  GraduationCap, 
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';
import { useAppData } from '../context/DataContext';
import { UserProfile } from '../types';
import { generateUserId } from '../utils/personalAccount';

const AVATAR_PRESETS = [
  { id: 'rainbow-heart', label: 'Tęczowe Serce', emoji: '💖' },
  { id: 'pride-flag', label: 'Flaga Dumy', emoji: '🏳️‍🌈' },
  { id: 'zset-tech', label: 'ZSET Tech', emoji: '⚡' },
  { id: 'unicorn', label: 'Jednorożec', emoji: '🦄' },
  { id: 'coffee', label: 'Kawa na Rynku', emoji: '☕' },
  { id: 'cat', label: 'Kotek', emoji: '🐾' },
  { id: 'headphones', label: 'Muzyka', emoji: '🎧' },
  { id: 'gamepad', label: 'Gry', emoji: '🎮' },
  { id: 'flower', label: 'Kwiat', emoji: '🌸' },
  { id: 'star', label: 'Gwiazda', emoji: '✨' },
];

const GRADIENT_OPTIONS = [
  { id: 'pride', label: 'Tęcza Pride', class: 'from-pink-500 via-purple-500 to-indigo-500' },
  { id: 'sunset', label: 'Zachód słońca', class: 'from-amber-500 via-rose-500 to-purple-600' },
  { id: 'ocean', label: 'Głębia oceanu', class: 'from-blue-600 via-cyan-500 to-emerald-400' },
  { id: 'neon', label: 'Szmaragdowy neon', class: 'from-emerald-500 via-teal-500 to-cyan-500' },
  { id: 'royal', label: 'Królewski fiolet', class: 'from-purple-700 via-indigo-600 to-pink-600' },
  { id: 'dark', label: 'Mroczny ZSET', class: 'from-slate-800 via-slate-900 to-purple-950' },
];

const ZSET_CLASSES = [
  '1TI (Technik Informatyk)',
  '2TI (Technik Informatyk)',
  '3TI (Technik Informatyk)',
  '4TI (Technik Informatyk)',
  '5TI (Technik Informatyk)',
  '1TP (Technik Programista)',
  '2TP (Technik Programista)',
  '3TP (Technik Programista)',
  '4TP (Technik Programista)',
  '5TP (Technik Programista)',
  '1TE (Technik Elektronik)',
  '2TE (Technik Elektronik)',
  '3TE (Technik Elektronik)',
  '4TE (Technik Elektronik)',
  '5TE (Technik Elektronik)',
  '1TT (Technik Teleinformatyk)',
  '2TT (Technik Teleinformatyk)',
  '3TT (Technik Teleinformatyk)',
  '4TT (Technik Teleinformatyk)',
  '5TT (Technik Teleinformatyk)',
  'Absolwent ZSET',
  'Inna klasa / Gość',
];

const PRESET_STATUSES = [
  '🟢 Aktywny na przerwie',
  '📚 Na lekcji w ZSET',
  '☕ Kawa i ciacho na Rynku',
  '🎮 Gram po lekcjach',
  '🎧 Słucham muzyki',
  '🍔 Przerwa na kebaba',
  '💬 Chętnie pogadam',
];

export const OnboardingProfileModal: React.FC = () => {
  const { isProfileSetupRequired, savePersonalProfileData, activeTheme } = useAppData();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreset, setAvatarPreset] = useState('rainbow-heart');
  const [avatarColor, setAvatarColor] = useState('from-pink-500 via-purple-500 to-indigo-500');
  const [classYear, setClassYear] = useState('3TI (Technik Informatyk)');
  const [statusMessage, setStatusMessage] = useState('🟢 Aktywny na przerwie');
  const [bio, setBio] = useState('Uczeń ZSET Leszno. Bezpieczna i otwarta przestrzeń.');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // If already set up, do not show onboarding
  if (!isProfileSetupRequired) return null;

  // Handle local image file upload & compression
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Wybierz plik graficzny (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Rozmiar pliku nie może przekraczać 5MB.');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 256;
        let w = img.width;
        let h = img.height;
        const minDim = Math.min(w, h);
        const sx = (w - minDim) / 2;
        const sy = (h - minDim) / 2;

        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, maxSize, maxSize);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setAvatarUrl(compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanNick = displayName.trim() || 'Uczeń ZSET';
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || ('uczen_' + Math.random().toString(36).substring(2, 6));

    const newProfile: UserProfile = {
      id: generateUserId(),
      displayName: cleanNick,
      username: cleanUsername,
      avatarUrl: avatarUrl.trim(),
      avatarPreset,
      avatarColor,
      classYear: classYear.trim() || 'ZSET',
      statusMessage: statusMessage.trim() || '🟢 Aktywny na przerwie',
      bio: bio.trim(),
      theme: activeTheme || 'midnight-pride',
      createdAt: new Date().toISOString(),
      nick: cleanNick,
    };

    savePersonalProfileData(newProfile);
  };

  const selectedPresetObj = AVATAR_PRESETS.find((p) => p.id === avatarPreset);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border-2 border-purple-500/50 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-purple-900/40 flex-shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg text-2xl flex-shrink-0">
              🏳️‍🌈
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xl font-display text-white">
                  Załóż swój profil w Gayspace
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 uppercase tracking-wider">
                  Krok 1 / 1
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Każdy uczeń ZSET posiada własne, niezależne konto z nickiem, klasą i wybranym motywem
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Welcome Info Box */}
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-3">
            <HeartHandshake className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">
                Witaj w bezpiecznej społeczności uczniów ZSET Leszno!
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Twój profil będzie widoczny na czacie grupowym i tablicy spotkań. Zapisuje się indywidualnie na Twoim telefonie lub komputerze, dzięki czemu zachowujesz pełną prywatność i niezależność od innych uczniów.
              </p>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs">
            <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Twój podgląd profilu:</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                <div
                  className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${avatarColor} flex items-center justify-center text-white shadow-lg overflow-hidden border-2 border-white dark:border-slate-800`}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Awatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl select-none">{selectedPresetObj?.emoji || '💖'}</span>
                  )}
                </div>
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-sm" />
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white font-display truncate">
                    {displayName.trim() || 'Twoje Imię / Nick'}
                  </h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800">
                    {classYear.split(' ')[0] || 'ZSET'}
                  </span>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1 font-mono">
                  <span>@{username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || 'twoj_nick'}</span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">{statusMessage}</span>
                </div>

                {bio && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 pt-0.5">
                    {bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields: Display Name & Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Twoje Imię lub Nick (wyświetlana nazwa) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  maxLength={30}
                  placeholder="np. Michał, Kacper, Anonim 4TI"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Unikalny identyfikator (@username) *
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  maxLength={25}
                  placeholder="np. michal_zset"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                  }
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* School Class */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Twoja klasa / profil w ZSET Leszno:
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={classYear}
                onChange={(e) => setClassYear(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                {ZSET_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Avatar Picture & Presets */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Awatar / Zdjęcie profilowe:
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{avatarUrl ? 'Zmień wgrane zdjęcie' : 'Wgraj zdjęcie z urządzenia'}</span>
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  Usuń zdjęcie
                </button>
              )}

              <span className="text-[11px] text-slate-400">lub wybierz symbol poniżej:</span>
            </div>

            {uploadError && (
              <p className="text-xs text-rose-500 font-semibold">{uploadError}</p>
            )}

            {/* Presets Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = avatarPreset === preset.id && !avatarUrl;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setAvatarPreset(preset.id);
                      setAvatarUrl('');
                    }}
                    title={preset.label}
                    className={`h-11 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600/20 border-2 border-purple-500 scale-105 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:scale-105'
                    }`}
                  >
                    <span>{preset.emoji}</span>
                  </button>
                );
              })}
            </div>

            {/* Background Gradient for avatar */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Tło awatara:</span>
              {GRADIENT_OPTIONS.map((grad) => (
                <button
                  key={grad.id}
                  type="button"
                  onClick={() => setAvatarColor(grad.class)}
                  title={grad.label}
                  className={`w-6 h-6 rounded-full bg-gradient-to-tr ${grad.class} transition-all cursor-pointer ${
                    avatarColor === grad.class
                      ? 'ring-2 ring-purple-500 ring-offset-2 scale-110'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Status Message Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Status aktywności:
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_STATUSES.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusMessage(st)}
                  className={`px-2.5 py-1 rounded-xl text-xs transition-colors cursor-pointer ${
                    statusMessage === st
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            <input
              type="text"
              maxLength={40}
              placeholder="Wpisz własny status..."
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Privacy Note */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Dyskrecja i bezpieczeństwo:</strong> Twoje konto jest przypisane do Twojej przeglądarki. Po utworzeniu profilu możesz w każdej chwili edytować dane lub zmienić motyw w prawym górnym rogu.
            </span>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!displayName.trim() || !username.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-5 h-5" />
              <span>Utwórz mój profil i wejdź do Gayspace 🚀</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
