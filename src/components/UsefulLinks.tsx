import React, { useState, useEffect } from 'react';
import { 
  Link as LinkIcon, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Clipboard, 
  Search, 
  Sparkles, 
  HeartHandshake, 
  ShieldCheck, 
  Check, 
  Globe,
  FileText
} from 'lucide-react';
import { UsefulLink } from '../types';
import { useAppData } from '../context/DataContext';

export const UsefulLinks: React.FC = () => {
  const { data, setLinks, isAdmin } = useAppData();
  const links = data.links || [];

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Single link form modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<UsefulLink['category']>('Własne linki');

  // Bulk paste modal
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const handleAddSingleLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Tylko administracja strony może dodawać linki.');
      return;
    }
    if (!newTitle.trim() || !newUrl.trim()) return;

    let formattedUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const newLink: UsefulLink = {
      id: 'link-' + Date.now(),
      title: newTitle.trim(),
      url: formattedUrl,
      description: newDescription.trim() || 'Link dodany przez administratora ZSET',
      category: newCategory,
      isCustom: true,
      dateAdded: new Date().toLocaleDateString('pl-PL'),
    };

    setLinks([newLink, ...links]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewUrl('');
    setNewDescription('');
  };

  const handleBulkImport = () => {
    if (!isAdmin) {
      alert('Tylko administracja strony może dodawać linki.');
      return;
    }
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean);
    const importedLinks: UsefulLink[] = [];

    lines.forEach((line, idx) => {
      // Check if line contains a URL
      const urlMatch = line.match(/(https?:\/\/[^\s]+)/i) || line.match(/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*)/i);
      if (urlMatch) {
        let url = urlMatch[0];
        if (!/^https?:\/\//i.test(url)) {
          url = 'https://' + url;
        }
        let title = line.replace(urlMatch[0], '').trim();
        if (!title) {
          try {
            const parsed = new URL(url);
            title = parsed.hostname.replace(/^www\./, '');
          } catch {
            title = `Wklejony link ${idx + 1}`;
          }
        }

        importedLinks.push({
          id: 'link-bulk-' + Date.now() + '-' + idx,
          title: title || 'Wklejony link',
          url,
          description: 'Link dodany przez administratora ZSET',
          category: 'Własne linki',
          isCustom: true,
          dateAdded: new Date().toLocaleDateString('pl-PL'),
        });
      }
    });

    if (importedLinks.length > 0) {
      setLinks((prev) => [...importedLinks, ...prev]);
      setBulkText('');
      setIsBulkModalOpen(false);
    } else {
      alert('Nie znaleziono poprawnych adresów URL w wklejonym tekście. Upewnij się, że tekst zawiera adresy stron internetowych.');
    }
  };

  const handleDeleteLink = (id: string) => {
    if (!isAdmin) {
      alert('Tylko administracja strony może usuwać linki.');
      return;
    }
    if (confirm('Czy na pewno chcesz usunąć ten link?')) {
      setLinks(links.filter((l) => l.id !== id));
    }
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = [
    { id: 'all', label: 'Wszystkie linki' },
    { id: 'Wsparcie i zaufanie', label: 'Wsparcie & Zaufanie' },
    { id: 'Lokalne (Leszno/Wielkopolska)', label: 'Leszno / Wielkopolska' },
    { id: 'Szkoła ZSET', label: 'Szkoła ZSET' },
    { id: 'Społeczność & Edukacja', label: 'Społeczność & Wiedza' },
    { id: 'Własne linki', label: '⭐ Twoje wklejone linki' },
  ];

  const filteredLinks = links.filter((link) => {
    const matchesCat = activeCategory === 'all' || link.category === activeCategory;
    const matchesSearch =
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
              <LinkIcon className="w-4 h-4" />
              <span>Baza Wiedzy & Twoje Linki</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
              Przydatne Linki i Wsparcie
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Wklejaj własne linki, przydatne materiały szkolne lub korzystaj ze sprawdzonych infolinii i organizacji wspierających młodzież LGBT+ w Lesznie i Wielkopolsce.
            </p>
          </div>

          {/* Action buttons to add & paste (admin only) */}
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                id="btn-bulk-paste-links"
                onClick={() => setIsBulkModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center gap-2 transition-all border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-purple-500" />
                <span>Wklej linki hurtowo</span>
              </button>

              <button
                id="btn-add-single-link"
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Dodaj link</span>
              </button>
            </div>
          )}
        </div>

        {/* Rainbow subtle top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-400 via-emerald-400 via-blue-500 to-purple-500" />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Szukaj w linkach..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLinks.map((link) => (
          <div
            key={link.id}
            className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold text-[11px]">
                  {link.category}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    title="Usuń ten link (tylko administracja)"
                    className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {link.title}
              </h4>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {link.description}
              </p>
            </div>

            {/* Bottom Actions: Open & Copy */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400 hover:underline"
              >
                <span>Otwórz stronę</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => handleCopy(link.url, link.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors"
                title="Kopiuj link do schowka"
              >
                {copiedId === link.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] text-emerald-500 font-semibold">Skopiowano</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Kopiuj</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredLinks.length === 0 && (
        <div className="text-center py-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-slate-500">
          {isAdmin
            ? 'Nie znaleziono linków w tej kategorii. Jako administrator możesz użyć przycisku „Dodaj link” lub „Wklej linki hurtowo”, aby dodać nowe!'
            : 'Nie znaleziono linków w tej kategorii.'}
        </div>
      )}

      {/* Modal: Single Link Add */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-500" />
              <span>Dodaj przydatny link</span>
            </h3>

            <form onSubmit={handleAddSingleLink} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tytuł strony / linku *
                </label>
                <input
                  type="text"
                  required
                  placeholder="np. Discord dla uczniów ZSET / Grupa wsparcia"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Adres URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="np. https://example.com lub example.pl"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kategoria
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as UsefulLink['category'])}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Własne linki">Własne linki</option>
                  <option value="Wsparcie i zaufanie">Wsparcie i zaufanie</option>
                  <option value="Lokalne (Leszno/Wielkopolska)">Lokalne (Leszno/Wielkopolska)</option>
                  <option value="Szkoła ZSET">Szkoła ZSET</option>
                  <option value="Społeczność & Edukacja">Społeczność & Edukacja</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Krótki opis (opcjonalnie)
                </label>
                <textarea
                  rows={2}
                  placeholder="Do czego służy ten link..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 text-sm font-medium"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-sm"
                >
                  Dodaj link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bulk Paste Links ("ja je wkleje") */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              <span>Wklejanie linków hurtowo</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Wklej poniżej listę linków (każdy link w nowej linii, np. ze schowka lub notatek). 
              Aplikacja automatycznie rozpozna adresy URL i utworzy z nich kafelki.
            </p>

            <textarea
              rows={6}
              placeholder="Wklej tutaj swoje linki, np.:&#10;https://strona1.pl - opis strony&#10;https://strona2.com&#10;instagram.com/twoja_grupa"
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
            />

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-400">
                Wszystkie wklejone linki trafią do kategorii „Własne linki”.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 text-sm font-medium"
                >
                  Anuluj
                </button>
                <button
                  type="button"
                  onClick={handleBulkImport}
                  disabled={!bulkText.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white text-sm font-semibold shadow-md"
                >
                  Wstaw wszystkie linki
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
