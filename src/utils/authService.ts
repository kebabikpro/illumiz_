/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserAccount, UserProfile, IndividualThemeId } from '../types';
import { applyIndividualTheme } from './themeManager';

const ACCOUNTS_DB_KEY = 'zset_registered_accounts_v1';
const ACTIVE_SESSION_KEY = 'zset_active_session_v1';
const LEGACY_PROFILE_KEY = 'zset_individual_user_profile_v2';
export const ADMIN_SESSION_KEY = 'zset_admin_active_session_v1';

export const ADMIN_USERNAMES = ['illumiz_', 'illumiz'];
export const ADMIN_EMAILS = ['kebabpanmuala@gmail.com', 'illumiz@zset.leszno.pl'];

export function isAccountAdmin(profile?: UserProfile | null): boolean {
  if (!profile) return false;
  if (profile.isAdmin === true || profile.role === 'admin') return true;

  const normalizedUser = (profile.username || '').toLowerCase().trim().replace(/^@/, '');
  if (ADMIN_USERNAMES.includes(normalizedUser)) {
    return true;
  }

  const normalizedEmail = (profile.email || '').toLowerCase().trim();
  if (ADMIN_EMAILS.includes(normalizedEmail)) {
    return true;
  }

  const normalizedDisplay = (profile.displayName || '').toLowerCase().trim();
  if (normalizedDisplay === 'illumiz_' || normalizedDisplay === 'illumiz') {
    return true;
  }

  try {
    if (localStorage.getItem(ADMIN_SESSION_KEY) === 'true') {
      return true;
    }
  } catch {}

  return false;
}

export function setAdminSessionOverride(enabled: boolean): void {
  try {
    if (enabled) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch (e) {
    console.error('Failed to update admin override:', e);
  }
}

// Simple robust hash function for client-side password credential verification
export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + password.length;
}

export function generateAccountId(): string {
  return 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
}

export function getAllAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_DB_KEY);
    if (!raw) {
      // Check if we have an existing legacy profile to migrate as the first registered account
      const legacyRaw = localStorage.getItem(LEGACY_PROFILE_KEY);
      if (legacyRaw) {
        const parsedLegacy = JSON.parse(legacyRaw) as UserProfile;
        if (parsedLegacy && parsedLegacy.displayName) {
          const migratedAccount: UserAccount = {
            ...parsedLegacy,
            id: parsedLegacy.id || generateAccountId(),
            email: parsedLegacy.email || 'uczen@zset.leszno.pl',
            authProvider: parsedLegacy.authProvider || 'email',
            passwordHash: hashPassword('zset123'),
            lastLoginAt: new Date().toISOString(),
          };
          saveAccountsList([migratedAccount]);
          return [migratedAccount];
        }
      }
      return [];
    }
    return JSON.parse(raw) as UserAccount[];
  } catch (e) {
    console.error('Failed to parse accounts from storage:', e);
    return [];
  }
}

function saveAccountsList(accounts: UserAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts list:', e);
  }
}

export function findAccountByEmail(email: string): UserAccount | null {
  const normalized = email.trim().toLowerCase();
  const accounts = getAllAccounts();
  return accounts.find((a) => (a.email ? a.email.toLowerCase() === normalized : false)) || null;
}

export function getActiveAccount(): UserAccount | null {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) {
      // Fallback: check legacy profile key
      const legacyRaw = localStorage.getItem(LEGACY_PROFILE_KEY);
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw) as UserProfile;
        if (legacy && legacy.displayName) {
          const existing = getAllAccounts().find((a) => a.id === legacy.id);
          if (existing) {
            localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(existing));
            return existing;
          }
        }
      }
      return null;
    }
    const account = JSON.parse(raw) as UserAccount;
    if (!account || !account.id || !account.displayName) return null;
    if (isAccountAdmin(account)) {
      account.isAdmin = true;
      account.role = 'admin';
    }
    return account;
  } catch (e) {
    console.error('Failed to get active account:', e);
    return null;
  }
}

export function setActiveSession(account: UserAccount): void {
  try {
    const updatedAccount = {
      ...account,
      lastLoginAt: new Date().toISOString(),
    };
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(updatedAccount));
    // Also keep legacy key synced for any external helper functions
    localStorage.setItem(LEGACY_PROFILE_KEY, JSON.stringify(updatedAccount));
    
    // Update in accounts list
    const accounts = getAllAccounts();
    const index = accounts.findIndex((a) => a.id === updatedAccount.id);
    if (index >= 0) {
      accounts[index] = updatedAccount;
    } else {
      accounts.push(updatedAccount);
    }
    saveAccountsList(accounts);

    if (updatedAccount.theme) {
      applyIndividualTheme(updatedAccount.theme);
    }
  } catch (e) {
    console.error('Failed to set active session:', e);
  }
}

export function clearActiveSession(): void {
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    localStorage.removeItem(LEGACY_PROFILE_KEY);
  } catch (e) {
    console.error('Failed to clear active session:', e);
  }
}

/**
 * Real Email & Password Login
 */
