import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'storage.json');
const AVATARS_DIR = path.join(DATA_DIR, 'avatars');

// Ensure data and avatars directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(AVATARS_DIR)) {
  fs.mkdirSync(AVATARS_DIR, { recursive: true });
}

// Helper to save base64 data URL to server file
function saveBase64Avatar(userId: string, dataUrl: string): string {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return dataUrl;
  try {
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length < 3) return dataUrl;
    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const base64Data = matches[2];
    const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `avatar_${safeUserId}.${ext}`;
    const filePath = path.join(AVATARS_DIR, filename);
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    return `/api/avatar/${safeUserId}?v=${Date.now()}`;
  } catch (err) {
    console.error('Failed to save avatar image file to disk:', err);
    return dataUrl;
  }
}

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + password.length;
}

function generateAccountId(): string {
  return 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
}

// Initial state with NO mock chats and NO mock wheel options (clean slate as requested)
const getInitialCleanState = () => ({
  chatMessages: [],
  wheelOptions: [],
  announcements: [],
  links: [
    {
      id: 'link-2',
      title: 'Lambda Warszawa - Pomoc psychologiczna i prawna',
      url: 'https://lambdawarszawa.org/',
      description: 'Telefon zaufania LGBT+: (22) 628 52 22 (pon-pt 18:00-21:00) oraz pomoc psychologiczna dla osób LGBT+ i ich bliskich.',
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
    displayName: 'Uczeń ZSET',
    username: 'uczen_zset',
    avatarUrl: '',
    avatarPreset: 'rainbow-heart',
    avatarColor: 'from-pink-500 via-purple-500 to-indigo-500',
    classYear: '3TI',
    bio: 'Uczeń ZSET Leszno. Bezpieczna i otwarta przestrzeń.',
    statusMessage: '🟢 Aktywny na przerwie',
  },
  registeredAccounts: [
    {
      id: 'usr_muaupap9_n2172i',
      email: 'kebabpanmuala@gmail.com',
      displayName: 'Kebab Pan Muala',
      username: 'kebabpanmuala',
      nick: 'kebabpanmuala',
      classYear: '3TI (Technik Informatyk)',
      role: 'admin',
      isAdmin: true,
      statusMessage: '🟢 Administrator ZSET GaySpace',
      bio: 'Konto administratora ZSET GaySpace.',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=kebabpanmuala%40gmail.com',
      avatarPreset: 'pride-flag',
      avatarColor: 'from-blue-500 via-indigo-500 to-purple-600',
      theme: 'midnight-pride',
      passwordHash: hashPassword('zset123'),
      authProvider: 'email',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    }
  ],
  metronome: {
    bpm: 120,
    beatsPerBar: 4,
    soundType: 'classic',
  },
  lastSaved: new Date().toISOString(),
});

function readStoredData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initial = getInitialCleanState();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.announcements)) {
      parsed.announcements = parsed.announcements.filter(
        (a: any) => a.id !== 'ann-1' && a.id !== 'ann-2' && a.id !== 'ann-3'
      );
    }
    if (Array.isArray(parsed.links)) {
      parsed.links = parsed.links.filter(
        (l: any) => l.id !== 'link-1' && !l.url?.includes('116111') && !l.title?.includes('116 111')
      );
    }
    if (!Array.isArray(parsed.registeredAccounts)) {
      parsed.registeredAccounts = [];
    }
    
    // Ensure kebabpanmuala@gmail.com exists in registeredAccounts
    const hasKebab = parsed.registeredAccounts.some((a: any) => 
      a.email && a.email.toLowerCase() === 'kebabpanmuala@gmail.com'
    );
    if (!hasKebab) {
      parsed.registeredAccounts.push({
        id: 'usr_muaupap9_n2172i',
        email: 'kebabpanmuala@gmail.com',
        displayName: (parsed.userProfile && parsed.userProfile.displayName) || 'Kebab Pan Muala',
        username: 'kebabpanmuala',
        nick: 'kebabpanmuala',
        classYear: '3TI (Technik Informatyk)',
        role: 'admin',
        isAdmin: true,
        statusMessage: '🟢 Administrator ZSET GaySpace',
        bio: 'Konto administratora ZSET GaySpace.',
        avatarUrl: (parsed.userProfile && parsed.userProfile.avatarUrl) || 'https://api.dicebear.com/7.x/bottts/svg?seed=kebabpanmuala%40gmail.com',
        avatarPreset: 'pride-flag',
        avatarColor: 'from-blue-500 via-indigo-500 to-purple-600',
        theme: 'midnight-pride',
        passwordHash: hashPassword('zset123'),
        authProvider: 'email',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });
    }

    // Always keep metronome default
    parsed.metronome = {
      bpm: 120,
      beatsPerBar: 4,
      soundType: 'classic',
    };
    return parsed;
  } catch (err) {
    console.error('Error reading storage.json:', err);
    return getInitialCleanState();
  }
}

