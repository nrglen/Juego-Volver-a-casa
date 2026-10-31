import React from 'react';
import { X, TreePine, Cherry, ShieldAlert, Compass } from 'lucide-react';

interface InstructionsModalProps {
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mb-6 flex items-center gap-2">
          <TreePine className="w-7 h-7 text-emerald-400" /> Manual de Supervivencia en el Bosque
        </h2>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          {/* Story Context */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-white mb-1 text-base flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" /> La Historia
            </h3>
            <p>
              Mamá te ha pedido recolectar deliciosos frutos silvestres en el bosque fantástico. Sin embargo, un temible oso salvaje te persigue a solo <strong>3 metros</strong> de distancia. ¡Debes sortear troncos caídos, cruzar ríos del bosque, saltar arbustos y rocas en el suelo para volver a la choza y contarle tu aventura a mamá!
            </p>
          </div>

          {/* Controls & Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <h4 className="font-bold text-emerald-400 mb-2">Controles de Teclado</h4>
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between items-center bg-slate-900 p-2 rounded-lg">
                  <span>¡Saltar! (Troncos, Ríos, Arbustos, Rocas)</span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-mono">Espacio / ↑</kbd>
                </li>
                <li className="flex justify-between items-center bg-slate-900 p-2 rounded-lg">
                  <span>Agacharse</span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-mono">↓ / S</kbd>
                </li>
                <li className="flex justify-between items-center bg-slate-900 p-2 rounded-lg">
                  <span>Pausar Juego</span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-mono">P / Esc</kbd>
                </li>
              </ul>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <h4 className="font-bold text-teal-400 mb-2">Mecánicas de Distancia</h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                  <span><strong>Distancia inicial:</strong> El oso empieza a <strong>3.0 metros</strong>.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                  <span><strong>Tropiezos:</strong> Cada tropiezo acerca al oso <strong>1.0 metro</strong>.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-pink-500 inline-block" />
                  <span><strong>Frutos silvestres:</strong> Cada fruto aleja al oso <strong>0.5 metros</strong>.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                  <span><strong>Meta:</strong> Llega a la choza para ver la cinemática final con mamá.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition"
            >
              ¡Entendido, a Correr!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
