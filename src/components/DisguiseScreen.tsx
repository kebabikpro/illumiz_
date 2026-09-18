import React from 'react';
import { EyeOff, ArrowLeft, BookOpen, Cpu, Calculator } from 'lucide-react';

interface DisguiseScreenProps {
  onRestore: () => void;
}

export const DisguiseScreen: React.FC<DisguiseScreenProps> = ({ onRestore }) => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-6 sm:p-12 font-mono select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Fake school header */}
        <div className="flex items-center justify-between border-b-2 border-slate-300 pb-4">
          <div className="flex items-center gap-3">
            <Cpu className="w-8 h-8 text-slate-700" />
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">
                ZSET Leszno • Pracownia Podstaw Elektrotechniki i Elektroniki
              </h1>
              <p className="text-xs text-slate-600">
                Materiały dydaktyczne dla technika elektronika / teleinformatyka
              </p>
            </div>
          </div>

          <button
            onClick={onRestore}
            className="px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Kliknij, gdy jest już bezpiecznie"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Wróć do Gayspace</span>
          </button>
        </div>

        {/* Fake lesson content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-sm space-y-3">
            <h2 className="font-bold text-base text-slate-900 border-b pb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-slate-600" />
              <span>1. Prawo Ohma i Rezystancja</span>
            </h2>
            <p className="text-xs leading-relaxed text-slate-600">
              Natężenie prądu I płynącego przez przewodnik jest wprost proporcjonalne do napięcia U przyłożonego do jego końców i odwrotnie proporcjonalne do jego rezystancji R.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center text-sm font-bold">
              I = U / R &nbsp;&nbsp;|&nbsp;&nbsp; U = I · R &nbsp;&nbsp;|&nbsp;&nbsp; R = U / I
            </div>
            <p className="text-xs text-slate-500">
              Jednostka napięcia: [V] Wolt, prądu: [A] Amper, rezystancji: [Ω] Om.
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-sm space-y-3">
            <h2 className="font-bold text-base text-slate-900 border-b pb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-600" />
              <span>2. I i II Prawo Kirchhoffa</span>
            </h2>
            <p className="text-xs leading-relaxed text-slate-600">
              Suma natężeń prądów wpływających do węzła jest równa sumie prądów wypływających z tego węzła (I Prawo Kirchhoffa).
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center text-sm font-bold">
              Σ I_wpływające = Σ I_wypływające
            </div>
            <p className="text-xs text-slate-500">
              W zamkniętym obwodzie elektrycznym suma algebraiczna wszystkich sił elektromotorycznych i spadków napięć jest równa zeru.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-200/80 rounded border border-slate-300 text-xs text-slate-600 flex items-center justify-between">
          <span>Status: Sesja szkolna aktywna. System pomiarowy podłączony do szyny laboratoryjnej.</span>
          <button
            onClick={onRestore}
            className="text-slate-800 font-bold underline hover:text-black text-xs"
          >
            [Kliknij tutaj, aby powrócić]
          </button>
        </div>
      </div>
    </div>
  );
};