function writeStoredData(data: Record<string, unknown>) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing storage.json:', err);
    return false;
  }
}

// Ensure clean state on first run if file didn't exist or ensure chat and wheel are empty
const existingData = readStoredData();
writeStoredData(existingData);

// 3-day retention policy for chat messages
const CHAT_RETENTION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

function pruneExpiredChatMessages(messages: any[]): { cleaned: any[]; purgedCount: number } {
  if (!Array.isArray(messages)) return { cleaned: [], purgedCount: 0 };
  const now = Date.now();
  const cleaned = messages.filter((msg) => {
    if (!msg) return false;
    // Check createdAt ISO string first
    if (msg.createdAt) {
      const msgTime = new Date(msg.createdAt).getTime();
      if (!isNaN(msgTime) && (now - msgTime) > CHAT_RETENTION_MS) {
        return false;
      }
    } else if (msg.id && typeof msg.id === 'string' && msg.id.startsWith('msg-')) {
      // Fallback timestamp parse from msg-{epoch}-{random}
      const parts = msg.id.split('-');
      const ts = parseInt(parts[1], 10);
      if (!isNaN(ts) && (now - ts) > CHAT_RETENTION_MS) {
        return false;
      }
    }
    return true;
  });
  return { cleaned, purgedCount: messages.length - cleaned.length };
}

// API Endpoints for Google AI Studio local filesystem persistence
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/storage', (req, res) => {
  const data = readStoredData();
  const { cleaned, purgedCount } = pruneExpiredChatMessages(data.chatMessages || []);
  if (purgedCount > 0) {
    data.chatMessages = cleaned;
    writeStoredData(data);
  }
  res.json({
    success: true,
    storageType: 'Google AI Studio Local Storage',
    filePath: 'data/storage.json',
    data,
  });
});

app.post('/api/storage', (req, res) => {
  const current = readStoredData();
  const incoming = req.body || {};
  
  // Merge accounts safely
  let mergedAccounts = Array.isArray(current.registeredAccounts) ? [...current.registeredAccounts] : [];
  if (Array.isArray(incoming.registeredAccounts)) {
    for (const incAcc of incoming.registeredAccounts) {
      if (!incAcc) continue;
      const incEmail = (incAcc.email || '').toLowerCase().trim();
      const incId = incAcc.id;
      const idx = mergedAccounts.findIndex((a: any) => 
        (incId && a.id === incId) || (incEmail && a.email && a.email.toLowerCase().trim() === incEmail)
      );
      if (idx >= 0) {
        mergedAccounts[idx] = { 
          ...mergedAccounts[idx], 
          ...incAcc,
          email: incAcc.email || mergedAccounts[idx].email,
          passwordHash: incAcc.passwordHash || mergedAccounts[idx].passwordHash,
          avatarUrl: incAcc.avatarUrl || mergedAccounts[idx].avatarUrl,
        };
      } else {
        mergedAccounts.push(incAcc);
      }
    }
  }

  // Merge chat messages safely by ID (never wipe server messages with an older client list)
  let mergedChatMessages = Array.isArray(current.chatMessages) ? [...current.chatMessages] : [];
  if (Array.isArray(incoming.chatMessages)) {
    for (const incMsg of incoming.chatMessages) {
      if (!incMsg || !incMsg.id) continue;
      const existingIdx = mergedChatMessages.findIndex((m: any) => m.id === incMsg.id);
      if (existingIdx >= 0) {
        mergedChatMessages[existingIdx] = { ...mergedChatMessages[existingIdx], ...incMsg };
      } else {
        mergedChatMessages.push(incMsg);
      }
    }
  }
  const { cleaned: prunedChatMessages } = pruneExpiredChatMessages(mergedChatMessages);

  // Preserve userProfile if current has a valid avatar and incoming is empty
  let effectiveUserProfile = current.userProfile;
  if (incoming.userProfile) {
    effectiveUserProfile = {
      ...current.userProfile,
      ...incoming.userProfile,
      avatarUrl: incoming.userProfile.avatarUrl || current.userProfile?.avatarUrl || '',
    };
  }

  const merged = {
    ...current,
    ...incoming,
    userProfile: effectiveUserProfile,
    chatMessages: prunedChatMessages,
    registeredAccounts: mergedAccounts,
    lastSaved: new Date().toISOString(),
  };

  const success = writeStoredData(merged);
  if (success) {
    res.json({
      success: true,
      message: 'Dane zapisane pomyślnie w pamięci Google AI Studio',
      lastSaved: merged.lastSaved,
      storageFile: 'data/storage.json',
      registeredAccountsCount: mergedAccounts.length,
      chatMessagesCount: prunedChatMessages.length,
    });
  } else {
    res.status(500).json({ success: false, error: 'Nie udało się zapisać pliku w Google AI Studio' });
  }
});

