import React from 'react';
import { Character } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { Sparkles, ArrowRight, Zap, Shield, Flame } from 'lucide-react';

interface CharacterSelectProps {
  onSelect: (character: Character) => void;
  onBack: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ onSelect, onBack }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-emerald-500/40 shadow-2xl text-white">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400">
          Selecciona a tu Protagonista
        </h2>
        <p className="text-slate-300 text-sm mt-2">
          Cada joven posee habilidades únicas para sobrevivir al bosque encantado y escapar de la furia del oso.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {CHARACTERS.map((char) => (
          <div
            key={char.id}
            className="group relative bg-slate-950/80 rounded-2xl p-6 border-2 border-slate-800 hover:border-emerald-500 transition-all duration-300 flex flex-col justify-between shadow-xl overflow-hidden"
          >
            {/* Background glow accent */}
            <div className={`absolute -right-12 -top-12 w-36 h-36 bg-gradient-to-br ${char.avatarBg} rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition`} />

            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${char.avatarBg} flex items-center justify-center font-black text-3xl shadow-lg border border-white/20`}>
                  {char.name[0]}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">{char.name}</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {char.title}
                  </span>
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                {char.description}
              </p>

              {/* Special Ability Card */}
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 mb-6">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4" /> Habilidad Especial: {char.abilityName}
                </div>
                <p className="text-xs text-slate-400">{char.abilityDescription}</p>
              </div>

              {/* Stats Bar */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>Velocidad Base</span>
                  <span className="text-emerald-400 font-bold">{(char.stats.speed * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${char.stats.speed * 70}%` }} />
                </div>

                <div className="flex justify-between text-xs text-slate-400 font-medium pt-1">
                  <span>Potencia de Salto</span>
                  <span className="text-amber-400 font-bold">{(char.stats.jumpPower * 7).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(char.stats.jumpPower / 15) * 100}%` }} />
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelect(char)}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold text-white rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 group-hover:scale-[1.02] transition"
            >
              Jugar con {char.name} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition"
        >
          ← Volver al Menú Principal
        </button>
      </div>
    </div>
  );
};
