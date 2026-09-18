/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Smile, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Trash2, 
  ShieldCheck, 
  UserCheck, 
  Edit3, 
  Camera, 
  Lock,
  MessageSquare,
  AtSign,
  GraduationCap,
  Activity
} from 'lucide-react';
import { ChatMessage } from '../types';
import { playChatPop } from '../utils/audio';
import { useAppData } from '../context/DataContext';
import { ProfileModal } from './ProfileModal';

export const GroupChat: React.FC = () => {
  const { 
    data, 
    setChatMessages, 
    clearChatMessages,
    isAdmin 
  } = useAppData();

  const profile = data.userProfile;
  const messages = data.chatMessages || [];

  const [inputMessage, setInputMessage] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const time = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      senderId: profile.id,
      sender: profile.displayName || profile.nick || 'Uczeń ZSET',
      username: profile.username || 'uczen_zset',
      classYear: profile.classYear || 'ZSET',
      avatarUrl: profile.avatarUrl || '',
      avatarPreset: profile.avatarPreset || 'rainbow-heart',
      avatarColor: profile.avatarColor || 'from-pink-500 via-purple-500 to-indigo-500',
      text: inputMessage.trim(),
      timestamp: time,
      reactions: {},
      isCurrentUser: true,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputMessage('');

    if (soundEnabled) {
      playChatPop();
    }
  };

  const handleDeleteMessage = (msgId: string) => {
    const target = messages.find((m) => m.id === msgId);
    if (!target) return;

    const isSender = Boolean(
      (target.senderId && profile.id && target.senderId === profile.id) ||
      (target.username && profile.username && target.username.toLowerCase() === profile.username.toLowerCase()) ||
      (target.isCurrentUser) ||
      (target.sender && (profile.displayName || profile.nick) && target.sender === (profile.displayName || profile.nick))
    );

    if (!isSender && !isAdmin) {
      alert('Możesz usunąć tylko swoją własną wiadomość.');
      return;
    }

    const confirmText = isSender 
      ? 'Czy na pewno chcesz usunąć swoją wiadomość?' 
      : 'Czy na pewno chcesz usunąć tę wiadomość jako administrator?';

    if (confirm(confirmText)) {
      setChatMessages((prev) => prev.filter((m) => m.id !== msgId));
    }
  };

  const handleAddReaction = (msgId: string, emoji: string) => {
    setChatMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId) {
          const currentCount = msg.reactions[emoji] || 0;
          return {
            ...msg,
            reactions: {
              ...msg.reactions,
              [emoji]: currentCount + 1,
            },
          };
        }
        return msg;
      })
    );
  };

  const handleClearChat = () => {
    if (!isAdmin) {
      alert('Tylko administrator może wyczyścić cały czat.');
      return;
    }
    if (confirm('Czy na pewno chcesz wyczyścić historię czatu na czysto?')) {
      clearChatMessages();
    }
  };

  const quickEmojis = ['🏳️‍🌈', '❤️', '🔥', '☕', '✨', '😂', '👍', '🍕'];

  const getPresetEmoji = (preset?: string) => {
    switch (preset) {
      case 'pride-flag': return '🏳️‍🌈';
      case 'zset-tech': return '⚡';
      case 'unicorn': return '🦄';
      case 'coffee': return '☕';
      case 'cat': return '🐾';
      case 'headphones': return '🎧';
      case 'fire': return '🔥';
      case 'gamepad': return '🎮';
      case 'flower': return '🌸';
      case 'star': return '✨';
      case 'pizza': return '🍕';
      case 'rainbow-heart':
      default:
        return '💖';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
      {/* Main Chat Area */}
      <div className="lg:col-span-8 flex flex-col h-[700px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            {/* User current avatar button to trigger profile */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              title="Kliknij, aby edytować swój profil i zdjęcie"
              className="relative group focus:outline-none cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${profile.avatarColor || 'from-pink-500 via-purple-500 to-indigo-500'} flex items-center justify-center text-white shadow-md overflow-hidden ring-2 ring-purple-500/50 group-hover:ring-purple-400 transition-all`}
              >
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Awatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">{getPresetEmoji(profile.avatarPreset)}</span>
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base font-display">Grupowy Czat ZSET</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 uppercase tracking-wider">
                  Czysty Pokój
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>Zalogowano jako:</span>
                <strong className="text-purple-300">{profile.displayName || 'Uczeń ZSET'}</strong>
                <span className="text-slate-500 font-mono">(@{profile.username || 'uczen_zset'})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Edit Profile Quick Button */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              title="Edytuj profil, nick i zdjęcie"
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edytuj profil</span>
            </button>

            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Wycisz dźwięki czatu' : 'Włącz dźwięki czatu'}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Clear chat history - only visible for site admin */}
            {isAdmin && (
              <button
                onClick={handleClearChat}
                title="Wyczyść całą historię czatu (tylko administrator)"
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col">
          {/* Welcome note */}
          <div className="text-center py-1">
            <span className="inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-xs font-semibold">
              🏳️‍🌈 Bezpieczny czat grupy ZSET • Wiadomości są zapisywane lokalnie oraz w Google AI Studio
            </span>
          </div>

          {/* Clean State when empty */}
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 text-slate-500 dark:text-slate-400">
              <div className="w-16 h-16 rounded-3xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 shadow-sm">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-base text-slate-800 dark:text-slate-200 mb-1 font-display">
                Czat grupowy jest czysty
              </h4>
              <p className="text-xs max-w-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
                Wszystkie przykładowe konwersacje oraz fałszywe konta zostały usunięte. Twój pokój jest w 100% gotowy na prawdziwe wiadomości!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {['Hejka wszystkim! 👋', 'Kto ma teraz wolne okienko? ☕', 'Pozdro z ZSET! 🏳️‍🌈'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInputMessage(suggestion)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors shadow-xs cursor-pointer"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = Boolean(
                (msg.senderId && profile.id && msg.senderId === profile.id) ||
                (msg.username && profile.username && msg.username.toLowerCase() === profile.username.toLowerCase()) ||
                (msg.isCurrentUser) ||
                (msg.sender && (profile.displayName || profile.nick) && msg.sender === (profile.displayName || profile.nick))
              );
              const canDelete = isMe || isAdmin;
              const senderName = isMe ? (profile.displayName || profile.nick || 'Uczeń ZSET') : msg.sender;
              const senderUsername = isMe ? (profile.username || 'uczen_zset') : msg.username;
              const senderClassYear = isMe ? (profile.classYear || 'ZSET') : msg.classYear;
              const senderAvatarUrl = isMe ? profile.avatarUrl : msg.avatarUrl;
              const senderAvatarPreset = isMe ? profile.avatarPreset : msg.avatarPreset;
              const senderAvatarColor = isMe ? (profile.avatarColor || 'from-pink-500 via-purple-500 to-indigo-500') : msg.avatarColor;

              return (
                <div
                  key={msg.id}
                  className={`group flex gap-3 max-w-[88%] sm:max-w-[78%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${senderAvatarColor || 'from-purple-500 to-indigo-600'} text-white font-bold flex items-center justify-center text-xs shadow-sm flex-shrink-0 overflow-hidden border border-white/20`}
                  >
                    {senderAvatarUrl ? (
                      <img src={senderAvatarUrl} alt={senderName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">{getPresetEmoji(senderAvatarPreset)}</span>
                    )}
                  </div>

                  <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                    {/* Sender name & class & handle */}
                    <div className={`flex items-center gap-1.5 text-xs ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{senderName}</span>
                      {senderUsername && (
                        <span className="text-[10px] text-slate-400 font-mono">@{senderUsername}</span>
                      )}
                      {senderClassYear && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {senderClassYear.split(' ')[0]}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 ml-1">{msg.timestamp}</span>
                    </div>

                    {/* Message bubble + individual delete button */}
                    <div className={`flex items-center gap-1.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div
                        className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          isMe
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>

                      {canDelete && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          title={isMe ? 'Usuń swoją wiadomość' : 'Usuń wiadomość (administrator)'}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Reactions row */}
                    <div className={`flex flex-wrap items-center gap-1.5 pt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {Object.entries(msg.reactions || {}).map(([emoji, count]) =>
                        count > 0 ? (
                          <button
                            key={emoji}
                            onClick={() => handleAddReaction(msg.id, emoji)}
                            className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1 hover:scale-105 transition-transform cursor-pointer"
                          >
                            <span>{emoji}</span>
                            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">{count}</span>
                          </button>
                        ) : null
                      )}

                      {/* Quick emoji add buttons */}
                      <div className="opacity-60 hover:opacity-100 flex items-center gap-1 text-xs">
                        {['🏳️‍🌈', '❤️', '🔥'].map((emo) => (
                          <button
                            key={emo}
                            onClick={() => handleAddReaction(msg.id, emo)}
                            className="hover:scale-125 transition-transform p-0.5 cursor-pointer"
                            title={`Zareaguj ${emo}`}
                          >
                            {emo}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {/* Quick emoji buttons bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Szybkie reakcje:</span>
            {quickEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setInputMessage((prev) => prev + emoji)}
                className="hover:scale-125 transition-transform text-base px-1 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              id="input-chat-message"
              placeholder={`Napisz wiadomość jako ${profile.displayName || 'Uczeń ZSET'}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <button
              type="submit"
              id="btn-send-message"
              disabled={!inputMessage.trim()}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Wyślij</span>
            </button>
          </form>
        </div>
      </div>

      {/* Sidebar: Clean Profile & Room Info (Zero Fake Users!) */}
      <div className="lg:col-span-4 space-y-6">
        {/* User Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 font-display">
              <UserCheck className="w-4 h-4 text-purple-500" />
              <span>Twój profil</span>
            </h4>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edytuj</span>
            </button>
          </div>

          {/* Profile Card Body */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-purple-50/50 dark:from-slate-800/80 dark:to-purple-950/20 border border-purple-100 dark:border-purple-900/30 space-y-3">
            <div className="flex items-center gap-3.5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${profile.avatarColor || 'from-pink-500 via-purple-500 to-indigo-500'} text-white font-bold flex items-center justify-center text-sm shadow-md overflow-hidden border-2 border-white dark:border-slate-800`}
                >
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Awatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{getPresetEmoji(profile.avatarPreset)}</span>
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-bold text-base text-slate-900 dark:text-white truncate font-display">
                  {profile.displayName || profile.nick || 'Uczeń ZSET'}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400 font-mono">
                  @{profile.username || 'uczen_zset'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                  <GraduationCap className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{profile.classYear}</span>
                </div>
              </div>
            </div>

            {/* Status & Bio */}
            {profile.statusMessage && (
              <div className="text-xs px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-emerald-600 dark:text-emerald-400 font-medium">
                {profile.statusMessage}
              </div>
            )}

            {profile.bio && (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                „{profile.bio}”
              </p>
            )}

            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Zmień zdjęcie i edytuj profil</span>
            </button>
          </div>
        </div>

        {/* Room Privacy & Info Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 font-display">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Prywatność pokoju czatu</span>
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase">
              100% Czysto
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <div className="flex items-start gap-2">
              <span className="text-emerald-500 text-base leading-none">✓</span>
              <span><strong>Brak fałszywych osób:</strong> Wszystkie przykładowe konta online zostały trwale usunięte.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-500 text-base leading-none">✓</span>
              <span><strong>Podwójna trwałość:</strong> Każda wiadomość zapisuje się w Twojej pamięci lokalnej oraz w Google AI Studio.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-500 text-base leading-none">✓</span>
              <span><strong>Przycisk paniki:</strong> Użyj przycisku u góry, by natychmiast ukryć czat szkolnym terminarzem ZSET.</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Wiadomości w wątku: {messages.length}</span>
            <button
              onClick={handleClearChat}
              className="text-rose-500 hover:underline cursor-pointer"
            >
              Wyczyść czat
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Profile Editor Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};
