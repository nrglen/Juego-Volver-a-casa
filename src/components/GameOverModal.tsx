import React from 'react';
import { GameStats } from '../types/game';
import { ShieldAlert, RotateCcw, Home, Trophy, Cherry } from 'lucide-react';

interface GameOverModalProps {
  stats: GameStats;
  onRetry: () => void;
  onMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ stats, onRetry, onMenu }) => {
  const progressPercent = Math.min(100, Math.floor((stats.distanceCovered / stats.totalDistance) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border-2 border-red-500/50 rounded-3xl p-8 text-white shadow-2xl text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600 rounded-full blur-3xl opacity-20" />

        <div className="w-20 h-20 bg-red-950 border-2 border-red-500 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl">
          <ShieldAlert className="w-10 h-10 text-red-400" />
        </div>

        <h2 className="text-3xl font-black text-red-400 mb-2">¡El Oso te ha Alcanzado!</h2>
        <p className="text-slate-300 text-sm mb-6">
          Tres tropiezos sin frutos suficientes acortaron la distancia. ¡Inténtalo de nuevo y corre a casa con mamá!
        </p>

        {/* Stats summary */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3 mb-8 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400 flex items-center gap-1.5"><Home className="w-4 h-4 text-emerald-400" /> Progreso del viaje:</span>
            <span className="font-bold text-white">{progressPercent}% ({Math.floor(stats.distanceCovered)}m)</span>
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
            className="flex-1 py-3.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 font-bold text-white rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" /> Reintentar
          </button>
        </div>
      </div>
    </div>
  );
};
