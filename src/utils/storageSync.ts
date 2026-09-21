/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppStateData, ChatMessage, WheelOption, Announcement, UsefulLink, UserProfile, UserAccount } from '../types';
import { getAllAccounts, syncAccountsWithServer, getActiveAccount, setActiveSession } from './authService';
import { getPersonalProfile } from './personalAccount';

const STORAGE_KEY = 'zset_gayspace_all_data_v2';
const API_URL = '/api/storage';

export const DEFAULT_CLEAN_STATE: AppStateData = {
  chatMessages: [], // Clean slate: no mock chats!
  wheelOptions: [], // Clean slate: no sample options!
  announcements: [], // Clean slate: no sample announcements!
  links: [
    {
      id: 'link-2',
      title: 'Lambda Warszawa - Pomoc psychologiczna i prawna',
      url: 'https://lambdawarszawa.org/',
      description: 'Pomoc psychologiczna i prawna dla osób LGBT+ i ich bliskich w Polsce.',
      category: 'Wsparcie i zaufanie',
    },
    {
      id: 'link-3',
      title: 'Grupa Stonewall (Wielkopolska / Poznań)',
      url: 'https://grupa-stonewall.pl/',
      description: 'Największa organizacja LGBT+ w Wielkopolsce (najbliżej Leszna). Bezpłatne wsparcie psychologiczne, warsztaty i wydarzenia.',
      category: 'Lokalne (Leszno/Wielkopolska)',
    },
    {
      id: 'link-4',
      title: 'Kampania Przeciw Homofobii (KPH)',
      url: 'https://kph.org.pl/',
      description: 'Ogólnopolska organizacja działająca na rzecz praw osób LGBT+, rzetelne poradniki, wsparcie prawne i materiały edukacyjne.',
      category: 'Społeczność & Edukacja',
    },
    {
      id: 'link-5',
      title: 'Miłość Nie Wyklucza',
      url: 'https://mnw.org.pl/',
      description: 'Baza wiedzy, raporty, poradniki dla młodzieży i sojuszników oraz kampanie na rzecz równości.',
      category: 'Społeczność & Edukacja',
    },
    {
      id: 'link-6',
      title: 'Oficjalna strona szkoły ZSET w Lesznie',
      url: 'https://zset.leszno.pl/',
      description: 'Aktualności szkolne, terminarze, plany lekcji i ogłoszenia dyrekcji Zespołu Szkół Elektroniczno-Telekomunikacyjnych.',
      category: 'Szkoła ZSET',
    },
  ],
  userProfile: {
    id: 'usr_default',
    displayName: 'Uczeń ZSET',
    username: 'uczen_zset',
    avatarUrl: '',
    avatarPreset: 'rainbow-heart',
    avatarColor: 'from-pink-500 via-purple-500 to-indigo-500',
    classYear: '3TI',
    bio: 'Uczeń ZSET Leszno. Bezpieczna i otwarta przestrzeń.',
    statusMessage: '🟢 Aktywny na przerwie',
    theme: 'midnight-pride',
  },
  metronome: {
    bpm: 120,
    beatsPerBar: 4,
    soundType: 'classic',
  },
  lastSaved: new Date().toISOString(),
};

type SyncListener = (status: {
  isSyncing: boolean;
  lastSaved: string | null;
  serverSynced: boolean;
  error?: string | null;
}) => void;

const listeners: Set<SyncListener> = new Set();
let currentStatus = {
  isSyncing: false,
  lastSaved: null as string | null,
  serverSynced: false,
  error: null as string | null,
};

function notifyListeners() {
  listeners.forEach((l) => l({ ...currentStatus }));
}

export function subscribeToSyncStatus(listener: SyncListener) {
  listeners.add(listener);
  listener({ ...currentStatus });
  return () => {
    listeners.delete(listener);
  };
}

function normalizeUserProfile(raw: any): UserProfile {
  if (!raw || typeof raw !== 'object') return DEFAULT_CLEAN_STATE.userProfile;
  return {
    id: raw.id || 'usr_default',
    email: raw.email,
    authProvider: raw.authProvider,
    displayName: raw.displayName || raw.nick || 'Uczeń ZSET',
    username: raw.username || (raw.nick ? String(raw.nick).toLowerCase().replace(/[^a-z0-9_]/g, '') : 'uczen_zset'),
    avatarUrl: raw.avatarUrl || '',
    avatarPreset: raw.avatarPreset || 'rainbow-heart',
    avatarColor: raw.avatarColor || 'from-pink-500 via-purple-500 to-indigo-500',
    classYear: raw.classYear || '3TI',
    bio: raw.bio || 'Uczeń ZSET Leszno. Bezpieczna i otwarta przestrzeń.',
    statusMessage: raw.statusMessage || '🟢 Aktywny na przerwie',
    theme: raw.theme || 'midnight-pride',
    role: raw.role,
    isAdmin: raw.isAdmin,
    createdAt: raw.createdAt,
    nick: raw.nick,
    reflexRecord: raw.reflexRecord,
  };
}

