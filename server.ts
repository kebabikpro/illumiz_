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
  
  const merged = {
    ...current,
    ...incoming,
    lastSaved: new Date().toISOString(),
  };

  const success = writeStoredData(merged);
  if (success) {
    res.json({
      success: true,
      message: 'Dane zapisane pomyślnie w pamięci Google AI Studio',
      lastSaved: merged.lastSaved,
      storageFile: 'data/storage.json',
    });
  } else {
    res.status(500).json({ success: false, error: 'Nie udało się zapisać pliku w Google AI Studio' });
  }
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
