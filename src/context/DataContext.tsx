/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppStateData, ChatMessage, WheelOption, Announcement, UsefulLink, UserProfile, IndividualThemeId } from '../types';
import { 
  getLocalData, 
  saveAllData, 
  syncWithAiStudioServer, 
  subscribeToSyncStatus, 
  downloadBackupJson, 
  restoreBackupJson, 
  resetAllDataToClean 
} from '../utils/storageSync';
import { 
  getPersonalProfile, 
  savePersonalProfile, 
  clearPersonalAccount, 
  generateUserId 
} from '../utils/personalAccount';
import { isAccountAdmin, setAdminSessionOverride } from '../utils/authService';
import { 
  getStoredTheme, 
  applyIndividualTheme 
} from '../utils/themeManager';

interface DataContextType {
  data: AppStateData;
  isAdmin: boolean;
  setAdminOverride: (enabled: boolean) => void;
  syncStatus: {
    isSyncing: boolean;
    lastSaved: string | null;
    serverSynced: boolean;
    error?: string | null;
  };
  personalProfile: UserProfile | null;
  isProfileSetupRequired: boolean;
  activeTheme: IndividualThemeId;
  setIndividualTheme: (theme: IndividualThemeId) => void;
  savePersonalProfileData: (profile: UserProfile) => void;
  logoutOrSwitchProfile: () => void;
  setChatMessages: (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  clearChatMessages: () => void;
  setWheelOptions: (updater: WheelOption[] | ((prev: WheelOption[]) => WheelOption[])) => void;
  clearWheelOptions: () => void;
  setAnnouncements: (updater: Announcement[] | ((prev: Announcement[]) => Announcement[])) => void;
  setLinks: (updater: UsefulLink[] | ((prev: UsefulLink[]) => UsefulLink[])) => void;
  setUserProfile: (updater: Partial<UserProfile> | ((prev: UserProfile) => UserProfile)) => void;
  setMetronomeSettings: (settings: { bpm: number; beatsPerBar: number; soundType: string }) => void;
  exportBackup: () => void;
  importBackup: (jsonString: string) => boolean;
  resetAllClean: () => void;
  forceServerSync: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppStateData>(() => getLocalData());
  const [personalProfile, setPersonalProfile] = useState<UserProfile | null>(() => getPersonalProfile());
  const [activeTheme, setActiveThemeState] = useState<IndividualThemeId>(() => getStoredTheme());

  const [syncStatus, setSyncStatus] = useState<{
    isSyncing: boolean;
    lastSaved: string | null;
    serverSynced: boolean;
    error?: string | null;
  }>({
    isSyncing: false,
    lastSaved: null,
    serverSynced: false,
    error: null,
  });

  // Apply stored individual theme on mount
  useEffect(() => {
    applyIndividualTheme(activeTheme);
  }, [activeTheme]);

  // Subscribe to sync status updates
  useEffect(() => {
    const unsubscribe = subscribeToSyncStatus((status) => {
      setSyncStatus(status);
    });
    return unsubscribe;
  }, []);

  // Initial load from Google AI Studio backend file storage
  useEffect(() => {
    syncWithAiStudioServer().then((synced) => {
      setData(synced);
      // If this browser already has a logged-in personal account, refresh its data from the server
      const local = getPersonalProfile();
      if (local && local.id) {
        fetch('/api/auth/accounts')
          .then((res) => res.json())
          .then((res) => {
            if (res.success && Array.isArray(res.accounts)) {
              const matched = res.accounts.find((a: any) => 
                (a.id && a.id === local.id) || 
                (local.email && a.email && a.email.toLowerCase() === local.email.toLowerCase())
              );
              if (matched) {
                const refreshed = {
                  ...local,
                  ...matched,
                  avatarUrl: matched.avatarUrl || local.avatarUrl,
                };
                setPersonalProfile(refreshed);
                savePersonalProfile(refreshed);
              }
            }
          })
          .catch(() => {});
      }
    });
  }, []);

  // Individual Theme Switcher (ONLY affects this client/browser, not other users)
  const setIndividualTheme = (theme: IndividualThemeId) => {
    setActiveThemeState(theme);
    applyIndividualTheme(theme);
    if (personalProfile) {
      const updated = { ...personalProfile, theme };
      setPersonalProfile(updated);
      savePersonalProfile(updated);
    }
  };

  // Save or update personal account
  const savePersonalProfileData = (profile: UserProfile) => {
    const validProfile: UserProfile = {
      ...profile,
      id: profile.id || personalProfile?.id || generateUserId(),
      email: profile.email || personalProfile?.email,
      authProvider: profile.authProvider || personalProfile?.authProvider,
      theme: profile.theme || activeTheme,
      createdAt: profile.createdAt || personalProfile?.createdAt || new Date().toISOString(),
    };

    setPersonalProfile(validProfile);
    savePersonalProfile(validProfile);

    if (validProfile.theme) {
      setActiveThemeState(validProfile.theme);
      applyIndividualTheme(validProfile.theme);
    }

    // Update past chat messages sent by THIS specific user ID
    setData((prev) => {
      const updatedMessages = prev.chatMessages.map((msg) => {
        if (msg.senderId === validProfile.id || (msg.isCurrentUser && !msg.senderId)) {
          return {
            ...msg,
            senderId: validProfile.id,
            sender: validProfile.displayName || validProfile.nick || 'Uczeń ZSET',
            username: validProfile.username || 'uczen_zset',
            classYear: validProfile.classYear || 'ZSET',
            avatarUrl: validProfile.avatarUrl || '',
            avatarPreset: validProfile.avatarPreset || 'rainbow-heart',
            avatarColor: validProfile.avatarColor || 'from-pink-500 via-purple-500 to-indigo-500',
          };
        }
        return msg;
      });

      saveAllData({ 
        chatMessages: updatedMessages,
      });

      return {
        ...prev,
        chatMessages: updatedMessages,
        userProfile: validProfile,
      };
    });
  };

  const logoutOrSwitchProfile = () => {
    clearPersonalAccount();
    setPersonalProfile(null);
  };

  const setChatMessages = (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    setData((prev) => {
      const nextMsgs = typeof updater === 'function' ? updater(prev.chatMessages) : updater;
      saveAllData({ chatMessages: nextMsgs });
      return { ...prev, chatMessages: nextMsgs };
    });
  };

  const clearChatMessages = () => {
    setData((prev) => {
      saveAllData({ chatMessages: [] });
      return { ...prev, chatMessages: [] };
    });
  };

  const setWheelOptions = (updater: WheelOption[] | ((prev: WheelOption[]) => WheelOption[])) => {
    setData((prev) => {
      const nextOpts = typeof updater === 'function' ? updater(prev.wheelOptions) : updater;
      // Koło fortuny działa w trakcie sesji i resetuje się po każdym odświeżeniu strony
      return { ...prev, wheelOptions: nextOpts };
    });
  };

  const clearWheelOptions = () => {
    setData((prev) => {
      return { ...prev, wheelOptions: [] };
    });
  };

  const setAnnouncements = (updater: Announcement[] | ((prev: Announcement[]) => Announcement[])) => {
    setData((prev) => {
      const nextAnn = typeof updater === 'function' ? updater(prev.announcements) : updater;
      saveAllData({ announcements: nextAnn });
      return { ...prev, announcements: nextAnn };
    });
  };

  const setLinks = (updater: UsefulLink[] | ((prev: UsefulLink[]) => UsefulLink[])) => {
    setData((prev) => {
      const nextLinks = typeof updater === 'function' ? updater(prev.links) : updater;
      saveAllData({ links: nextLinks });
      return { ...prev, links: nextLinks };
    });
  };

  const setUserProfile = (updater: Partial<UserProfile> | ((prev: UserProfile) => UserProfile)) => {
    if (personalProfile) {
      const next = typeof updater === 'function' ? updater(personalProfile) : { ...personalProfile, ...updater };
      savePersonalProfileData(next);
    } else {
      const next = typeof updater === 'function' ? updater(data.userProfile) : { ...data.userProfile, ...updater };
      savePersonalProfileData(next);
    }
  };

  const setMetronomeSettings = (settings: { bpm: number; beatsPerBar: number; soundType: string }) => {
    setData((prev) => ({ ...prev, metronome: settings }));
  };

  const exportBackup = () => {
    downloadBackupJson();
  };

  const importBackup = (jsonString: string): boolean => {
    try {
      const restored = restoreBackupJson(jsonString);
      setData(restored);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  const resetAllClean = () => {
    const clean = resetAllDataToClean();
    setData(clean);
  };

  const forceServerSync = async () => {
    const synced = await syncWithAiStudioServer();
    setData(synced);
  };

  // Profile setup is required if visitor hasn't created their individual profile on this device
  const isProfileSetupRequired = personalProfile === null;

  const [adminOverride, setAdminOverrideState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('zset_admin_active_session_v1') === 'true';
    } catch {
      return false;
    }
  });

  const effectiveProfile = personalProfile || data.userProfile;
  const isAdmin = adminOverride || isAccountAdmin(effectiveProfile);

  const setAdminOverride = (enabled: boolean) => {
    setAdminSessionOverride(enabled);
    setAdminOverrideState(enabled);
    if (personalProfile) {
      const updated: UserProfile = {
        ...personalProfile,
        isAdmin: enabled,
        role: enabled ? 'admin' : 'user',
      };
      setPersonalProfile(updated);
      savePersonalProfile(updated);
    }
  };

  // Provide personal profile as the active userProfile
  const effectiveData: AppStateData = {
    ...data,
    userProfile: {
      ...(personalProfile || data.userProfile),
      isAdmin,
      role: isAdmin ? 'admin' : 'user',
    },
  };

  return (
    <DataContext.Provider
      value={{
        data: effectiveData,
        isAdmin,
        setAdminOverride,
        syncStatus,
        personalProfile,
        isProfileSetupRequired,
        activeTheme,
        setIndividualTheme,
        savePersonalProfileData,
        logoutOrSwitchProfile,
        setChatMessages,
        clearChatMessages,
        setWheelOptions,
        clearWheelOptions,
        setAnnouncements,
        setLinks,
        setUserProfile,
        setMetronomeSettings,
        exportBackup,
        importBackup,
        resetAllClean,
        forceServerSync,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useAppData must be used within DataProvider');
  }
  return context;
};
