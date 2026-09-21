import fs from 'fs';
import path from 'path';

const TMP_FILE = path.join('/tmp', 'storage.json');

const INITIAL_CLEAN_STATE = {
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
};

function readData() {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading /tmp/storage.json:', e);
  }
  return INITIAL_CLEAN_STATE;
}

function writeData(data: Record<string, unknown>) {
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error writing /tmp/storage.json:', e);
    return false;
  }
}

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const data = readData();
    return res.status(200).json({
      success: true,
      storageType: 'Vercel Serverless Storage',
      data,
    });
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    const current = readData();
    const merged = {
      ...current,
      ...(body || {}),
      lastSaved: new Date().toISOString(),
    };
    writeData(merged);
    return res.status(200).json({
      success: true,
      message: 'Pomyślnie zsynchronizowano dane',
      lastSaved: merged.lastSaved,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
