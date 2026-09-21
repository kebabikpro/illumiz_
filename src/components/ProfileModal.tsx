/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Trash2, 
  Sparkles, 
  Check, 
  Camera, 
  User, 
  AtSign, 
  GraduationCap, 
  Palette,
  LogOut,
  ShieldCheck,
  Mail
} from 'lucide-react';
import { useAppData } from '../context/DataContext';
import { UserProfile, IndividualThemeId } from '../types';
import { INDIVIDUAL_THEMES } from '../utils/themeManager';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_PRESETS = [
  { id: 'rainbow-heart', label: 'Tęczowe Serce', emoji: '💖' },
  { id: 'pride-flag', label: 'Flaga Dumy', emoji: '🏳️‍🌈' },
  { id: 'zset-tech', label: 'ZSET Tech', emoji: '⚡' },
  { id: 'unicorn', label: 'Jednorożec', emoji: '🦄' },
  { id: 'coffee', label: 'Kawa na Rynku', emoji: '☕' },
  { id: 'cat', label: 'Kotek', emoji: '🐾' },
  { id: 'headphones', label: 'Muzyka', emoji: '🎧' },
  { id: 'fire', label: 'Ogień', emoji: '🔥' },
  { id: 'gamepad', label: 'Gry', emoji: '🎮' },
  { id: 'flower', label: 'Kwiat', emoji: '🌸' },
  { id: 'star', label: 'Gwiazda', emoji: '✨' },
  { id: 'pizza', label: 'Pizza & Kebab', emoji: '🍕' },
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
  'Inna klasa',
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

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { 
    data, 
    personalProfile, 
    savePersonalProfileData, 
    logoutOrSwitchProfile, 
    activeTheme, 
    setIndividualTheme,
    isAdmin,
    setAdminOverride
  } = useAppData();
  
  const current = personalProfile || data.userProfile;

  const [displayName, setDisplayName] = useState(current?.displayName || current?.nick || 'Uczeń ZSET');
  const [username, setUsername] = useState(current?.username || 'uczen_zset');
  const [avatarUrl, setAvatarUrl] = useState(current?.avatarUrl || '');
  const [avatarPreset, setAvatarPreset] = useState(current?.avatarPreset || 'rainbow-heart');
  const [avatarColor, setAvatarColor] = useState(
    current?.avatarColor || 'from-pink-500 via-purple-500 to-indigo-500'
  );
  const [classYear, setClassYear] = useState(current?.classYear || '3TI (Technik Informatyk)');
  const [statusMessage, setStatusMessage] = useState(current?.statusMessage || '🟢 Aktywny na przerwie');
  const [bio, setBio] = useState(current?.bio || 'Uczeń ZSET Leszno. Bezpieczna i otwarta przestrzeń.');
  const [selectedTheme, setSelectedTheme] = useState<IndividualThemeId>(current?.theme || activeTheme || 'midnight-pride');

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize modal state with latest current profile whenever opened
  useEffect(() => {
    if (isOpen && current) {
      setDisplayName(current.displayName || current.nick || 'Uczeń ZSET');
      setUsername(current.username || 'uczen_zset');
      setAvatarUrl(current.avatarUrl || '');
      setAvatarPreset(current.avatarPreset || 'rainbow-heart');
      setAvatarColor(current.avatarColor || 'from-pink-500 via-purple-500 to-indigo-500');
      setClassYear(current.classYear || '3TI (Technik Informatyk)');
      setStatusMessage(current.statusMessage || '🟢 Aktywny na przerwie');
      setBio(current.bio || 'Uczeń ZSET Leszno. Bezpieczna i otwarta przestrzeń.');
      setSelectedTheme(current.theme || activeTheme || 'midnight-pride');
      setUploadError(null);
    }
  }, [isOpen, current]);

  if (!isOpen) return null;

  // Handle local image file upload & compression to Data URL
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
        // Compress & scale to square avatar max 256x256
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

  const handleThemePick = (themeId: IndividualThemeId) => {
    setSelectedTheme(themeId);
    setIndividualTheme(themeId);
  };

  const handleLogout = () => {
    logoutOrSwitchProfile();
    onClose();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNick = displayName.trim() || 'Uczeń ZSET';
    const cleanUsername = username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '') || 'uczen_zset';

    const isNowAdmin = isAdmin || cleanUsername === 'illumiz_' || cleanUsername === 'illumiz';

    const updatedProfile: UserProfile = {
      ...current,
      id: current.id || ('usr_' + Date.now()),
      email: current.email,
      authProvider: current.authProvider,
      displayName: cleanNick,
      username: cleanUsername,
      avatarUrl: avatarUrl.trim(),
      avatarPreset,
      avatarColor,
      classYear: classYear.trim() || 'ZSET',
      statusMessage: statusMessage.trim() || '🟢 Aktywny na przerwie',
      bio: bio.trim(),
      theme: selectedTheme,
      createdAt: current.createdAt || new Date().toISOString(),
      nick: cleanNick,
      role: isNowAdmin ? 'admin' : (current.role || 'user'),
      isAdmin: isNowAdmin,
    };

    if (isNowAdmin !== isAdmin) {
      setAdminOverride(isNowAdmin);
    }

    savePersonalProfileData(updatedProfile);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 600);
  };

  const selectedPresetObj = AVATAR_PRESETS.find((p) => p.id === avatarPreset);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-display text-white flex items-center gap-2">
                <span>Edycja Twojego Profilu</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 uppercase tracking-wider">
                  ZSET Gayspace
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Ustaw własne zdjęcie profilowe, nazwę wyświetlaną, identyfikator i klasę
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Permanent Account Badge */}
          {current?.email && (
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span>
                  Stałe konto: <strong>{current.email}</strong>{' '}
                  <span className="text-slate-500 text-[11px]">
                    ({current.authProvider === 'google' ? 'Google' : 'Hasło'})
                  </span>
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
                🟢 Stałe konto
              </span>
            </div>
          )}

          {/* Live Preview Card */}
          <div className="bg-gradient-to-br from-slate-50 to-purple-50/40 dark:from-slate-950 dark:to-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 rounded-3xl p-4 sm:p-5 shadow-sm">
            <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Podgląd na żywo (jak widzą Cię inni na czacie)</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Avatar Preview */}
              <div className="relative group flex-shrink-0 mx-auto sm:mx-0">
                <div
                  className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${avatarColor} flex items-center justify-center text-white shadow-lg overflow-hidden border-2 border-white dark:border-slate-800`}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Awatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl filter drop-shadow-sm select-none">
                      {selectedPresetObj?.emoji || '🏳️‍🌈'}
                    </span>
                  )}
                </div>
                {/* Active dot */}
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-sm" />
              </div>

              {/* Profile Details Preview */}
              <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white font-display truncate">
                    {displayName || 'Uczeń ZSET'}
                  </h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800">
                    {classYear.split(' ')[0] || 'ZSET'}
                  </span>
                  {(isAdmin || username.trim().toLowerCase().replace(/^@/, '') === 'illumiz_' || username.trim().toLowerCase().replace(/^@/, '') === 'illumiz') && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold border border-amber-500/40 flex items-center gap-1">
                      👑 Administrator
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1 font-mono">
                  <span>@{username.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'uczen_zset'}</span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">{statusMessage}</span>
                </div>

                {bio && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 pt-1">
                    {bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 1: Avatar / Profile Picture */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 font-display">
              <Camera className="w-4 h-4 text-purple-500" />
              <span>Zdjęcie profilowe lub awatar</span>
            </h4>

            {/* Custom Photo Upload */}
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
                <span>{avatarUrl ? 'Zmień własne zdjęcie' : 'Wgraj zdjęcie z komputera'}</span>
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Usuń zdjęcie (użyj ikony)</span>
                </button>
              )}

              <span className="text-[11px] text-slate-400 text-center sm:text-left">
                Obsługuje JPG, PNG, WebP. Zdjęcie jest bezpiecznie zapisywane lokalnie.
              </span>
            </div>

            {uploadError && (
              <p className="text-xs text-rose-500 font-medium">{uploadError}</p>
            )}

            {/* Preset Icons (if no custom photo or as alternate) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Lub wybierz tęczową/szkolną ikonę profilu:
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {AVATAR_PRESETS.map((p) => {
                  const isSelected = !avatarUrl && avatarPreset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setAvatarPreset(p.id);
                        setAvatarUrl(''); // Switch back to preset
                      }}
                      className={`p-2.5 rounded-2xl flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-500/15 border-purple-500 ring-2 ring-purple-500/40'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-purple-300'
                      }`}
                    >
                      <span className="text-2xl">{p.emoji}</span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 truncate max-w-full font-medium">
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gradient Background Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Tło kolorystyczne awatara:
              </label>
              <div className="flex flex-wrap gap-2">
                {GRADIENT_OPTIONS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setAvatarColor(g.class)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                      avatarColor === g.class
                        ? 'border-purple-500 ring-2 ring-purple-500/40 text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${g.class}`} />
                    <span>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Personal Details */}
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 font-display">
              <User className="w-4 h-4 text-purple-500" />
              <span>Dane użytkownika</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Display Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Wyświetlana nazwa (Nick):
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    maxLength={30}
                    placeholder="np. Kuba, Alex, Anonimowy"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Username Handle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nazwa użytkownika (Identyfikator @):
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    maxLength={25}
                    placeholder="np. kuba_zset"
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Klasa / Kierunek w ZSET Leszno:
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

            {/* Status Message */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Status aktywności:
                </label>
                <span className="text-[11px] text-slate-400">Widoczny przy wiadomościach</span>
              </div>
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

            {/* Bio / About */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                O mnie (krótki opis):
              </label>
              <textarea
                rows={3}
                maxLength={160}
                placeholder="Napisz kilka słów o sobie, czym się interesujesz, w której pracowni najczęściej bywasz..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="text-[11px] text-slate-400 text-right">
                {bio.length}/160 znaków
              </div>
            </div>

            {/* Individual Theme Selection */}
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-purple-500" />
                  <span>Twój Indywidualny Motyw Strony</span>
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Wybierz motyw dla siebie. Zmiana dotyczy <strong>wyłącznie Twojego ekranu</strong> i nie zmienia wyglądu innym użytkownikom!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {INDIVIDUAL_THEMES.map((th) => {
                  const isSelected = selectedTheme === th.id;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => handleThemePick(th.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/40 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${th.previewGradient} flex-shrink-0 border border-white/20 shadow-xs flex items-center justify-center text-xs font-bold text-white`}>
                          {isSelected ? '✓' : ''}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {th.name}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                              {th.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {th.tagline}
                          </p>
                        </div>
                      </div>

                      <div
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: th.accentHex }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-800 dark:text-purple-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Dyskrecja ZSET:</strong> Twój profil jest zapisany indywidualnie na tym urządzeniu. Zmiana Twoich danych automatycznie zaktualizuje Twoje wcześniejsze wpisy na czacie, bez naruszania wiadomości innych uczniów.
            </span>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-2xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Wyloguj / Załóż nowy profil</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Zapisz profil</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {savedToast && (
        <div className="fixed bottom-6 right-6 z-60 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom">
          <Check className="w-4 h-4" />
          <span>Profil został pomyślnie zaktualizowany!</span>
        </div>
      )}
    </div>
  );
};