/**
 * Loads current data from localStorage, cleaning out any legacy mock messages or wheel options.
 */
export function getLocalData(): AppStateData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CLEAN_STATE;
    const parsed = JSON.parse(raw);
    
    // Filter out only the legacy mock message without wiping real user messages
    let cleanedMessages = Array.isArray(parsed.chatMessages) ? parsed.chatMessages : [];
    cleanedMessages = cleanedMessages.filter((m: ChatMessage) => m && m.id !== 'msg-1' && !m.text?.includes('Parku 1000-lecia po 7 lekcji'));

    // Purge any old preset wheel options if user had old presets stored
    let cleanedWheel = Array.isArray(parsed.wheelOptions) ? parsed.wheelOptions : [];
    if (cleanedWheel.some((w: WheelOption) => w.text === 'Kuba' || w.text === 'Patryk' || w.text?.includes('Zrzutka po równo'))) {
      cleanedWheel = [];
    }

    // Purge any old sample announcements
    let cleanedAnnouncements = Array.isArray(parsed.announcements) ? parsed.announcements : [];
    cleanedAnnouncements = cleanedAnnouncements.filter(
      (a: Announcement) => a.id !== 'ann-1' && a.id !== 'ann-2' && a.id !== 'ann-3'
    );

    // Purge Telefon Zaufania
    let cleanedLinks = Array.isArray(parsed.links) ? parsed.links : DEFAULT_CLEAN_STATE.links;
    cleanedLinks = cleanedLinks.filter(
      (l: UsefulLink) => l.id !== 'link-1' && !l.url?.includes('116111') && !l.title?.includes('116 111')
    );

    return {
      chatMessages: cleanedMessages,
      wheelOptions: [], // Koło fortuny resetuje się po każdym odświeżeniu strony
      announcements: cleanedAnnouncements,
      links: cleanedLinks,
      userProfile: normalizeUserProfile(parsed.userProfile),
      metronome: DEFAULT_CLEAN_STATE.metronome,
      lastSaved: parsed.lastSaved || new Date().toISOString(),
    };
  } catch (e) {
    console.error('Failed to read from localStorage:', e);
    return DEFAULT_CLEAN_STATE;
  }
}

/**
 * Saves data synchronously to localStorage and asynchronously pushes to Google AI Studio server.
 */
let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function saveAllData(newData: Partial<AppStateData>): AppStateData {
  const current = getLocalData();
  const allAccounts = getAllAccounts();
  const updated: AppStateData = {
    ...current,
    ...newData,
    registeredAccounts: allAccounts,
    wheelOptions: [], // Koło fortuny resetuje się po odświeżeniu
    lastSaved: new Date().toISOString(),
  };

  // 1. Instant local persistence in browser localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    currentStatus.lastSaved = updated.lastSaved ?? null;
    notifyListeners();
  } catch (e) {
    console.error('localStorage save error:', e);
  }

  // 2. Debounced save to Google AI Studio container filesystem (/api/storage)
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    currentStatus.isSyncing = true;
    notifyListeners();

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        currentStatus.serverSynced = true;
        currentStatus.error = null;
      } else {
        currentStatus.serverSynced = false;
        currentStatus.error = 'Błąd synchronizacji z chmurą';
      }
    } catch (err) {
      console.warn('Google AI Studio server sync error:', err);
      // Client storage is still preserved, but mark server sync status
      currentStatus.serverSynced = false;
      currentStatus.error = 'Połączenie w tle niedostępne (zapisano w pamięci lokalnej)';
    } finally {
      currentStatus.isSyncing = false;
      notifyListeners();
    }
  }, 400);

  return updated;
}

/**
 * Fetch and merge data from Google AI Studio server.
 */
