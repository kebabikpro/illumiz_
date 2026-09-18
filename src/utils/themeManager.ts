/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IndividualThemeId } from '../types';

export interface ThemeConfig {
  id: IndividualThemeId;
  name: string;
  tagline: string;
  isDark: boolean;
  previewGradient: string;
  accentHex: string;
  badge: string;
  accentClass: string;
}

export const INDIVIDUAL_THEMES: ThemeConfig[] = [
  {
    id: 'midnight-pride',
    name: 'Midnight Pride',
    tagline: 'Głęboki mroczny fiolet z tęczowymi akcentami (Dark)',
    isDark: true,
    previewGradient: 'from-purple-900 via-indigo-950 to-slate-950',
    accentHex: '#a855f7',
    badge: '🏳️‍🌈 Domyślny ZSET',
    accentClass: 'text-purple-400 border-purple-500',
  },
  {
    id: 'rainbow-light',
    name: 'Tęczowa Jasność',
    tagline: 'Czysty, świeży biały styl z tęczowymi barwami (Light)',
    isDark: false,
    previewGradient: 'from-pink-100 via-purple-50 to-indigo-100',
    accentHex: '#9333ea',
    badge: '☀️ Czysty Jasny',
    accentClass: 'text-purple-600 border-purple-400',
  },
  {
    id: 'cyberpunk-ti',
    name: 'Cyberpunk TI / TP',
    tagline: 'Ciemny grafit z neonowym turkusem i różem (Dark)',
    isDark: true,
    previewGradient: 'from-cyan-950 via-slate-950 to-fuchsia-950',
    accentHex: '#06b6d4',
    badge: '⚡ Informatyk ZSET',
    accentClass: 'text-cyan-400 border-cyan-500',
  },
  {
    id: 'sunset-rynek',
    name: 'Zachód Słońca na Rynku',
    tagline: 'Ciepły burgund, purpura, magenta i złoto (Dark)',
    isDark: true,
    previewGradient: 'from-rose-950 via-purple-950 to-amber-950',
    accentHex: '#f43f5e',
    badge: '🌅 Leszczyński Rynek',
    accentClass: 'text-rose-400 border-rose-500',
  },
  {
    id: 'emerald-green',
    name: 'Szmaragd & Spokój',
    tagline: 'Kojąca ciemna zieleń, szmaragd i mięta (Dark)',
    isDark: true,
    previewGradient: 'from-emerald-950 via-teal-950 to-slate-950',
    accentHex: '#10b981',
    badge: '🌲 Park 1000-lecia',
    accentClass: 'text-emerald-400 border-emerald-500',
  },
  {
    id: 'amoled-dark',
    name: 'AMOLED Pure Black',
    tagline: 'Czysta czerń 0% na ekrany OLED z neonową tęczą (Dark)',
    isDark: true,
    previewGradient: 'from-black via-zinc-950 to-black',
    accentHex: '#d946ef',
    badge: '🖤 Ekran OLED (0%)',
    accentClass: 'text-fuchsia-400 border-fuchsia-500',
  },
];

const THEME_STORAGE_KEY = 'zset_individual_theme_v2';

export function getStoredTheme(): IndividualThemeId {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && INDIVIDUAL_THEMES.some((t) => t.id === saved)) {
      return saved as IndividualThemeId;
    }
  } catch (e) {
    console.error('Failed to read theme from localStorage:', e);
  }
  return 'midnight-pride';
}

export function applyIndividualTheme(themeId: IndividualThemeId) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch (e) {
    console.error('Failed to write theme to localStorage:', e);
  }

  const themeConfig = INDIVIDUAL_THEMES.find((t) => t.id === themeId) || INDIVIDUAL_THEMES[0];
  const root = document.documentElement;

  // Set individual theme data-attribute on <html> and <body>
  root.setAttribute('data-individual-theme', themeId);
  if (typeof document !== 'undefined' && document.body) {
    document.body.setAttribute('data-individual-theme', themeId);

    // Remove any previous theme-* classes
    INDIVIDUAL_THEMES.forEach((t) => {
      root.classList.remove(`theme-${t.id}`);
      document.body.classList.remove(`theme-${t.id}`);
    });
    root.classList.add(`theme-${themeId}`);
    document.body.classList.add(`theme-${themeId}`);

    // Toggle .dark class based on theme lightness
    if (themeConfig.isDark) {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }
}
