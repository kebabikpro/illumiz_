/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { 
  Database, 
  HardDrive, 
  Cloud, 
  CheckCircle2, 
  Download, 
  Upload, 
  Trash2, 
  RotateCw, 
  X, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { useAppData } from '../context/DataContext';

interface StorageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StorageModal: React.FC<StorageModalProps> = ({ isOpen, onClose }) => {
  const { 
    data, 
    syncStatus, 
    exportBackup, 
    importBackup, 
    resetAllClean, 
    clearChatMessages, 
    clearWheelOptions, 
    forceServerSync 
  } = useAppData();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const success = importBackup(text);
        if (success) {
          setImportSuccess('Kopia zapasowa wczytana pomyślnie!');
          setImportError(null);
          setTimeout(() => setImportSuccess(null), 3500);
        } else {
          setImportError('Plik nie zawiera prawidłowego formatu danych.');
        }
      } catch (err) {
        setImportError('Błąd odczytu pliku JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    await forceServerSync();
    setIsSyncing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl overflow-hidden relative text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-display">Zapis danych & Kopia zapasowa</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pamięć przeglądarki + bezpieczna chmura
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Indicators */}
        <div className="my-5 space-y-2.5">
          {/* Cloud server file storage */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <Cloud className="w-5 h-5 text-indigo-500" />
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Chmura danych społeczności
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Synchronizacja: <code className="text-purple-600 dark:text-purple-400">Aktywna w czasie rzeczywistym</code>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Aktywny</span>
            </div>
          </div>

          {/* Browser localStorage */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Pamięć lokalna przeglądarki
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Klucz: <code className="text-purple-600 dark:text-purple-400">localStorage</code>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zapisano</span>
            </div>
          </div>

          {/* Data Counters */}
          <div className="grid grid-cols-4 gap-2 pt-1 text-center">
            <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/40">
              <div className="text-xs text-slate-500">Wiadomości</div>
              <div className="font-bold text-sm text-purple-600 dark:text-purple-400">
                {data.chatMessages.length}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/40">
              <div className="text-xs text-slate-500">Koło fortuny</div>
              <div className="font-bold text-sm text-purple-600 dark:text-purple-400">
                {data.wheelOptions.length}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/40">
              <div className="text-xs text-slate-500">Spotkania</div>
              <div className="font-bold text-sm text-purple-600 dark:text-purple-400">
                {data.announcements.length}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/40">
              <div className="text-xs text-slate-500">Linki</div>
              <div className="font-bold text-sm text-purple-600 dark:text-purple-400">
                {data.links.length}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {importSuccess && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{importSuccess}</span>
          </div>
        )}
        {importError && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={exportBackup}
              className="py-2.5 px-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Pobierz kopię (JSON)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Wczytaj kopię</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
          </div>

          <button
            onClick={handleForceSync}
            disabled={isSyncing}
            className="w-full py-2 px-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-purple-500' : ''}`} />
            <span>{isSyncing ? 'Synchronizowanie...' : 'Odśwież synchronizację z serwerem'}</span>
          </button>

          {/* Quick Clean Actions */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Szybkie czyszczenie:</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (confirm('Czy na pewno wyczyścić wiadomości na czacie?')) clearChatMessages();
                }}
                className="text-rose-500 hover:underline hover:text-rose-600"
              >
                Wyczyść czat
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  if (confirm('Czy na pewno wyczyścić opcje koła fortuny?')) clearWheelOptions();
                }}
                className="text-rose-500 hover:underline hover:text-rose-600"
              >
                Wyczyść koło
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  if (confirm('Zresetować wszystkie dane do czystego stanu początkowego?')) resetAllClean();
                }}
                className="text-rose-600 dark:text-rose-400 font-semibold hover:underline"
              >
                Resetuj wszystko
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
