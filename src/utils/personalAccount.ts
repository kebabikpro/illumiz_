/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile } from '../types';
import { getActiveAccount, setActiveSession, clearActiveSession, generateAccountId, updateAccountProfile } from './authService';

const AVATAR_BACKUP_KEY = 'zset_avatar_persistent_backup_v2';
const PROFILE_BACKUP_KEY = 'zset_profile_persistent_backup_v2';

export function generateUserId(): string {
  return generateAccountId();
}

export function getPersonalProfile(): UserProfile | null {
  const active = getActiveAccount();
  if (active) {
    // If active has no avatar, check persistent avatar backup
    if (!active.avatarUrl) {
      try {
        const backupAvatar = localStorage.getItem(AVATAR_BACKUP_KEY);
        if (backupAvatar) {
          active.avatarUrl = backupAvatar;
        }
      } catch {}
    }
    return active;
  }

  // If no active session, try restoring from persistent backup
  try {
    const raw = localStorage.getItem(PROFILE_BACKUP_KEY);
    if (raw) {
      const restored = JSON.parse(raw) as UserProfile;
      if (restored && (restored.displayName || restored.username)) {
        return restored;
      }
    }
  } catch {}

  return null;
}

export function hasPersonalProfile(): boolean {
  return getPersonalProfile() !== null;
}

export function savePersonalProfile(profile: UserProfile): void {
  const current = getActiveAccount();
  const fullProfile: UserProfile = {
    ...current,
    ...profile,
    id: profile.id || current?.id || generateAccountId(),
    email: profile.email || current?.email || 'uczen@zset.leszno.pl',
    displayName: profile.displayName || current?.displayName || 'Uczeń ZSET',
    username: (profile.username || current?.username || 'uczen_zset').replace(/^@/, ''),
    avatarUrl: profile.avatarUrl !== undefined ? profile.avatarUrl : (current?.avatarUrl || ''),
    authProvider: profile.authProvider || current?.authProvider || 'email',
  };

  // 1. Save avatar to dedicated isolated backup
  if (fullProfile.avatarUrl) {
    try {
      localStorage.setItem(AVATAR_BACKUP_KEY, fullProfile.avatarUrl);
    } catch {}
  }

  // 2. Save profile to isolated backup
  try {
    localStorage.setItem(PROFILE_BACKUP_KEY, JSON.stringify(fullProfile));
  } catch {}

  // 3. Update active session & accounts list
  if (current && current.id === fullProfile.id) {
    updateAccountProfile(current.id, fullProfile);
  } else {
    setActiveSession({
      ...fullProfile,
      lastLoginAt: new Date().toISOString(),
    });
  }

  // 4. Send to server /api/auth/save-profile so it is durable across all devices & sessions
  fetch('/api/auth/save-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile: fullProfile }),
  }).catch((err) => {
    console.warn('Could not save profile to server:', err);
  });
}

export function clearPersonalAccount(): void {
  clearActiveSession();
  try {
    localStorage.removeItem(PROFILE_BACKUP_KEY);
    // Keep AVATAR_BACKUP_KEY intact or clear if desired; keeping it prevents accidental avatar loss
  } catch {}
}

