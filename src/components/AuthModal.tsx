/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  AtSign, 
  GraduationCap, 
  Upload, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  Sparkles,
  Camera
} from 'lucide-react';
import { useAppData } from '../context/DataContext';
import { loginWithEmail, registerWithEmail, loginWithGoogle } from '../utils/authService';
import { ZsetPrideLogo } from './ZsetPrideLogo';

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

export const AuthModal: React.FC = () => {
  const { isProfileSetupRequired, savePersonalProfileData, activeTheme } = useAppData();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [classYear, setClassYear] = useState('3TI (Technik Informatyk)');
  const [avatarPreset, setAvatarPreset] = useState('rainbow-heart');
  const [avatarColor, setAvatarColor] = useState('from-pink-500 via-purple-500 to-indigo-500');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Google modal prompt state
  const [isGoogleCustomizing, setIsGoogleCustomizing] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('kebabpanmuala@gmail.com');
  const [googleNameInput, setGoogleNameInput] = useState('Kebab Pan Muala');

  // Error & loading
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isProfileSetupRequired) return null;

  // Handle image upload & base64 conversion
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Plik zdjęcia jest za duży (maksymalnie 2MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarUrl(result);
      setErrorMessage(null);
    };
    reader.onerror = () => {
      setErrorMessage('Nie udało się wczytać zdjęcia.');
    };
    reader.readAsDataURL(file);
  };

  // 1. Handle Real Email & Password Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await loginWithEmail(email, password);
      if (!result.success) {
        setErrorMessage(result.error || 'Błąd logowania.');
        return;
      }

      if (result.account) {
        savePersonalProfileData(result.account);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Wystąpił nieoczekiwany błąd podczas logowania.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Handle Real Email & Password Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const cleanNick = username.trim().replace(/^@/, '') || displayName.toLowerCase().replace(/\s+/g, '_') || 'uczen';

      const result = await registerWithEmail({
        email,
        password,
        displayName: displayName.trim(),
        username: cleanNick,
        classYear,
        avatarUrl,
        avatarPreset,
        avatarColor,
        theme: activeTheme || 'midnight-pride',
        statusMessage: '🟢 Aktywny na przerwie',
        bio: 'Uczeń ZSET Leszno. Bezpieczna i otwarta przestrzeń.',
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Błąd rejestracji.');
        if (result.error?.includes('już istnieje')) {
          setTimeout(() => setMode('login'), 2000);
        }
        return;
      }

      if (result.account) {
        savePersonalProfileData(result.account);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Wystąpił nieoczekiwany błąd podczas rejestracji.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle Real Google Login
  const handleGoogleLogin = async (customEmail?: string, customName?: string) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    const targetEmail = customEmail || googleEmailInput || 'kebabpanmuala@gmail.com';
    const targetName = customName || googleNameInput || 'Uczeń ZSET';

    try {
      const result = await loginWithGoogle({
        email: targetEmail,
        name: targetName,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(targetEmail)}`,
      });

      if (result.success && result.account) {
        savePersonalProfileData(result.account);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Wystąpił błąd podczas logowania Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header with ZSET GaySpace Branding */}
        <div className="p-6 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-indigo-500/10 border-b border-slate-200 dark:border-slate-800 text-center relative">
          <div className="flex justify-center mb-2.5">
            <ZsetPrideLogo size="lg" variant="badge" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
            ZSET <span className="text-purple-600 dark:text-purple-400">Leszno</span> GaySpace
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Zaloguj się na swoje stałe konto uczniowskie lub utwórz nowe, aby brać udział w czacie i społeczności.
          </p>
        </div>

        {/* Mode Selector Tabs (Logowanie vs Rejestracja) */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-1.5">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(null); }}
            className={`flex-1 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Zaloguj się</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMessage(null); }}
            className={`flex-1 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Załóż stałe konto</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Error / Success feedback */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <Check className="w-4 h-4 flex-shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Quick Google Sign In Option */}
          <div className="space-y-2">
            {!isGoogleCustomizing ? (
              <button
                type="button"
                onClick={() => handleGoogleLogin('kebabpanmuala@gmail.com', 'Kebab Pan Muala')}
                className="w-full py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer group"
              >
                {/* Official Google G Icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Kontynuuj przez Google (kebabpanmuala@gmail.com)</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 animate-in fade-in">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Wybierz konto Google:
                </div>
                <input
                  type="email"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="twoj-email@gmail.com"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleGoogleLogin(googleEmailInput, googleEmailInput.split('@')[0])}
                    className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Zaloguj tym mailem Google
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsGoogleCustomizing(false)}
                    className="px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Anuluj
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsGoogleCustomizing(!isGoogleCustomizing)}
                className="text-[11px] text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors cursor-pointer underline underline-offset-2"
              >
                {!isGoogleCustomizing ? 'Zaloguj innym kontem Google' : 'Użyj domyślnego konta Google'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:border-slate-800" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              lub przez Email i Hasło
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:border-slate-800" />
          </div>

          {/* MODE 1: LOGOWANIE */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-500" />
                  <span>Adres e-mail lub Nazwa użytkownika (@nick)</span>
                </label>
                <input
                  type="text"
                  required
                  value={email}
                  disabled={isSubmitting}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="np. kebabpanmuala@gmail.com lub @illumiz_"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-500" />
                    <span>Hasło</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Ukryj' : 'Pokaż'}</span>
                  </button>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  disabled={isSubmitting}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Wpisz hasło do Twojego konta"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Zapamiętaj mnie na tym urządzeniu</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'Logowanie i weryfikacja...' : 'Zaloguj do ZSET GaySpace'}</span>
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nie masz jeszcze konta?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setErrorMessage(null); }}
                    className="font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    Zarejestruj się bezpłatnie
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* MODE 2: REJESTRACJA STAŁEGO KONTA */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-purple-500" />
                    <span>Adres e-mail</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="twoj-email@gmail.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-purple-500" />
                      <span>Hasło</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      {showPassword ? 'Ukryj' : 'Pokaż'}
                    </button>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={5}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 5 znaków"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-pink-500" />
                    <span>Imię lub Ksywka</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="np. Kuba TI, Alex"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                    <AtSign className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Nazwa użytkownika (@nick)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="kuba_3ti"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Twoja klasa / kierunek w ZSET</span>
                </label>
                <select
                  value={classYear}
                  onChange={(e) => setClassYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  {ZSET_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Avatar selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-purple-500" />
                  <span>Wybierz awatar na czat</span>
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => { setAvatarPreset(preset.id); setAvatarUrl(''); }}
                      className={`p-2 rounded-xl border text-base flex-shrink-0 transition-all cursor-pointer ${
                        avatarPreset === preset.id && !avatarUrl
                          ? 'border-purple-500 bg-purple-500/15 scale-110 shadow-xs ring-2 ring-purple-500/30'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={preset.label}
                    >
                      {preset.emoji}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2 rounded-xl border text-xs flex-shrink-0 flex items-center gap-1 font-semibold transition-all cursor-pointer ${
                      avatarUrl
                        ? 'border-purple-500 bg-purple-500/15 text-purple-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100'
                    }`}
                    title="Wgraj własne zdjęcie"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Wgraj</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'Zakładanie i zapisywanie konta...' : 'Utwórz stałe konto i wejdź'}</span>
              </button>

              <div className="text-center pt-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Masz już konto?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setErrorMessage(null); }}
                    className="font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    Zaloguj się hasłem
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Privacy Footnote */}
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-800 dark:text-purple-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Bezpieczeństwo i Dyskrecja ZSET:</strong> Twoje konto jest stałe i powiązane z Twoim mailem. Żadne osoby trzecie ani nauczyciele nie mają dostępu do Twojego profilu.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
