import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Plus, 
  ShieldCheck, 
  Sparkles, 
  Heart, 
  MessageSquare, 
  Compass, 
  Gamepad2, 
  Trash2, 
  Link as LinkIcon, 
  CheckCircle2, 
  X,
  Palette,
  Check,
  Pencil,
  User
} from 'lucide-react';
import { Announcement } from '../types';
import { ZsetPrideLogo } from './ZsetPrideLogo';
import { useAppData } from '../context/DataContext';
import { INDIVIDUAL_THEMES } from '../utils/themeManager';

interface HomeAnnouncementsProps {
  onNavigate: (tab: 'chat' | 'wheel' | 'metronome' | 'games' | 'links') => void;
  onOpenProfileModal?: () => void;
}

const getPresetEmoji = (preset?: string) => {
  switch (preset) {
    case 'pride-heart': return '🏳️‍🌈';
    case 'trans-heart': return '⚧️';
    case 'cat': return '🐱';
    case 'sparkles': return '✨';
    case 'alien': return '👾';
    default: return '🌈';
  }
};

export const HomeAnnouncements: React.FC<HomeAnnouncementsProps> = ({ onNavigate, onOpenProfileModal }) => {
  const { data, setAnnouncements, activeTheme, setIndividualTheme, isAdmin } = useAppData();
  const announcements = data.announcements || [];
  const profile = data.userProfile;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'spotkanie' | 'integracja' | 'nauka'>('all');

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<Announcement['category']>('spotkanie');
  const [newOrganizer, setNewOrganizer] = useState('');

  const handleToggleAttend = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const attending = !item.isUserAttending;
          return {
            ...item,
            isUserAttending: attending,
            attendeesCount: attending ? item.attendeesCount + 1 : Math.max(0, item.attendeesCount - 1),
          };
        }
        return item;
      })
    );
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (!isAdmin) {
      alert('Tylko administracja strony może usuwać ogłoszenia.');
      return;
    }
    if (confirm('Czy na pewno chcesz usunąć to ogłoszenie?')) {
      setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Tylko administracja strony może dodawać ogłoszenia.');
      return;
    }
    if (!newTitle.trim() || !newDate.trim() || !newLocation.trim()) return;

    const newAnn: Announcement = {
      id: 'ann-' + Date.now(),
      title: newTitle.trim(),
      date: newDate.trim(),
      time: newTime.trim() || 'Po lekcjach',
      location: newLocation.trim(),
      description: newDescription.trim() || 'Brak dodatkowego opisu. Zapraszamy serdecznie!',
      category: newCategory,
      organizer: newOrganizer.trim() || data.userProfile.displayName || data.userProfile.nick || 'Administrator ZSET',
      attendeesCount: 1,
      isUserAttending: true,
    };

    setAnnouncements([newAnn, ...announcements]);
    setIsModalOpen(false);

    // Reset fields
    setNewTitle('');
    setNewDate('');
    setNewTime('');
    setNewLocation('');
    setNewDescription('');
    setNewOrganizer('');
  };

  const filteredAnnouncements = announcements.filter((ann) => {
    if (filter === 'all') return true;
    return ann.category === filter;
  });

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Welcome Banner strictly as requested */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-10 text-white">
        {/* Rainbow glowing ambient backdrop */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-pink-500/20 via-purple-600/20 to-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-tr from-amber-500/20 via-green-500/20 to-indigo-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="space-y-4 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-purple-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ZSET Leszno • Dyskretna & Bezpieczna Społeczność</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight leading-tight">
              Witaj na podziemnej stronie{' '}
              <span className="bg-gradient-to-r from-red-400 via-amber-300 via-emerald-400 via-sky-400 to-purple-400 bg-clip-text text-transparent">
                ZSET dla geji!
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Twoje bezpieczne schronienie w Zespole Szkół Elektroniczno-Telekomunikacyjnych w Lesznie. 
              Rozmawiaj na czacie, bierz udział w spotkaniach naszej grupy, kręć ruletką i korzystaj z narzędzi w gronie ludzi, którzy Cię rozumieją.
            </p>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <button
                id="btn-goto-chat"
                onClick={() => onNavigate('chat')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/25 transition-all transform active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Otwórz Czat Grupowy</span>
              </button>

              <button
                id="btn-goto-wheel"
                onClick={() => onNavigate('wheel')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Koło Fortuny</span>
              </button>

              <button
                id="btn-goto-games"
                onClick={() => onNavigate('games')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4 text-pink-400" />
                <span>Gierki</span>
              </button>

              <button
                id="btn-goto-links"
                onClick={() => onNavigate('links')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <LinkIcon className="w-4 h-4 text-emerald-400" />
                <span>Przeglądaj linki</span>
              </button>
            </div>
          </div>

          {/* Large Pride ZSET Badge */}
          <div className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-slate-800/60 backdrop-blur-xl border border-white/10 shadow-xl">
            <ZsetPrideLogo size="xl" variant="badge" />
            <div className="text-center">
              <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Oficjalny Emblem</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5 justify-center">
                <span>ZSET Pride Leszno</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Rainbow stripe along bottom of banner */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 flex">
          <div className="flex-1 bg-[#e40303]" />
          <div className="flex-1 bg-[#ff8c00]" />
          <div className="flex-1 bg-[#ffed00]" />
          <div className="flex-1 bg-[#008026]" />
          <div className="flex-1 bg-[#24408e]" />
          <div className="flex-1 bg-[#732982]" />
        </div>
      </section>

      {/* Interactive Theme Selector & Profile Dashboard on Main Page */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Motyw Strony (Interactive Theme Switcher) - 2 cols on lg */}
        <div className="lg:col-span-2 rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Wybierz Motyw Strony</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-semibold border border-purple-500/20">
                    Zmień w każdej chwili
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kliknij dowolny motyw, aby natychmiast zmienić styl i kolory na swoim urządzeniu.
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-400">Aktywny motyw:</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {INDIVIDUAL_THEMES.find((t) => t.id === activeTheme)?.name || 'Midnight Pride'}
              </span>
            </div>
          </div>

          {/* 6 Theme Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {INDIVIDUAL_THEMES.map((theme) => {
              const isSelected = activeTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  id={`btn-home-theme-${theme.id}`}
                  onClick={() => setIndividualTheme(theme.id)}
                  title={`Przełącz motyw na: ${theme.name}`}
                  className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer relative overflow-hidden flex flex-col justify-between gap-3 group ${
                    isSelected
                      ? 'bg-purple-500/10 border-purple-500 shadow-md ring-2 ring-purple-500/30'
                      : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/80 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${theme.previewGradient} flex items-center justify-center text-white text-xs font-bold shadow-xs border border-white/20 flex-shrink-0`}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {theme.name}
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {theme.badge}
                        </span>
                      </div>
                    </div>

                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-black/10"
                      style={{ backgroundColor: theme.accentHex }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] truncate max-w-[130px]">
                      {theme.tagline.split('(')[0]}
                    </span>
                    {isSelected ? (
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> Aktywny
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Włącz ten motyw →
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Twój Profil Ucznia ZSET Card - 1 col on lg */}
        <div className="rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                <User className="w-4 h-4" />
                <span>Twój Profil ZSET</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Zalogowany
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${profile.avatarColor || 'from-pink-500 via-purple-500 to-indigo-500'} flex items-center justify-center text-white text-2xl shadow-lg border-2 border-white dark:border-slate-800 overflow-hidden flex-shrink-0`}
              >
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Awatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{getPresetEmoji(profile.avatarPreset)}</span>
                )}
              </div>

              <div className="min-w-0">
                <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {profile.displayName || profile.nick || 'Uczeń ZSET'}
                </h4>
                <div className="text-xs text-purple-600 dark:text-purple-400 font-mono">
                  @{profile.username || 'uczen'}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                    {profile.classYear || 'Klasa nieustawiona'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Status / O mnie</div>
              <p className="italic line-clamp-2">
                "{profile.bio || profile.statusMessage || 'Uczeń Technikum ZSET w Lesznie.'}"
              </p>
            </div>
          </div>

          <button
            id="btn-home-edit-profile"
            onClick={onOpenProfileModal}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
            <span>Edytuj Swój Profil (Nick, Awatar, Klasa)</span>
          </button>
        </div>
      </section>

      {/* Announcements section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm font-bold tracking-wide uppercase">
              <Calendar className="w-4 h-4" />
              <span>Kalendarz Grupy ZSET</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
              Gejowskie ogłoszenia
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Oficjalne ogłoszenia i spotkania dla chłopaków z ZSET Leszno.
            </p>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2.5">
              <button
                id="btn-add-announcement"
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Dodaj ogłoszenie</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter tags */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { id: 'all', label: 'Wszystkie spotkania' },
            { id: 'spotkanie', label: 'Spotkania po szkole' },
            { id: 'integracja', label: 'Integracja & Kawa' },
            { id: 'nauka', label: 'Nauka & Egzaminy' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id as typeof filter)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === cat.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Announcements List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Category indicator top line */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  ann.category === 'spotkanie'
                    ? 'bg-amber-500'
                    : ann.category === 'integracja'
                    ? 'bg-pink-500'
                    : ann.category === 'nauka'
                    ? 'bg-indigo-500'
                    : 'bg-emerald-500'
                }`}
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 uppercase tracking-wider text-[11px]">
                    {ann.category}
                  </span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    Org: {ann.organizer}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-snug">
                  {ann.title}
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                  {ann.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{ann.date}</span>
                    <span className="text-slate-400">•</span>
                    <Clock className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                    <span>{ann.time}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{ann.location}</span>
                  </div>
                </div>
              </div>

              {/* Attendance action footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    <strong>{ann.attendeesCount}</strong> {ann.attendeesCount === 1 ? 'osoba' : 'osób'} idzie
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      title="Usuń to ogłoszenie (tylko administracja)"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    id={`btn-attend-${ann.id}`}
                    onClick={() => handleToggleAttend(ann.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      ann.isUserAttending
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-600 hover:text-white'
                    }`}
                  >
                    {ann.isUserAttending ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Będę tam!</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-3.5 h-3.5" />
                        <span>Dołączam</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-12 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center shadow-xs">
              <Calendar className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-base text-slate-800 dark:text-slate-200 font-display">
              Brak ogłoszeń
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Aktualnie brak opublikowanych ogłoszeń w tej kategorii.
            </p>
            {isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 mx-auto shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Dodaj ogłoszenie</span>
              </button>
            )}
          </div>
        )}
      </section>

      {/* Safety & Discretion Card */}
      <section className="rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900/50 border border-purple-800/40 p-5 sm:p-6 text-slate-200">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-purple-600/20 text-purple-300 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1 text-sm">
            <h4 className="font-bold text-white text-base">
              Zasady Bezpieczeństwa i Dyskrecji w ZSET Leszno
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Pamiętaj, że Twoje bezpieczeństwo jest najważniejsze. Na spotkania przychodzimy z szacunkiem do prywatności każdego ucznia. 
              Nigdy nie ujawniamy nikogo w szkole (no outting). Korzystaj z pseudonimów, a jeśli ktoś obcy zbliży się do Twojego ekranu, kliknij czerwony przycisk <strong>„Szybka ucieczka”</strong> w górnym rogu, aby natychmiast ukryć stronę.
            </p>
          </div>
        </div>
      </section>

      {/* Modal: Add Announcement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4" />
              <span>Panel Administratora • Nowe ogłoszenie</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Dodaj ogłoszenie
            </h3>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tytuł spotkania *
                </label>
                <input
                  type="text"
                  required
                  placeholder="np. Kawa i integracja po 6. lekcji"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Godzina
                  </label>
                  <input
                    type="text"
                    placeholder="np. 15:00 / długa przerwa"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lokalizacja (miejsce w Lesznie) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="np. Park 1000-lecia / Kawiarnia Rynek / Okolice szkoły"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategoria
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Announcement['category'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="spotkanie">Spotkanie po szkole</option>
                    <option value="integracja">Integracja & Kawa</option>
                    <option value="nauka">Nauka & Egzaminy</option>
                    <option value="plener">Plener / Spacer</option>
                    <option value="inne">Inne</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Twój nick / profil
                  </label>
                  <input
                    type="text"
                    placeholder="np. Kuba_3TI"
                    value={newOrganizer}
                    onChange={(e) => setNewOrganizer(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Opis i szczegóły
                </label>
                <textarea
                  rows={3}
                  placeholder="Napisz krótko co będziemy robić, jak się rozpoznać itp."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold shadow-md"
                >
                  Opublikuj ogłoszenie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
