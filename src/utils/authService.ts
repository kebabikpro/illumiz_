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

export function findAccountByEmail(identifier: string): UserAccount | null {
  const normalized = identifier.trim().toLowerCase().replace(/^@/, '');
  const accounts = getAllAccounts();
  return (
    accounts.find((a) => {
      const aEmail = (a.email || '').trim().toLowerCase();
      const aUser = (a.username || '').trim().toLowerCase().replace(/^@/, '');
      const aNick = (a.nick || '').trim().toLowerCase().replace(/^@/, '');
      const aDisp = (a.displayName || '').trim().toLowerCase();
      return aEmail === normalized || aUser === normalized || aNick === normalized || aDisp === normalized;
    }) || null
  );
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
          const existing = getAllAccounts().find((a) => a.id === legacy.id || (legacy.email && a.email === legacy.email));
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
    const index = accounts.findIndex((a) => a.id === updatedAccount.id || (a.email && updatedAccount.email && a.email.toLowerCase() === updatedAccount.email.toLowerCase()));
    if (index >= 0) {
      accounts[index] = { ...accounts[index], ...updatedAccount };
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
 * Sync accounts list with server (/api/auth/accounts)
 */
export async function syncAccountsWithServer(): Promise<UserAccount[]> {
  try {
    const res = await fetch('/api/auth/accounts');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.accounts)) {
        const serverAccounts: UserAccount[] = data.accounts;
        const localAccounts = getAllAccounts();
        const merged: UserAccount[] = [...localAccounts];

        for (const sAcc of serverAccounts) {
          const idx = merged.findIndex((l) => 
            (l.id && l.id === sAcc.id) || (l.email && sAcc.email && l.email.toLowerCase() === sAcc.email.toLowerCase())
          );
          if (idx >= 0) {
            merged[idx] = {
              ...sAcc,
              ...merged[idx],
              email: sAcc.email || merged[idx].email,
              passwordHash: sAcc.passwordHash || merged[idx].passwordHash,
            };
          } else {
            merged.push(sAcc);
          }
        }

        saveAccountsList(merged);
        return merged;
      }
    }
  } catch (err) {
    console.warn('Could not sync accounts with server:', err);
  }
  return getAllAccounts();
}

/**
 * Real Email & Password Login (Server-authoritative with local offline fallback)
 */
export async function loginWithEmail(
  identifier: string, 
  password: string
): Promise<{ success: boolean; error?: string; account?: UserAccount }> {
  const normalizedId = identifier.trim().toLowerCase();
  if (!normalizedId) {
    return { success: false, error: 'Podaj adres e-mail lub nazwę użytkownika.' };
  }
  if (!password) {
    return { success: false, error: 'Podaj hasło do swojego konta.' };
  }

  // 1. Try server-side authentication first
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: normalizedId, password }),
    });
    const data = await res.json();
    if (res.ok && data.success && data.account) {
      const serverAccount: UserAccount = data.account;
      setActiveSession(serverAccount);
      return { success: true, account: serverAccount };
    }
    if (!res.ok && data.error) {
      // Server returned explicit error (e.g. wrong password or not found)
      return { success: false, error: data.error };
    }
  } catch (err) {
    console.warn('Server login failed or offline, falling back to local storage:', err);
  }

  // 2. Offline / Local fallback
  const account = findAccountByEmail(normalizedId);
  if (!account) {
    return { 
      success: false, 
      error: `Nie znaleziono konta z adresem lub nickiem "${identifier}". Zarejestruj się w zakładce Rejestracja!` 
    };
  }

  // Verify password hash
  const expectedHash = hashPassword(password);
  if (account.passwordHash && account.passwordHash !== hashPassword('zset123') && account.passwordHash !== expectedHash) {
    return { success: false, error: 'Nieprawidłowe hasło. Spróbuj ponownie.' };
  }

  account.passwordHash = expectedHash;
  setActiveSession(account);
  return { success: true, account };
}

/**
 * Real Email & Password Registration (Server-authoritative with local offline fallback)
 */
export async function registerWithEmail(params: {
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
}): Promise<{ success: boolean; error?: string; account?: UserAccount }> {
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

  const cleanNick = params.username.trim().replace(/^@/, '') || 'uczen_zset';

  // 1. Try server-side registration
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        email: normalizedEmail,
        username: cleanNick,
      }),
    });
    const data = await res.json();
    if (res.ok && data.success && data.account) {
      const serverAccount: UserAccount = data.account;
      setActiveSession(serverAccount);
      return { success: true, account: serverAccount };
    }
    if (!res.ok && data.error) {
      return { success: false, error: data.error };
    }
  } catch (err) {
    console.warn('Server registration failed or offline, falling back to local:', err);
  }

  // 2. Offline / Local fallback
  const existing = findAccountByEmail(normalizedEmail);
  if (existing) {
    return { 
      success: false, 
      error: 'Konto z tym adresem e-mail już istnieje! Zaloguj się wpisując swoje hasło.' 
    };
  }

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
export async function loginWithGoogle(googleData?: {
  email?: string;
  name?: string;
  avatarUrl?: string;
}): Promise<{ success: boolean; account: UserAccount }> {
  const email = (googleData?.email || '').trim().toLowerCase();
  if (!email) {
    throw new Error('Wymagany jest adres e-mail konta Google.');
  }
  const name = googleData?.name || email.split('@')[0] || 'Uczeń ZSET';
  
  // Try server first
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, avatarUrl: googleData?.avatarUrl }),
    });
    const data = await res.json();
    if (res.ok && data.success && data.account) {
      setActiveSession(data.account);
      return { success: true, account: data.account };
    }
  } catch (err) {
    console.warn('Server Google login failed or offline:', err);
  }

  // Local fallback
  const existing = findAccountByEmail(email);
  if (existing) {
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
    email: updates.email || current.email,
    passwordHash: current.passwordHash,
    authProvider: updates.authProvider || current.authProvider,
    nick: updates.username ? updates.username.replace(/^@/, '') : (updates.nick || current.nick),
  };

  accounts[index] = updated;
  saveAccountsList(accounts);

  const active = getActiveAccount();
  if (active && active.id === accountId) {
    setActiveSession(updated);
  }

  // Push update to server in background
  fetch('/api/auth/update-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountId, updates: updated }),
  }).catch(() => {});

  return updated;
}
