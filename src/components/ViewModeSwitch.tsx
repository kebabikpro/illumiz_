/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Monitor, Smartphone, Sparkles } from 'lucide-react';

export type ViewMode = 'auto' | 'pc' | 'mobile';

interface ViewModeSwitchProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  variant?: 'navbar' | 'floating' | 'footer';
}

export const ViewModeSwitch: React.FC<ViewModeSwitchProps> = ({
  viewMode,
  onViewModeChange,
  variant = 'navbar',
}) => {
  const options: { id: ViewMode; label: string; shortLabel: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'auto', label: 'Auto (Responsywny)', shortLabel: 'Auto', icon: Sparkles },
    { id: 'pc', label: 'Widok PC / Komputer', shortLabel: 'PC', icon: Monitor },
    { id: 'mobile', label: 'Widok Smartfon / Mobile', shortLabel: 'Mobile', icon: Smartphone },
  ];

  if (variant === 'floating') {
    return (
      <div 
        id="floating-view-mode-switch" 
        className="fixed bottom-4 right-4 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-300 dark:border-slate-700 shadow-2xl rounded-2xl p-1 flex items-center gap-1 text-xs"
        role="group"
        aria-label="Wybór widoku urządzenia"
      >
        <div className="px-2 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1">
          <span>Widok:</span>
        </div>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = viewMode === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onViewModeChange(opt.id)}
              title={opt.label}
              className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{opt.shortLabel}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
        <span className="text-[11px] font-semibold text-slate-500 px-2">Widok:</span>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = viewMode === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onViewModeChange(opt.id)}
              title={opt.label}
              className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{opt.shortLabel}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div 
      className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex-shrink-0"
      title="Wybór widoku: PC lub Smartfon"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = viewMode === opt.id;
        return (
          <button
            key={opt.id}
            id={`btn-viewmode-${opt.id}`}
            onClick={() => onViewModeChange(opt.id)}
            title={opt.label}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              isActive
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">{opt.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
};
