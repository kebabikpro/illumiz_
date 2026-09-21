/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeAnnouncements } from './components/HomeAnnouncements';
import { GroupChat } from './components/GroupChat';
import { RouletteWheel } from './components/RouletteWheel';
import { Metronome } from './components/Metronome';
import { UsefulLinks } from './components/UsefulLinks';
import { GamesHub } from './components/GamesHub';
import { DisguiseScreen } from './components/DisguiseScreen';
import { ZsetPrideLogo } from './components/ZsetPrideLogo';
import { StorageModal } from './components/StorageModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { DataProvider, useAppData } from './context/DataContext';
import { ViewModeSwitch, ViewMode } from './components/ViewModeSwitch';
import { ShieldCheck, Database, Smartphone, Wifi, Battery } from 'lucide-react';

function AppContent() {
  const { activeTheme } = useAppData();
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'wheel' | 'metronome' | 'games' | 'links'>('home');
  const [isDisguised, setIsDisguised] = useState<boolean>(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem('zset_view_mode') as ViewMode;
      return saved === 'pc' || saved === 'mobile' || saved === 'auto' ? saved : 'auto';
    } catch {
      return 'auto';
    }
  });

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('zset_view_mode', mode);
    } catch {
      // Ignore storage error
    }
  };

  if (isDisguised) {
    return <DisguiseScreen onRestore={() => setIsDisguised(false)} />;
  }

  // App core content
  const appBody = (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden flex flex-col font-sans transition-colors theme-${activeTheme}`}>
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onPanicExit={() => setIsDisguised(true)}
        onOpenStorageModal={() => setIsStorageModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-2.5 sm:px-5 lg:px-6 pt-4 sm:pt-6 pb-8 overflow-x-hidden">
        {activeTab === 'home' && (
          <HomeAnnouncements 
            onNavigate={(tab) => setActiveTab(tab)} 
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
          />
        )}
        {activeTab === 'chat' && <GroupChat />}
        {activeTab === 'wheel' && <RouletteWheel />}
        {activeTab === 'metronome' && <Metronome />}
        {activeTab === 'games' && <GamesHub />}
        {activeTab === 'links' && <UsefulLinks />}
      </main>

      {/* Storage & Backup Management Modal */}
      <StorageModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
      />

      {/* User Profile Editor Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Real Login and Registration Modal for Permanent Account */}
      <AuthModal />

      {/* Footer with Rainbow border */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md relative">
        {/* Rainbow line on top of footer */}
        <div className="h-1 flex w-full">
          <div className="flex-1 bg-[#e40303]" />
          <div className="flex-1 bg-[#ff8c00]" />
          <div className="flex-1 bg-[#ffed00]" />
          <div className="flex-1 bg-[#008026]" />
          <div className="flex-1 bg-[#24408e]" />
          <div className="flex-1 bg-[#732982]" />
        </div>

        <div className="max-w-6xl mx-auto px-3 sm:px-5 lg:px-6 py-6 sm:py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <ZsetPrideLogo size="sm" variant="badge" />
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                ZSET Leszno Gayspace
              </span>
              <span className="mx-2">•</span>
              <span>Podziemna bezpieczna przestrzeń</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-center md:text-right">
            {/* View switcher in footer */}
            <ViewModeSwitch
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              variant="footer"
            />

            <button
              onClick={() => setIsStorageModalOpen(true)}
              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span>Magazyn danych & Kopia</span>
            </button>
            <span className="hidden sm:inline text-slate-400">|</span>
            <div className="flex items-center gap-1 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Prywatności</span>
            </div>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
              Twórca: <span className="font-semibold text-slate-600 dark:text-slate-300">@illumiz_</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );

  // If mobile view mode is explicitly selected, provide the phone container framing on wide screens
  if (viewMode === 'mobile') {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-start py-0 sm:py-6 px-0 sm:px-4">
        {/* Top helper bar on desktop for mobile mode */}
        <div className="w-full max-w-[440px] mb-2 hidden sm:flex items-center justify-between text-xs text-slate-400 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-slate-200">Podgląd Smartfon (Mobile)</span>
          </div>
          <button
            onClick={() => handleViewModeChange('pc')}
            className="text-[11px] text-purple-400 hover:text-purple-300 underline font-semibold cursor-pointer"
          >
            Przełącz na PC
          </button>
        </div>

        {/* Smartphone Shell */}
        <div className="w-full max-w-[440px] min-h-screen sm:min-h-[880px] bg-white dark:bg-slate-950 sm:rounded-[2.5rem] shadow-2xl sm:border-4 border-slate-800 overflow-hidden flex flex-col relative ring-0 sm:ring-8 ring-slate-900/40">
          {/* Simulated phone status bar */}
          <div className="w-full bg-slate-950 text-white px-5 py-2 flex items-center justify-between text-[11px] font-bold select-none border-b border-slate-800/60 z-30">
            <span>09:41</span>
            {/* Dynamic Island / Notch */}
            <div className="w-20 h-4 bg-black rounded-full mx-auto" />
            <div className="flex items-center gap-1.5 text-slate-300">
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Actual content inside mobile shell */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
            {appBody}
          </div>
        </div>

        {/* Floating Switcher */}
        <ViewModeSwitch
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          variant="floating"
        />
      </div>
    );
  }

  // Auto or PC mode
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {appBody}

      {/* Quick floating view mode switch */}
      <ViewModeSwitch
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        variant="floating"
      />
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