// ==========================================
// UNIFIED REAL-TIME CHAT API (Server-Authoritative)
// ==========================================

// Get all current chat messages (auto-pruned with 3-day retention)
app.get('/api/chat/messages', (req, res) => {
  const data = readStoredData();
  const { cleaned, purgedCount } = pruneExpiredChatMessages(data.chatMessages || []);
  if (purgedCount > 0) {
    data.chatMessages = cleaned;
    writeStoredData(data);
  }
  res.json({
    success: true,
    messages: cleaned,
    serverTime: new Date().toISOString(),
    retentionDays: 3,
  });
});

// Post a new chat message to the shared group chat
app.post('/api/chat/messages', (req, res) => {
  const data = readStoredData();
  const { senderId, sender, username, classYear, avatarUrl, avatarPreset, avatarColor, text, timestamp, createdAt } = req.body || {};
  
  const cleanText = typeof text === 'string' ? text.trim() : '';
  if (!cleanText) {
    return res.status(400).json({ success: false, error: 'Treść wiadomości nie może być pusta.' });
  }

  if (!Array.isArray(data.chatMessages)) {
    data.chatMessages = [];
  }

  let finalAvatarUrl = (avatarUrl || '').trim();
  if (finalAvatarUrl.startsWith('data:image/')) {
    finalAvatarUrl = saveBase64Avatar(senderId || 'anon', finalAvatarUrl);
  } else if (!finalAvatarUrl && senderId) {
    const matchedAccount = (data.registeredAccounts || []).find(
      (a: any) => a.id === senderId || (username && a.username === username)
    );
    if (matchedAccount?.avatarUrl) {
      finalAvatarUrl = matchedAccount.avatarUrl;
    }
  }

  const nowIso = new Date().toISOString();
  const newMsg = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    senderId: senderId || 'usr_anon',
    sender: (sender || 'Uczeń ZSET').trim(),
    username: (username || 'uczen_zset').trim().replace(/^@/, ''),
    classYear: (classYear || 'ZSET').trim(),
    avatarUrl: finalAvatarUrl,
    avatarPreset: avatarPreset || 'rainbow-heart',
    avatarColor: avatarColor || 'from-pink-500 via-purple-500 to-indigo-500',
    text: cleanText,
    timestamp: timestamp || new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
    createdAt: createdAt || nowIso,
    reactions: {},
  };

  data.chatMessages.push(newMsg);
  const { cleaned } = pruneExpiredChatMessages(data.chatMessages);
  data.chatMessages = cleaned;
  writeStoredData(data);

  res.json({
    success: true,
    message: newMsg,
    messages: data.chatMessages,
  });
});