export async function syncWithAiStudioServer(): Promise<AppStateData> {
  currentStatus.isSyncing = true;
  notifyListeners();

  // Also sync accounts with server endpoints
  syncAccountsWithServer().catch(() => {});

  try {
    const res = await fetch(API_URL);
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Endpoint returned non-JSON response');
      }
      const json = await res.json();
      if (json.success && json.data) {
        const serverData = json.data;

        // Clean out legacy mock data without wiping genuine user chat messages
        let cleanChats = Array.isArray(serverData.chatMessages) 
          ? serverData.chatMessages.filter((m: ChatMessage) => m && m.id !== 'msg-1' && !m.text?.includes('Parku 1000-lecia po 7 lekcji'))
          : [];

        let cleanWheel = Array.isArray(serverData.wheelOptions) ? serverData.wheelOptions : [];
        if (cleanWheel.some((w: WheelOption) => w.text === 'Kuba' || w.text === 'Patryk')) {
          cleanWheel = [];
        }

        let cleanAnnouncements = Array.isArray(serverData.announcements) ? serverData.announcements : [];
        cleanAnnouncements = cleanAnnouncements.filter(
          (a: Announcement) => a.id !== 'ann-1' && a.id !== 'ann-2' && a.id !== 'ann-3'
        );

        let cleanLinks = serverData.links?.length ? serverData.links : DEFAULT_CLEAN_STATE.links;
        cleanLinks = cleanLinks.filter(
          (l: UsefulLink) => l.id !== 'link-1' && !l.url?.includes('116111') && !l.title?.includes('116 111')
        );

        // Merge server accounts into local accounts
        if (Array.isArray(serverData.registeredAccounts)) {
          const localAccs = getAllAccounts();
          const mergedAccs = [...localAccs];
          for (const sAcc of serverData.registeredAccounts) {
            const idx = mergedAccs.findIndex(
              (l) => (l.id && l.id === sAcc.id) || (l.email && sAcc.email && l.email.toLowerCase() === sAcc.email.toLowerCase())
            );
            if (idx >= 0) {
              mergedAccs[idx] = { ...sAcc, ...mergedAccs[idx], email: sAcc.email || mergedAccs[idx].email };
            } else {
              mergedAccs.push(sAcc);
            }
          }
          try {
            localStorage.setItem('zset_registered_accounts_v1', JSON.stringify(mergedAccs));
          } catch {}

          // If no active session or active session has missing email, check if we can restore from server data
          const active = getActiveAccount();
          if (!active && serverData.userProfile?.email) {
            const match = mergedAccs.find((a) => a.email?.toLowerCase() === serverData.userProfile.email.toLowerCase());
            if (match) {
              setActiveSession(match);
            }
          }
        }

        const activeUser = getActiveAccount();
        const personalProf = getPersonalProfile();
        const localData = getLocalData();
        const effectiveUserProfile = personalProf || activeUser || (localData.userProfile?.avatarUrl ? localData.userProfile : normalizeUserProfile(serverData.userProfile));

        const merged: AppStateData = {
          chatMessages: cleanChats,
          wheelOptions: [], // Zawsze resetuj koło po odświeżeniu
          announcements: cleanAnnouncements,
          links: cleanLinks,
          userProfile: effectiveUserProfile,
          registeredAccounts: getAllAccounts(),
          metronome: DEFAULT_CLEAN_STATE.metronome,
          lastSaved: serverData.lastSaved || new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        currentStatus.serverSynced = true;
        currentStatus.lastSaved = merged.lastSaved ?? null;
        currentStatus.error = null;
        notifyListeners();
        return merged;
      }
    }
  } catch (err) {
    console.warn('Initial server sync failed, falling back to localStorage:', err);
  } finally {
    currentStatus.isSyncing = false;
    notifyListeners();
  }

  return getLocalData();
}

/**
 * Trigger file download of all data (JSON backup).
 */
export function downloadBackupJson() {
  const data = getLocalData();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zset_gayspace_kopia_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Restore data from user uploaded JSON.
 */
export function restoreBackupJson(jsonString: string): AppStateData {
  const parsed = JSON.parse(jsonString);
  let restoredLinks = Array.isArray(parsed.links) ? parsed.links : DEFAULT_CLEAN_STATE.links;
  restoredLinks = restoredLinks.filter(
    (l: UsefulLink) => l.id !== 'link-1' && !l.url?.includes('116111') && !l.title?.includes('116 111')
  );

  const restored: AppStateData = {
    chatMessages: Array.isArray(parsed.chatMessages) ? parsed.chatMessages : [],
    wheelOptions: Array.isArray(parsed.wheelOptions) ? parsed.wheelOptions : [],
    announcements: Array.isArray(parsed.announcements) ? parsed.announcements : DEFAULT_CLEAN_STATE.announcements,
    links: restoredLinks,
    userProfile: parsed.userProfile || DEFAULT_CLEAN_STATE.userProfile,
    metronome: DEFAULT_CLEAN_STATE.metronome,
    lastSaved: new Date().toISOString(),
  };

  saveAllData(restored);
  return restored;
}

/**
 * Reset everything back to completely clean state.
 */
export function resetAllDataToClean(): AppStateData {
  const clean: AppStateData = {
    ...DEFAULT_CLEAN_STATE,
    chatMessages: [],
    wheelOptions: [],
    lastSaved: new Date().toISOString(),
  };
  saveAllData(clean);
  return clean;
}
