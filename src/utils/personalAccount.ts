/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile } from '../types';
import { getActiveAccount, setActiveSession, clearActiveSession, generateAccountId, updateAccountProfile } from './authService';

export function generateUserId(): string {
  return generateAccountId();
}

export function getPersonalProfile(): UserProfile | null {
  return getActiveAccount();
}

export function hasPersonalProfile(): boolean {
  return getActiveAccount() !== null;
}

export function savePersonalProfile(profile: UserProfile): void {
  const current = getActiveAccount();
  if (current && current.id === profile.id) {
    updateAccountProfile(current.id, profile);
  } else {
    setActiveSession({
      ...profile,
      email: profile.email || 'uczen@zset.leszno.pl',
      authProvider: profile.authProvider || 'email',
      lastLoginAt: new Date().toISOString(),
    });
  }
}

export function clearPersonalAccount(): void {
  clearActiveSession();
}

