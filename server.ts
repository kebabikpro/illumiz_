import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'storage.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
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

// API Endpoints for Google AI Studio local filesystem persistence
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/storage', (req, res) => {
  const data = readStoredData();
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
        };
      } else {
        mergedAccounts.push(incAcc);
      }
    }
  }

  const merged = {
    ...current,
    ...incoming,
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
    });
  } else {
    res.status(500).json({ success: false, error: 'Nie udało się zapisać pliku w Google AI Studio' });
  }
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
  const normalizedEmail = (email || 'kebabpanmuala@gmail.com').trim().toLowerCase();
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

  if (!Array.isArray(data.registeredAccounts)) {
    data.registeredAccounts = [];
  }

  const index = data.registeredAccounts.findIndex((a: any) => a.id === accountId);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Nie znaleziono konta.' });
  }

  const current = data.registeredAccounts[index];
  const updated = {
    ...current,
    ...updates,
    email: updates.email || current.email,
    passwordHash: current.passwordHash,
    authProvider: updates.authProvider || current.authProvider,
    nick: updates.username ? updates.username.replace(/^@/, '') : (updates.nick || current.nick),
  };

  data.registeredAccounts[index] = updated;
  writeStoredData(data);

  res.json({ success: true, account: updated });
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