// Delete a single message from the shared group chat
app.delete('/api/chat/messages/:id', (req, res) => {
  const data = readStoredData();
  const { id } = req.params;
  if (!Array.isArray(data.chatMessages)) {
    data.chatMessages = [];
  }
  data.chatMessages = data.chatMessages.filter((m: any) => m.id !== id);
  writeStoredData(data);
  res.json({ success: true, messages: data.chatMessages });
});

// Add reaction to a message
app.post('/api/chat/messages/:id/react', (req, res) => {
  const data = readStoredData();
  const { id } = req.params;
  const { emoji } = req.body || {};
  if (!emoji) {
    return res.status(400).json({ success: false, error: 'Brak emoji reakcji.' });
  }
  if (!Array.isArray(data.chatMessages)) {
    data.chatMessages = [];
  }
  const msg = data.chatMessages.find((m: any) => m.id === id);
  if (msg) {
    if (!msg.reactions) msg.reactions = {};
    msg.reactions[emoji] = (msg.reactions[emoji] || 0) + 1;
    writeStoredData(data);
  }
  res.json({ success: true, messages: data.chatMessages });
});

// Clear chat (admin action)
app.post('/api/chat/clear', (req, res) => {
  const data = readStoredData();
  data.chatMessages = [];
  writeStoredData(data);
  res.json({ success: true, message: 'Czat wyczyszczony pomyślnie' });
});

// Authentication & Account API endpoints
app.get('/api/auth/accounts', (req, res) => {
  const data = readStoredData();
  const safeAccounts = (data.registeredAccounts || []).map((acc: any) => ({
    id: acc.id,
    email: acc.email,
    username: acc.username,
    nick: acc.nick || acc.username,
    displayName: acc.displayName,
    classYear: acc.classYear,
    avatarUrl: acc.avatarUrl,
    avatarPreset: acc.avatarPreset,
    avatarColor: acc.avatarColor,
    theme: acc.theme,
    role: acc.role,
    isAdmin: acc.isAdmin,
    statusMessage: acc.statusMessage,
    bio: acc.bio,
    authProvider: acc.authProvider,
    createdAt: acc.createdAt,
    lastLoginAt: acc.lastLoginAt,
    passwordHash: acc.passwordHash,
  }));
  res.json({ success: true, accounts: safeAccounts });
});

app.post('/api/auth/register', (req, res) => {
  const data = readStoredData();
  const {
    email,
    password,
    displayName,
    username,
    classYear,
    avatarUrl,
    avatarPreset,
    avatarColor,
    theme,
    bio,
    statusMessage,
  } = req.body || {};

  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
    return res.status(400).json({ success: false, error: 'Wpisz poprawny adres e-mail (np. uczen@gmail.com).' });
  }

  if (!password || String(password).length < 5) {
    return res.status(400).json({ success: false, error: 'Hasło musi mieć co najmniej 5 znaków.' });
  }

  const cleanDisplayName = (displayName || '').trim() || 'Uczeń ZSET';
  const cleanNick = (username || '').trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_]/g, '') || 
                    cleanDisplayName.toLowerCase().replace(/\s+/g, '_') || 'uczen_zset';

  if (!Array.isArray(data.registeredAccounts)) {
    data.registeredAccounts = [];
  }

  const existingIndex = data.registeredAccounts.findIndex((a: any) => 
    a.email && a.email.toLowerCase().trim() === normalizedEmail
  );

  const isAdmin = normalizedEmail === 'kebabpanmuala@gmail.com' || cleanNick === 'illumiz_' || cleanNick === 'illumiz';

  if (existingIndex >= 0) {
    const existing = data.registeredAccounts[existingIndex];
    // If account was created without custom password, or has default password:
    const isDefaultOrEmptyPassword = !existing.passwordHash || 
                                     existing.passwordHash === hashPassword('zset123') ||
                                     existing.passwordHash === hashPassword(password);

    if (isDefaultOrEmptyPassword) {
      existing.passwordHash = hashPassword(password);
      existing.displayName = cleanDisplayName || existing.displayName;
      existing.username = cleanNick || existing.username;
      existing.nick = cleanNick || existing.nick;
      existing.classYear = classYear || existing.classYear;
      if (avatarUrl) existing.avatarUrl = avatarUrl;
      if (avatarPreset) existing.avatarPreset = avatarPreset;
      if (avatarColor) existing.avatarColor = avatarColor;
      if (theme) existing.theme = theme;
      if (bio) existing.bio = bio;
      if (statusMessage) existing.statusMessage = statusMessage;
      existing.lastLoginAt = new Date().toISOString();
      if (isAdmin) {
        existing.isAdmin = true;
        existing.role = 'admin';
      }
      writeStoredData(data);
      return res.json({ success: true, account: existing, message: 'Konto zaktualizowane i pomyślnie zarejestrowane!' });
    }

    return res.status(409).json({
      success: false,
      error: 'Konto z tym adresem e-mail już istnieje! Zaloguj się wpisując swoje hasło.',
    });
  }

  const newAccount = {
    id: generateAccountId(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    authProvider: 'email',
    displayName: cleanDisplayName,
    username: cleanNick,
    nick: cleanNick,
    classYear: classYear || '3TI (Technik Informatyk)',
    statusMessage: statusMessage || '🟢 Aktywny na przerwie',
    bio: bio || 'Uczeń ZSET Leszno. Bezpieczna i otwarta przestrzeń.',
    avatarUrl: avatarUrl || '',
    avatarPreset: avatarPreset || 'rainbow-heart',
    avatarColor: avatarColor || 'from-pink-500 via-purple-500 to-indigo-500',
    theme: theme || 'midnight-pride',
    role: isAdmin ? 'admin' : 'user',
    isAdmin,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  data.registeredAccounts.push(newAccount);
  writeStoredData(data);

  res.json({ success: true, account: newAccount });
});

