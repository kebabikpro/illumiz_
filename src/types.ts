export type IndividualThemeId = 
  | 'midnight-pride'
  | 'rainbow-light'
  | 'cyberpunk-ti'
  | 'sunset-rynek'
  | 'emerald-green'
  | 'amoled-dark';

export interface UserProfile {
  id: string;
  email?: string;
  authProvider?: 'email' | 'google';
  displayName: string;
  username: string;
  avatarUrl?: string;
  avatarPreset?: string;
  avatarColor?: string;
  classYear: string;
  bio?: string;
  statusMessage?: string;
  theme: IndividualThemeId;
  createdAt?: string;
  nick?: string; // backward-compatibility
  role?: 'admin' | 'user';
  isAdmin?: boolean;
  reflexRecord?: number;
}

export interface UserAccount extends UserProfile {
  passwordHash?: string;
  lastLoginAt: string;
}

export interface ChatMessage {
  id: string;
  senderId?: string;
  sender: string;
  username?: string;
  classYear?: string;
  avatarUrl?: string;
  avatarPreset?: string;
  avatarColor: string;
  text: string;
  timestamp: string;
  reactions: { [emoji: string]: number };
  userReacted?: string[];
  isCurrentUser?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: 'spotkanie' | 'integracja' | 'nauka' | 'plener' | 'inne';
  organizer: string;
  attendeesCount: number;
  isUserAttending?: boolean;
}

export interface WheelOption {
  id: string;
  text: string;
  color: string;
  active: boolean;
}

export interface UsefulLink {
  id: string;
  title: string;
  url: string;
  description: string;
  category: 'Wsparcie i zaufanie' | 'Lokalne (Leszno/Wielkopolska)' | 'Szkoła ZSET' | 'Społeczność & Edukacja' | 'Własne linki';
  isCustom?: boolean;
  dateAdded?: string;
}

export interface AppStateData {
  chatMessages: ChatMessage[];
  wheelOptions: WheelOption[];
  announcements: Announcement[];
  links: UsefulLink[];
  userProfile: UserProfile;
  registeredAccounts?: UserAccount[];
  metronome: {
    bpm: number;
    beatsPerBar: number;
    soundType: string;
  };
  lastSaved?: string;
}
