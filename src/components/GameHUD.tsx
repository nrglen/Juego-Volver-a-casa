import React from 'react';
import { GameStats, Character } from '../types/game';
import { ShieldAlert, Compass, Cherry, Pause, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { audioManager } from '../utils/audio';

interface GameHUDProps {
  stats: GameStats;
  character: Character;
  onPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ stats, character, onPause }) => {
  const [soundEnabled, setSoundEnabled] = React.useState(audioManager.enabled);

  const toggleSound = () => {
    audioManager.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const progressPercent = Math.min(100, Math.floor((stats.distanceCovered / stats.totalDistance) * 100));
  const bearUrgency =
    stats.bearDistance <= 1.0
      ? 'bg-red-500 animate-pulse'
      : stats.bearDistance <= 2.0
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-3 flex flex-col gap-3 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-emerald-500/30 shadow-2xl text-white">
      {/* Top Bar: Character info & controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${character.avatarBg} flex items-center justify-center font-bold text-lg shadow-inner border border-white/20`}>
            {character.name[0]}
          </div>
          <div>
            <div className="font-bold text-sm text-emerald-300">{character.name}</div>
            <div className="text-xs text-slate-400">{character.title}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
            title="Activar/Desactivar Sonido"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>
          <button
            onClick={onPause}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 font-semibold rounded-xl flex items-center gap-2 shadow-lg transition text-sm border border-emerald-500/50"
          >
            <Pause className="w-4 h-4" /> Pausa
          </button>
        </div>
      </div>

      {/* Progress & Bear Meters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Journey Home Progress */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Compass className="w-4 h-4" /> Camino a la Choza de Mamá
            </span>
            <span className="text-slate-300">{progressPercent}% ({Math.floor(stats.distanceCovered)}m / {stats.totalDistance}m)</span>
          </div>
          <div className="w-full bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Bear Chase Distance */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
            <span className="flex items-center gap-1.5 text-red-400">
              <ShieldAlert className="w-4 h-4" /> Distancia del Oso (Inicio: 3.0m)
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${stats.bearDistance <= 1.0 ? 'bg-red-950 text-red-300 border border-red-800 animate-bounce' : 'text-slate-300'}`}>
              {stats.bearDistance <= 1.0 ? `¡ALERTA MÁXIMA: ${stats.bearDistance.toFixed(1)}m!` : `${stats.bearDistance.toFixed(1)}m de distancia`}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-200 ${bearUrgency}`}
              style={{ width: `${Math.min(100, (stats.bearDistance / 5.0) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Collectibles & Mechanics Hint Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-1">
        <div className="bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800 flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs text-pink-400 font-medium">
            <Cherry className="w-4 h-4" /> Frutos Silvestres
          </span>
          <span className="font-bold text-pink-300 text-sm">+{stats.berriesCollected}</span>
        </div>

        <div className="bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Reglas de Huida
          </span>
          <span className="text-[11px] font-semibold text-emerald-300">Fruto: +0.5m | Tropiezo: -1.0m</span>
        </div>

        <div className="col-span-2 md:col-span-1 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Puntuación</span>
          <span className="font-bold text-emerald-400 text-sm">{stats.score}</span>
        </div>
      </div>
    </div>
  );
};
