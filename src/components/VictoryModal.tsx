import React from 'react';
import { GameStats } from '../types/game';
import { Trophy, RotateCcw, Home, Cherry, Sparkles } from 'lucide-react';

interface VictoryModalProps {
  stats: GameStats;
  onRetry: () => void;
  onMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ stats, onRetry, onMenu }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-8 text-white shadow-2xl text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500 rounded-full blur-3xl opacity-20" />

        <div className="w-20 h-20 bg-emerald-950 border-2 border-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl animate-bounce">
          <Trophy className="w-10 h-10 text-emerald-400" />
        </div>

        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mb-2">
          ¡Llegaste a Casa a Salvo!
        </h2>
        <p className="text-slate-300 text-sm mb-6">
          Mamá te recibe con los brazos abiertos en la cálida choza. ¡Has escapado del oso y completado tu misión con éxito!
        </p>

        {/* Stats summary */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3 mb-8 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-emerald-400" /> Estado:</span>
            <span className="font-bold text-emerald-400">Misión Cumplida</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400 flex items-center gap-1.5"><Cherry className="w-4 h-4 text-pink-400" /> Frutos recolectados:</span>
            <span className="font-bold text-pink-300">+{stats.berriesCollected}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5"><Trophy className="w-4 h-4 text-yellow-400" /> Puntuación final:</span>
            <span className="font-bold text-yellow-400 text-base">{stats.score}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onMenu}
            className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-slate-300 transition flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" /> Menú
          </button>
          <button
            onClick={onRetry}
            className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold text-white rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" /> Jugar de Nuevo
          </button>
        </div>
      </div>
    </div>
  );
};
