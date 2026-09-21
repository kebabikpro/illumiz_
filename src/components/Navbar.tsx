/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  MessageSquare, 
  Compass, 
  Activity, 
  Gamepad2,
  Link as LinkIcon, 
  ShieldAlert, 
  Database,
  User,
  Palette,
  Check,
  Pencil
} from 'lucide-react';
import { ZsetPrideLogo } from './ZsetPrideLogo';
import { useAppData } from '../context/DataContext';
import { INDIVIDUAL_THEMES } from '../utils/themeManager';
import { IndividualThemeId } from '../types';
import { ViewModeSwitch, ViewMode } from './ViewModeSwitch';

interface NavbarProps {
  activeTab: 'home' | 'chat' | 'wheel' | 'metronome' | 'games' | 'links';
  setActiveTab: (tab: 'home' | 'chat' | 'wheel' | 'metronome' | 'games' | 'links') => void;
  isDarkMode?: boolean;
  setIsDarkMode?: (val: boolean | ((prev: boolean) => boolean)) => void;
  onPanicExit: () => void;
  onOpenStorageModal: () => void;
  onOpenProfileModal: () => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onPanicExit,
  onOpenStorageModal,
  onOpenProfileModal,
  viewMode = 'auto',
  onViewModeChange,
}) => {
  const { data, activeTheme, setIndividualTheme, isAdmin } = useAppData();
  const profile = data.userProfile;
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Close theme dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentThemeObj = INDIVIDUAL_THEMES.find((t) => t.id === activeTheme) || INDIVIDUAL_THEMES[0];

  const navItems = [
    { id: 'home', label: 'Start', icon: Home },
    { id: 'chat', label: 'Czat', icon: MessageSquare },
    { id: 'wheel', label: 'Koło', icon: Compass },
    { id: 'metronome', label: 'Metronom', icon: Activity },
    { id: 'games', label: 'Gry', icon: Gamepad2 },
    { id: 'links', label: 'Linki', icon: LinkIcon },
  ];

  const getPresetEmoji = (preset?: string) => {
    switch (preset) {
      case 'pride-flag': return '🏳️‍🌈';
      case 'zset-tech': return '⚡';
      case 'unicorn': return '🦄';
      case 'coffee': return '☕';
      case 'cat': return '🐾';
      case 'headphones': return '🎧';
      case 'fire': return '🔥';
      case 'gamepad': return '🎮';
      case 'flower': return '🌸';
      case 'star': return '✨';
      case 'pizza': return '🍕';
      case 'rainbow-heart':
      default:
        return '💖';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors w-full max-w-full overflow-x-clip">
      <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-1.5 sm:gap-2">
          {/* Logo & Brand */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 sm:gap-2.5 text-left group focus:outline-none cursor-pointer flex-shrink-0"
          >
            <ZsetPrideLogo size="md" variant="badge" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1 sm:gap-1.5 font-black text-slate-900 dark:text-white leading-tight font-display tracking-tight text-sm sm:text-base lg:text-lg">
                <span>ZSET</span>
                <span className="text-purple-600 dark:text-purple-400">Leszno</span>
                <span className="text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500 via-amber-400 via-emerald-500 to-indigo-500 text-white font-extrabold tracking-wider uppercase ml-0.5 shadow-xs">
                  GAYSPACE
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 hidden xl:inline">
                Podziemna platforma społecznościowa
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className={`${viewMode === 'mobile' ? 'hidden' : viewMode === 'pc' ? 'flex' : 'hidden lg:flex'} items-center gap-0.5 xl:gap-1 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex-shrink-0`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id as typeof activeTab)}
                  className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Controls: View Mode Switcher, Quick Theme, Storage, Panic Button & Prominent User Profile */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* View Mode Switcher (PC / Mobile / Auto) */}
            {onViewModeChange && (
              <ViewModeSwitch
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
                variant="navbar"
              />
            )}

            {/* Quick Individual Theme Selector Dropdown */}
            <div className="relative" ref={themeMenuRef}>
              <button
                id="btn-individual-theme-toggle"
                onClick={() => setIsThemeMenuOpen((prev) => !prev)}
                title="Wybierz Twój motyw (zmienia wygląd tylko na Twoim ekranie)"
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-semibold flex-shrink-0"
              >
                <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span className="hidden 2xl:inline text-[11px] font-medium">{currentThemeObj.name}</span>
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: currentThemeObj.accentHex }}
                />
              </button>

              {isThemeMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-2">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-purple-500" />
                      <span>Twój Indywidualny Motyw</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                      Zmiana dotyczy wyłącznie Twojego urządzenia i nie wpływa na innych użytkowników.
                    </p>
                  </div>

                  <div className="space-y-1">
                    {INDIVIDUAL_THEMES.map((theme) => {
                      const isSelected = activeTheme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => {
                            setIndividualTheme(theme.id);
                            setIsThemeMenuOpen(false);
                          }}
                          className={`w-full p-2 rounded-xl text-left text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-purple-500/15 border border-purple-500/40 text-purple-900 dark:text-purple-200 font-semibold'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${theme.previewGradient} flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-xs`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <div className="min-w-0 truncate">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate">{theme.name}</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                  {theme.badge}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: theme.accentHex }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Storage Status & Backup Button */}
            <button
              onClick={onOpenStorageModal}
              title="Zarządzaj zapisem danych i kopią zapasową"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
            >
              <div className="relative">
                <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              </div>
              <span className="hidden 2xl:inline">Zapis</span>
            </button>

            {/* Quick Exit (Panic Button) for School Discretion */}
            <button
              id="btn-panic-exit"
              onClick={onPanicExit}
              title="Szybka ucieczka (ukryj stronę natychmiast, gdy zbliża się nauczyciel!)"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer flex-shrink-0"
            >
              <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
              <span className="hidden sm:inline">Ucieczka</span>
            </button>

            {/* PROMINENT USER PROFILE IN THE TOP RIGHT CORNER (Click to edit anytime) */}
            <button
              id="btn-nav-profile"
              onClick={onOpenProfileModal}
              title="Twój profil ucznia ZSET — kliknij, aby w każdej chwili edytować swój profil"
              className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-1.5 pr-2 sm:pr-2.5 py-1 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 hover:from-purple-500/20 hover:to-indigo-500/20 border border-purple-500/30 hover:border-purple-500/60 transition-all shadow-xs cursor-pointer group flex-shrink-0"
            >
              <div className="relative flex-shrink-0">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr ${profile.avatarColor || 'from-pink-500 via-purple-500 to-indigo-500'} flex items-center justify-center text-white text-xs sm:text-sm shadow-xs overflow-hidden border border-white/30 group-hover:scale-105 transition-transform`}
                >
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Awatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{getPresetEmoji(profile.avatarPreset)}</span>
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
              </div>

              <div className="flex flex-col text-left min-w-0 max-w-[70px] sm:max-w-[100px]">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
                  {profile.displayName || profile.nick || 'Mój Profil'}
                </span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium flex items-center gap-0.5 leading-none mt-0.5">
                  <Pencil className="w-2.5 h-2.5 flex-shrink-0" />
                  <span className="truncate">Edytuj</span>
                </span>
              </div>

              {isAdmin ? (
                <span className="hidden xl:inline-block text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold border border-amber-500/40 flex-shrink-0">
                  ADMIN
                </span>
              ) : (
                <span className="hidden xl:inline-block text-[9px] px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold border border-purple-500/30 flex-shrink-0">
                  {profile.classYear ? profile.classYear.split(' ')[0] : 'ZSET'}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Navigation Row */}
        <div className={`${viewMode === 'pc' ? 'hidden' : viewMode === 'mobile' ? 'flex' : 'lg:hidden flex'} items-center justify-around py-2 border-t border-slate-200/80 dark:border-slate-800 gap-1 w-full overflow-x-auto`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as typeof activeTab)}
                className={`min-h-[44px] px-2.5 py-1 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all flex-1 min-w-[50px] cursor-pointer ${
                  isActive
                    ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-bold shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[10px] whitespace-nowrap leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
