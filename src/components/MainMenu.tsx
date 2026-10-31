import React from 'react';
import { Play, Users, HelpCircle, TreePine, ShieldAlert } from 'lucide-react';
import { Character } from '../types/game';

interface MainMenuProps {
  selectedCharacter: Character;
  onStartGame: () => void;
  onOpenCharacterSelect: () => void;
  onOpenInstructions: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  selectedCharacter,
  onStartGame,
  onOpenCharacterSelect,
  onOpenInstructions,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-12 bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-emerald-500/40 shadow-2xl text-white text-center relative overflow-hidden">
      {/* Background magical glow effects */}
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-600 rounded-full blur-3xl opacity-20" />
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-amber-600 rounded-full blur-3xl opacity-20" />

      {/* Header icon badge */}
      <div className="w-20 h-20 bg-emerald-950 border-2 border-emerald-500/60 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl">
        <TreePine className="w-10 h-10 text-emerald-400" />
      </div>

      <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400 mb-3 tracking-tight">
        El Retorno a Casa
      </h1>
      <p className="text-emerald-300/80 font-medium text-base mb-2">Furia y Supervivencia en el Bosque Fantástico</p>
      <p className="text-slate-300 text-sm max-w-xl mx-auto mb-8 leading-relaxed">
        Recolecta frutos silvestres mientras escapas de la persecución de un oso salvaje a solo 3 metros de distancia. ¡Salta troncos caídos, cruza ríos, esquiva arbustos y rocas en el suelo para volver a salvo con mamá!
      </p>

      {/* Current Character Preview Card */}
      <div className="max-w-md mx-auto bg-slate-950/80 p-5 rounded-2xl border border-slate-800 mb-8 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedCharacter.avatarBg} flex items-center justify-center font-bold text-2xl shadow-inner border border-white/20`}>
            {selectedCharacter.name[0]}
          </div>
          <div className="text-left">
            <div className="text-xs text-slate-400">Protagonista Seleccionada</div>
            <div className="font-bold text-lg text-white">{selectedCharacter.name}</div>
            <div className="text-xs text-emerald-400">{selectedCharacter.title}</div>
          </div>
        </div>

        <button
          onClick={onOpenCharacterSelect}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
        >
          <Users className="w-4 h-4 text-emerald-400" /> Cambiar
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
        <button
          onClick={onStartGame}
          className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-extrabold text-white rounded-2xl shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-3 text-lg transition transform hover:scale-[1.02]"
        >
          <Play className="w-6 h-6 fill-current" /> ¡Comenzar Aventura!
        </button>

        <button
          onClick={onOpenInstructions}
          className="px-6 py-4 bg-slate-800 hover:bg-slate-700 font-bold text-slate-200 rounded-2xl border border-slate-700 transition flex items-center justify-center gap-2"
        >
          <HelpCircle className="w-5 h-5 text-amber-400" /> Instrucciones
        </button>
      </div>
    </div>
  );
};