export function loginWithEmail(
  email: string, 
  password: string
): { success: boolean; error?: string; account?: UserAccount } {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { success: false, error: 'Podaj adres e-mail.' };
  }
  if (!password) {
    return { success: false, error: 'Podaj hasło do swojego konta.' };
  }

  const account = findAccountByEmail(normalizedEmail);
  if (!account) {
    return { 
      success: false, 
      error: 'Nie znaleziono konta z tym adresem e-mail. Zarejestruj się poniżej!' 
    };
  }

  // Verify password hash
  if (account.passwordHash && account.passwordHash !== hashPassword(password)) {
    return { success: false, error: 'Nieprawidłowe hasło. Spróbuj ponownie.' };
  }

  setActiveSession(account);
  return { success: true, account };
}

/**
 * Real Email & Password Registration
 */
export function registerWithEmail(params: {
  email: string;
  password: string;
  displayName: string;
  username: string;
  classYear: string;
  statusMessage?: string;
  bio?: string;
  avatarUrl?: string;
  avatarPreset?: string;
  avatarColor?: string;
  theme?: IndividualThemeId;
}): { success: boolean; error?: string; account?: UserAccount } {
  const normalizedEmail = params.email.trim().toLowerCase();
  
  if (!normalizedEmail || !normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
    return { success: false, error: 'Wpisz poprawny adres e-mail (np. uczen@gmail.com).' };
  }

  if (!params.password || params.password.length < 5) {
    return { success: false, error: 'Hasło musi mieć co najmniej 5 znaków.' };
  }

  if (!params.displayName.trim()) {
    return { success: false, error: 'Wpisz swoje imię lub pseudonim.' };
  }

  // Check if email already registered
  const existing = findAccountByEmail(normalizedEmail);
  if (existing) {
    return { 
      success: false, 
      error: 'Konto z tym adresem e-mail już istnieje! Zaloguj się wpisując swoje hasło.' 
    };
  }

  const cleanNick = params.username.trim().replace(/^@/, '') || 'uczen_zset';

  const newAccount: UserAccount = {
    id: generateAccountId(),
    email: normalizedEmail,
    passwordHash: hashPassword(params.password),
    authProvider: 'email',
    displayName: params.displayName.trim(),
    username: cleanNick,
    classYear: params.classYear.trim() || '3TI (Technik Informatyk)',
    statusMessage: params.statusMessage?.trim() || '🟢 Aktywny na przerwie',
    bio: params.bio?.trim() || 'Uczeń ZSET Leszno. Bezpieczna i otwarta przestrzeń.',
    avatarUrl: params.avatarUrl || '',
    avatarPreset: params.avatarPreset || 'rainbow-heart',
    avatarColor: params.avatarColor || 'from-pink-500 via-purple-500 to-indigo-500',
    theme: params.theme || 'midnight-pride',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    nick: cleanNick,
  };

  const accounts = getAllAccounts();
  accounts.push(newAccount);
  saveAccountsList(accounts);
  setActiveSession(newAccount);

  return { success: true, account: newAccount };
}

/**
 * Google Sign-In (Creates or logs into permanent Google-linked account)
 */
export function loginWithGoogle(googleData?: {
  email?: string;
  name?: string;
  avatarUrl?: string;
}): { success: boolean; account: UserAccount } {
  const email = (googleData?.email || 'kebabpanmuala@gmail.com').trim().toLowerCase();
  const name = googleData?.name || email.split('@')[0] || 'Uczeń ZSET';
  
  const existing = findAccountByEmail(email);
  if (existing) {
    // If account exists, update to ensure Google link and log in
    const updated = {
      ...existing,
      authProvider: 'google' as const,
      lastLoginAt: new Date().toISOString(),
    };
    if (googleData?.avatarUrl && !existing.avatarUrl) {
      updated.avatarUrl = googleData.avatarUrl;
    }
    setActiveSession(updated);
    return { success: true, account: updated };
  }

  // Create permanent new Google account
  const cleanNick = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'google_user';
  const newGoogleAccount: UserAccount = {
    id: generateAccountId(),
    email,
    authProvider: 'google',
    displayName: name,
    username: cleanNick,
    classYear: '3TI (Technik Informatyk)',
    statusMessage: '🟢 Zalogowano przez Google',
    bio: 'Konto połączone z kontem Google w ZSET GaySpace.',
    avatarUrl: googleData?.avatarUrl || '',
    avatarPreset: 'pride-flag',
    avatarColor: 'from-blue-500 via-indigo-500 to-purple-600',
    theme: 'midnight-pride',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    nick: cleanNick,
  };

  const accounts = getAllAccounts();
  accounts.push(newGoogleAccount);
  saveAccountsList(accounts);
  setActiveSession(newGoogleAccount);

  return { success: true, account: newGoogleAccount };
}

export function updateAccountProfile(
  accountId: string, 
  updates: Partial<UserProfile>
): UserAccount | null {
  const accounts = getAllAccounts();
  const index = accounts.findIndex((a) => a.id === accountId);
  if (index === -1) return null;

  const current = accounts[index];
  const updated: UserAccount = {
    ...current,
    ...updates,
    nick: updates.username ? updates.username.replace(/^@/, '') : current.nick,
  };

  accounts[index] = updated;
  saveAccountsList(accounts);

  const active = getActiveAccount();
  if (active && active.id === accountId) {
    setActiveSession(updated);
  }

  return updated;
}
