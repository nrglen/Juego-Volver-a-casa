import React, { useState } from 'react';
import { GameState, Character, GameStats } from './types/game';
import { CHARACTERS } from './data/characters';
import { MainMenu } from './components/MainMenu';
import { CharacterSelect } from './components/CharacterSelect';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { GameOverScene } from './components/GameOverScene';
import { CinematicScene } from './components/CinematicScene';
import { InstructionsModal } from './components/InstructionsModal';
import { TreePine } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(CHARACTERS[0]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [instructionsOpen, setInstructionsOpen] = useState<boolean>(false);
  const initialStats: GameStats = {
    distanceCovered: 0,
    totalDistance: 450,
    bearDistance: 3.0,
    berriesCollected: 0,
    score: 0,
    multiplier: 1,
  };

  const [currentStats, setCurrentStats] = useState<GameStats>(initialStats);
  const [finalStats, setFinalStats] = useState<GameStats>(initialStats);

  const handleStartGame = () => {
    setCurrentStats({ ...initialStats });
    setFinalStats({ ...initialStats });
    setIsPaused(false);
    setGameState('playing');
  };

  const handleGameOver = (stats: GameStats) => {
    setFinalStats(stats);
    setCurrentStats(stats);
    setGameState('game_over');
  };

  const handleVictory = (stats: GameStats) => {
    setFinalStats(stats);
    setCurrentStats(stats);
    setGameState('victory');
  };

  const handlePauseToggle = () => {
    if (gameState === 'playing' || gameState === 'paused') {
      setIsPaused(!isPaused);
      setGameState(isPaused ? 'playing' : 'paused');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-950/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full py-4 px-6 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setGameState('menu')}>
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center shadow-lg">
            <TreePine className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 text-base md:text-lg">
              El Retorno a Casa
            </span>
            <div className="text-[10px] text-slate-400 font-medium">Furia del Bosque Fantástico</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setInstructionsOpen(true)}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
          >
            Guía
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 z-10">
        {gameState === 'menu' && (
          <MainMenu
            selectedCharacter={selectedCharacter}
            onStartGame={handleStartGame}
            onOpenCharacterSelect={() => setGameState('character_select')}
            onOpenInstructions={() => setInstructionsOpen(true)}
          />
        )}

        {gameState === 'character_select' && (
          <CharacterSelect
            onSelect={(char) => {
              setSelectedCharacter(char);
              setGameState('menu');
            }}
            onBack={() => setGameState('menu')}
          />
        )}

        {(gameState === 'playing' || gameState === 'paused') && (
          <div className="w-full flex flex-col items-center gap-4">
            <GameHUD
              stats={currentStats}
              character={selectedCharacter}
              onPause={handlePauseToggle}
            />

            <div className="relative">
              <GameCanvas
                character={selectedCharacter}
                onGameOver={handleGameOver}
                onVictory={handleVictory}
                onPauseToggle={handlePauseToggle}
                onStatsUpdate={setCurrentStats}
                isPaused={isPaused}
              />

              {isPaused && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center text-center p-6 animate-fadeIn">
                  <h3 className="text-3xl font-black text-emerald-400 mb-2">Juego en Pausa</h3>
                  <p className="text-slate-300 text-sm mb-6">Toma un respiro antes de continuar la huida.</p>
                  <button
                    onClick={handlePauseToggle}
                    className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl shadow-lg transition"
                  >
                    Reanudar Partida
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === 'game_over' && (
          <GameOverScene
            character={selectedCharacter}
            stats={finalStats}
            onRetry={handleStartGame}
            onMenu={() => setGameState('menu')}
          />
        )}

        {gameState === 'victory' && (
          <CinematicScene
            character={selectedCharacter}
            stats={finalStats}
            onReplay={handleStartGame}
            onMenu={() => setGameState('menu')}
          />
        )}
      </main>

      {/* Instructions Modal */}
      {instructionsOpen && (
        <InstructionsModal onClose={() => setInstructionsOpen(false)} />
      )}

      {/* Footer */}
      <footer className="w-full py-4 px-6 border-t border-slate-800/80 bg-slate-900/50 backdrop-blur-md text-center text-xs text-slate-500 z-10">
        Creado con pasión como un juego de supervivencia y persecución en el bosque encantado.
      </footer>
    </div>
  );
}