app.post('/api/auth/login', (req, res) => {
  const data = readStoredData();
  const { identifier, email, password } = req.body || {};
  
  const rawId = (identifier || email || '').trim();
  if (!rawId) {
    return res.status(400).json({ success: false, error: 'Podaj adres e-mail lub nazwę użytkownika.' });
  }

  if (!password) {
    return res.status(400).json({ success: false, error: 'Wpisz hasło do swojego konta.' });
  }

  const normalized = rawId.toLowerCase().replace(/^@/, '');

  if (!Array.isArray(data.registeredAccounts)) {
    data.registeredAccounts = [];
  }

  // Look for account by email, username, nick, or displayName
  let account = data.registeredAccounts.find((a: any) => {
    const aEmail = (a.email || '').toLowerCase().trim();
    const aUser = (a.username || '').toLowerCase().trim().replace(/^@/, '');
    const aNick = (a.nick || '').toLowerCase().trim().replace(/^@/, '');
    const aDisp = (a.displayName || '').toLowerCase().trim();
    return aEmail === normalized || aUser === normalized || aNick === normalized || aDisp === normalized;
  });

  const isAdminEmailOrNick = normalized === 'kebabpanmuala@gmail.com' || normalized === 'kebabpanmuala' || normalized === 'illumiz_' || normalized === 'illumiz';

  if (!account && isAdminEmailOrNick) {
    account = {
      id: 'usr_muaupap9_n2172i',
      email: 'kebabpanmuala@gmail.com',
      displayName: 'Kebab Pan Muala (Administrator)',
      username: 'kebabpanmuala',
      nick: 'kebabpanmuala',
      classYear: '3TI (Technik Informatyk)',
      role: 'admin',
      isAdmin: true,
      statusMessage: '🟢 Administrator ZSET GaySpace',
      bio: 'Główne konto administratora ZSET GaySpace.',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=kebabpanmuala%40gmail.com',
      avatarPreset: 'pride-flag',
      avatarColor: 'from-blue-500 via-indigo-500 to-purple-600',
      theme: 'midnight-pride',
      passwordHash: hashPassword(password),
      authProvider: 'email',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    data.registeredAccounts.push(account);
    writeStoredData(data);
    return res.json({ success: true, account });
  }

  if (!account) {
    return res.status(404).json({
      success: false,
      error: `Nie znaleziono konta z adresem lub nickiem "${rawId}". Zarejestruj się w zakładce Rejestracja!`,
    });
  }

  // Password verification
  const expectedHash = hashPassword(password);
  if (!account.passwordHash || account.passwordHash === hashPassword('zset123')) {
    account.passwordHash = expectedHash;
  } else if (account.passwordHash !== expectedHash) {
    return res.status(401).json({
      success: false,
      error: 'Nieprawidłowe hasło. Upewnij się, że wpisujesz poprawne hasło.',
    });
  }

  account.lastLoginAt = new Date().toISOString();
  writeStoredData(data);

  return res.json({ success: true, account });
});

app.post('/api/auth/google', (req, res) => {
  const data = readStoredData();
  const { email, name, avatarUrl } = req.body || {};
  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Wymagany jest poprawny adres e-mail konta Google.',
    });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const displayName = name || normalizedEmail.split('@')[0] || 'Uczeń ZSET';
  const cleanNick = normalizedEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'google_user';

  if (!Array.isArray(data.registeredAccounts)) {
    data.registeredAccounts = [];
  }

  let account = data.registeredAccounts.find((a: any) => 
    a.email && a.email.toLowerCase().trim() === normalizedEmail
  );

  const isAdmin = normalizedEmail === 'kebabpanmuala@gmail.com' || cleanNick === 'illumiz_' || cleanNick === 'illumiz';

  if (account) {
    account.lastLoginAt = new Date().toISOString();
    if (avatarUrl && !account.avatarUrl) account.avatarUrl = avatarUrl;
    if (isAdmin) {
      account.isAdmin = true;
      account.role = 'admin';
    }
  } else {
    account = {
      id: generateAccountId(),
      email: normalizedEmail,
      displayName,
      username: cleanNick,
      nick: cleanNick,
      classYear: '3TI (Technik Informatyk)',
      role: isAdmin ? 'admin' : 'user',
      isAdmin,
      statusMessage: '🟢 Zalogowano przez Google',
      bio: 'Konto połączone z Google w ZSET GaySpace.',
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(normalizedEmail)}`,
      avatarPreset: 'pride-flag',
      avatarColor: 'from-blue-500 via-indigo-500 to-purple-600',
      theme: 'midnight-pride',
      authProvider: 'google',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    data.registeredAccounts.push(account);
  }

  writeStoredData(data);
  res.json({ success: true, account });
});

app.post('/api/auth/update-profile', (req, res) => {
  const data = readStoredData();
  const { accountId, updates } = req.body || {};
  if (!accountId || !updates) {
    return res.status(400).json({ success: false, error: 'Brak id konta lub danych do aktualizacji.' });
  }

  // Convert and save base64 avatar to disk file
  if (updates.avatarUrl && typeof updates.avatarUrl === 'string' && updates.avatarUrl.startsWith('data:image/')) {
    updates.avatarUrl = saveBase64Avatar(accountId, updates.avatarUrl);
  }

  if (!Array.isArray(data.registeredAccounts)) {
    data.registeredAccounts = [];
  }

  const index = data.registeredAccounts.findIndex((a: any) => 
    a.id === accountId || (updates.email && a.email && a.email.toLowerCase() === updates.email.toLowerCase())
  );

  let updated: any;
  if (index === -1) {
    // Upsert new account if not registered yet
    updated = {
      id: accountId,
      email: updates.email || 'uczen@zset.leszno.pl',
      displayName: updates.displayName || 'Uczeń ZSET',
      username: updates.username ? updates.username.replace(/^@/, '') : 'uczen_zset',
      nick: updates.username ? updates.username.replace(/^@/, '') : (updates.nick || 'uczen_zset'),
      classYear: updates.classYear || '3TI (Technik Informatyk)',
      statusMessage: updates.statusMessage || '🟢 Aktywny na przerwie',
      bio: updates.bio || 'Uczeń ZSET Leszno. Bezpieczna i otwarta przestrzeń.',
      avatarUrl: updates.avatarUrl || '',
      avatarPreset: updates.avatarPreset || 'rainbow-heart',
      avatarColor: updates.avatarColor || 'from-pink-500 via-purple-500 to-indigo-500',
      theme: updates.theme || 'midnight-pride',
      role: updates.role || (updates.isAdmin ? 'admin' : 'user'),
      isAdmin: Boolean(updates.isAdmin),
      authProvider: updates.authProvider || 'email',
      createdAt: updates.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    data.registeredAccounts.push(updated);
  } else {
    const current = data.registeredAccounts[index];
    updated = {
      ...current,
      ...updates,
      avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : current.avatarUrl,
      email: updates.email || current.email,
      passwordHash: current.passwordHash,
      authProvider: updates.authProvider || current.authProvider,
      nick: updates.username ? updates.username.replace(/^@/, '') : (updates.nick || current.nick),
      lastLoginAt: new Date().toISOString(),
    };
    data.registeredAccounts[index] = updated;
  }

  // Update server active userProfile
  data.userProfile = {
    ...updated,
    lastSaved: new Date().toISOString(),
  };

  // Synchronize past chat messages sent by this account with their updated avatar and name
  if (Array.isArray(data.chatMessages)) {
    data.chatMessages = data.chatMessages.map((msg: any) => {
      if (
        (msg.senderId && msg.senderId === updated.id) ||
        (msg.username && updated.username && msg.username.toLowerCase() === updated.username.toLowerCase())
      ) {
        return {
          ...msg,
          avatarUrl: updated.avatarUrl || msg.avatarUrl,
          avatarPreset: updated.avatarPreset || msg.avatarPreset,
          avatarColor: updated.avatarColor || msg.avatarColor,
          sender: updated.displayName || msg.sender,
          classYear: updated.classYear || msg.classYear,
        };
      }
      return msg;
    });
  }

  writeStoredData(data);
  res.json({ success: true, account: updated, userProfile: data.userProfile });
});

app.post('/api/auth/save-profile', (req, res) => {
  const data = readStoredData();
  const profile = req.body?.profile || req.body;
  if (!profile || !profile.id) {
    return res.status(400).json({ success: false, error: 'Nieprawidłowe dane profilu.' });
  }

  // Convert base64 avatar to persistent disk file
  let finalAvatarUrl = profile.avatarUrl || '';
  if (typeof finalAvatarUrl === 'string' && finalAvatarUrl.startsWith('data:image/')) {
    finalAvatarUrl = saveBase64Avatar(profile.id, finalAvatarUrl);
    profile.avatarUrl = finalAvatarUrl;
  }

  if (!Array.isArray(data.registeredAccounts)) {
    data.registeredAccounts = [];
  }

  const index = data.registeredAccounts.findIndex((a: any) => 
    a.id === profile.id || (profile.email && a.email && a.email.toLowerCase() === profile.email.toLowerCase())
  );

  let savedAccount: any;
  if (index >= 0) {
    const existing = data.registeredAccounts[index];
    savedAccount = {
      ...existing,
      ...profile,
      avatarUrl: finalAvatarUrl !== undefined ? finalAvatarUrl : existing.avatarUrl,
      email: profile.email || existing.email,
      passwordHash: existing.passwordHash,
      lastLoginAt: new Date().toISOString(),
    };
    data.registeredAccounts[index] = savedAccount;
  } else {
    savedAccount = {
      id: profile.id,
      email: profile.email || 'uczen@zset.leszno.pl',
      displayName: profile.displayName || 'Uczeń ZSET',
      username: (profile.username || 'uczen_zset').replace(/^@/, ''),
      nick: (profile.nick || profile.displayName || 'uczen_zset').replace(/^@/, ''),
      classYear: profile.classYear || '3TI (Technik Informatyk)',
      statusMessage: profile.statusMessage || '🟢 Aktywny na przerwie',
      bio: profile.bio || 'Uczeń ZSET Leszno.',
      avatarUrl: finalAvatarUrl,
      avatarPreset: profile.avatarPreset || 'rainbow-heart',
      avatarColor: profile.avatarColor || 'from-pink-500 via-purple-500 to-indigo-500',
      theme: profile.theme || 'midnight-pride',
      role: profile.role || (profile.isAdmin ? 'admin' : 'user'),
      isAdmin: Boolean(profile.isAdmin),
      authProvider: profile.authProvider || 'email',
      createdAt: profile.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    data.registeredAccounts.push(savedAccount);
  }

  // Update server active userProfile so other devices automatically see it
  data.userProfile = {
    ...savedAccount,
    lastSaved: new Date().toISOString(),
  };

  if (Array.isArray(data.chatMessages)) {
    data.chatMessages = data.chatMessages.map((msg: any) => {
      if (
        (msg.senderId && msg.senderId === savedAccount.id) ||
        (msg.username && savedAccount.username && msg.username.toLowerCase() === savedAccount.username.toLowerCase())
      ) {
        return {
          ...msg,
          avatarUrl: savedAccount.avatarUrl || msg.avatarUrl,
          avatarPreset: savedAccount.avatarPreset || msg.avatarPreset,
          avatarColor: savedAccount.avatarColor || msg.avatarColor,
          sender: savedAccount.displayName || msg.sender,
          classYear: savedAccount.classYear || msg.classYear,
        };
      }
      return msg;
    });
  }

  writeStoredData(data);
  res.json({ success: true, account: savedAccount, userProfile: data.userProfile });
});

// Dedicated Avatar serving endpoint
app.get('/api/avatar/:userId', (req, res) => {
  const { userId } = req.params;
  const safeId = (userId || '').replace(/[^a-zA-Z0-9_-]/g, '_');
  
  // Check if file exists on disk
  const possibleExts = ['jpg', 'png', 'jpeg', 'webp'];
  for (const ext of possibleExts) {
    const candidatePath = path.join(AVATARS_DIR, `avatar_${safeId}.${ext}`);
    if (fs.existsSync(candidatePath)) {
      res.setHeader('Cache-Control', 'no-cache');
      return res.sendFile(candidatePath);
    }
  }

  // Check stored accounts for avatar
  const data = readStoredData();
  const acc = (data.registeredAccounts || []).find((a: any) => a.id === userId || a.username === userId);
  if (acc && acc.avatarUrl) {
    if (acc.avatarUrl.startsWith('data:image/')) {
      const savedPath = saveBase64Avatar(userId, acc.avatarUrl);
      const filename = `avatar_${safeId}.jpg`;
      const directPath = path.join(AVATARS_DIR, filename);
      if (fs.existsSync(directPath)) {
        return res.sendFile(directPath);
      }
    } else if (acc.avatarUrl.startsWith('http')) {
      return res.redirect(acc.avatarUrl);
    }
  }

  return res.status(404).json({ error: 'Avatar not found' });
});

// Dedicated avatar upload endpoint
app.post('/api/user/upload-avatar', (req, res) => {
  const { userId, avatarData } = req.body || {};
  if (!userId || !avatarData) {
    return res.status(400).json({ success: false, error: 'Brak userId lub danych obrazu.' });
  }

  const persistentUrl = saveBase64Avatar(userId, avatarData);
  const data = readStoredData();

  if (Array.isArray(data.registeredAccounts)) {
    const acc = data.registeredAccounts.find((a: any) => a.id === userId);
    if (acc) {
      acc.avatarUrl = persistentUrl;
      acc.lastLoginAt = new Date().toISOString();
    }
  }

  if (data.userProfile && (data.userProfile.id === userId || !data.userProfile.id)) {
    data.userProfile.avatarUrl = persistentUrl;
  }

  if (Array.isArray(data.chatMessages)) {
    data.chatMessages = data.chatMessages.map((m: any) => {
      if (m.senderId === userId) {
        return { ...m, avatarUrl: persistentUrl };
      }
      return m;
    });
  }

  writeStoredData(data);
  res.json({ success: true, avatarUrl: persistentUrl });
});

// Get active profile directly from server
app.get('/api/user/active-profile', (req, res) => {
  const data = readStoredData();
  const activeProfile = data.userProfile || (data.registeredAccounts && data.registeredAccounts[0]) || null;
  res.json({ success: true, profile: activeProfile, accounts: data.registeredAccounts || [] });
});

app.post('/api/storage/reset', (req, res) => {
  const initial = getInitialCleanState();
  const success = writeStoredData(initial);
  if (success) {
    res.json({ success: true, message: 'Pomyślnie zresetowano dane do stanu czystego', data: initial });
  } else {
    res.status(500).json({ success: false, error: 'Błąd resetowania danych' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ZSET Leszno Gayspace Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
