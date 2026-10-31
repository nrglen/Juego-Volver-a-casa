import React, { useEffect, useRef, useState } from 'react';
import { Character, GameStats } from '../types/game';
import { audioManager } from '../utils/audio';
import { RotateCcw, Home, Cherry, Compass, Trophy } from 'lucide-react';

interface GameOverSceneProps {
  character: Character;
  stats: GameStats;
  onRetry: () => void;
  onMenu: () => void;
}

export const GameOverScene: React.FC<GameOverSceneProps> = ({
  character,
  stats,
  onRetry,
  onMenu,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phase, setPhase] = useState<'catch' | 'full_belly'>('catch');

  useEffect(() => {
    let animId: number;
    let frame = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Play pounce sound & bear roar on catch
    audioManager.playBearPounce();
    audioManager.playBearRoar();

    // After 3.5 seconds, play snore
    const snoreTimer = setTimeout(() => {
      audioManager.playBearSnore();
    }, 3500);

    const loop = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (frame < 200) {
        // ==========================================
        // PHASE 1: THE CATCH (Bear pounces & puts paw on girl)
        // ==========================================
        // Deep ominous twilight forest
        const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGrad.addColorStop(0, '#090d16');
        skyGrad.addColorStop(0.6, '#1e1b4b');
        skyGrad.addColorStop(1, '#450a0a'); // bloody red ground horizon
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Ground
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(0, 310, canvas.width, canvas.height - 310);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(0, 310, canvas.width, 5);

        // Falling impact / dust rings
        const impactProgress = Math.min(1, frame / 30);
        const bearX = 260 + (1 - impactProgress) * 60;
        const bearY = 200 - Math.sin(impactProgress * Math.PI) * 40;

        // Girl Trapped on Ground
        const girlX = 420;
        const girlY = 275;

        // Girl on the floor (fallen pose)
        ctx.fillStyle = character.outfitColor;
        ctx.beginPath();
        ctx.roundRect(girlX, girlY, 44, 22, 6);
        ctx.fill();

        // Legs sprawled
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(girlX, girlY + 12);
        ctx.lineTo(girlX - 25, girlY + 28);
        ctx.stroke();

        // Head looking up
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(girlX + 46, girlY + 6, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = character.hairColor;
        ctx.beginPath();
        ctx.arc(girlX + 44, girlY + 2, 12, Math.PI * 0.7, Math.PI * 2.2);
        ctx.fill();

        // Overturned berry basket with spilled berries
        ctx.fillStyle = '#854d0e';
        ctx.beginPath();
        ctx.arc(girlX + 75, girlY + 24, 9, 0, Math.PI);
        ctx.fill();

        ctx.fillStyle = '#f43f5e';
        for (let b = 0; b < 5; b++) {
          ctx.beginPath();
          ctx.arc(girlX + 88 + b * 8, girlY + 30, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Giant Dominant Bear Pouncing Over Her
        ctx.save();
        ctx.translate(bearX, bearY);

        // Heavy Bear Body
        ctx.fillStyle = '#38160a';
        ctx.beginPath();
        ctx.ellipse(80, 50, 70, 48, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Massive Shoulder Hump
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(120, 24, 34, 0, Math.PI * 2);
        ctx.fill();

        // Bear Head
        ctx.fillStyle = '#2e1205';
        ctx.beginPath();
        ctx.arc(155, 32, 28, 0, Math.PI * 2);
        ctx.fill();

        // Open menacing jaws
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.moveTo(170, 36);
        ctx.lineTo(192, 44);
        ctx.lineTo(178, 54);
        ctx.closePath();
        ctx.fill();

        // White Fangs
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(178, 36);
        ctx.lineTo(184, 36);
        ctx.lineTo(181, 44);
        ctx.closePath();
        ctx.fill();

        // Glowing red eyes
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(162, 24, 5, 0, Math.PI * 2);
        ctx.fill();

        // Hind Legs supporting
        ctx.strokeStyle = '#271206';
        ctx.lineWidth = 18;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(35, 70);
        ctx.lineTo(10, 110);
        ctx.stroke();

        // Front Arm & MASSIVE PAW PLACED ON TOP OF THE GIRL!
        ctx.strokeStyle = '#38160a';
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(130, 60);
        ctx.lineTo(175, 95); // paw reaching right onto the girl!
        ctx.stroke();

        // Heavy Bear Paw Pinning Her Down
        ctx.fillStyle = '#2e1205';
        ctx.beginPath();
        ctx.ellipse(180, 96, 22, 14, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Sharp claws on paw
        ctx.fillStyle = '#0f172a';
        for (let c = 0; c < 4; c++) {
          ctx.beginPath();
          ctx.moveTo(186 + c * 5, 94);
          ctx.lineTo(194 + c * 5, 104);
          ctx.lineTo(188 + c * 5, 105);
          ctx.fill();
        }

        ctx.restore();

        // Impact shockwave ring
        if (frame > 15 && frame < 55) {
          ctx.strokeStyle = `rgba(239, 68, 68, ${1 - (frame - 15) / 40})`;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(girlX + 20, girlY + 10, (frame - 15) * 5, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Subtitle
        ctx.fillStyle = '#ffffff';
        ctx.font = 'black 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('¡¡EL OSO TE HA ATRAPADO!!', canvas.width / 2, 45);
        ctx.font = '13px sans-serif';
        ctx.fillStyle = '#fca5a5';
        ctx.fillText('La fiera coloca su pesada zarpa encima y reclama todos los frutos...', canvas.width / 2, 72);
      } else {
        // ==========================================
        // PHASE 2: RECLINED AGAINST A TREE WITH FULL BELLY!
        // ==========================================
        if (phase !== 'full_belly') {
          setPhase('full_belly');
        }

        // Serene moonlit enchanted forest
        const forestGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        forestGrad.addColorStop(0, '#020617');
        forestGrad.addColorStop(0.5, '#0f172a');
        forestGrad.addColorStop(1, '#064e3b');
        ctx.fillStyle = forestGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Peaceful fireflies floating
        ctx.fillStyle = 'rgba(253, 224, 71, 0.6)';
        for (let i = 0; i < 15; i++) {
          const fx = (i * 61 + frame * 0.4) % canvas.width;
          const fy = ((i * 37) % 180) + Math.sin(frame * 0.03 + i) * 8;
          ctx.beginPath();
          ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Ground terrain
        ctx.fillStyle = '#065f46';
        ctx.fillRect(0, 310, canvas.width, canvas.height - 310);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(0, 310, canvas.width, 5);

        // --- GIGANTIC ANCIENT TREE (Tree trunk on the right where bear is reclined) ---
        const treeX = 480;
        const treeY = -40;
        ctx.fillStyle = '#38160a';
        ctx.fillRect(treeX, treeY, 180, 350);

        // Tree bark ridges
        ctx.strokeStyle = '#271206';
        ctx.lineWidth = 4;
        for (let bx = treeX + 30; bx < treeX + 160; bx += 35) {
          ctx.beginPath();
          ctx.moveTo(bx, 0);
          ctx.lineTo(bx + 15, 310);
          ctx.stroke();
        }

        // Spreading tree roots
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.moveTo(treeX, 280);
        ctx.quadraticCurveTo(treeX - 45, 310, treeX - 70, 330);
        ctx.lineTo(treeX + 40, 330);
        ctx.fill();

        // Moss on tree
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.roundRect(treeX + 15, 200, 30, 80, 8);
        ctx.fill();

        // --- THE BEAR RECLINED AGAINST THE TREE WITH ENORMOUS FULL BELLY ---
        const bX = 350;
        const bY = 175;

        // Belly breathing animation (expands and contracts contentedly)
        const bellyBreath = Math.sin(frame * 0.04) * 8;

        // Bear back leaning against tree trunk
        ctx.fillStyle = '#38160a';
        ctx.beginPath();
        ctx.ellipse(bX + 110, bY + 60, 55, 65, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Hind legs stretched out comfortably on the grass
        ctx.strokeStyle = '#271206';
        ctx.lineWidth = 22;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(bX + 50, bY + 95);
        ctx.lineTo(bX - 25, 310); // stretched leg 1
        ctx.moveTo(bX + 80, bY + 105);
        ctx.lineTo(bX + 15, 315); // stretched leg 2
        ctx.stroke();

        // Bear feet with claws pointing up
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(bX - 28, 305, 12, 8, -0.4, 0, Math.PI * 2);
        ctx.ellipse(bX + 12, 310, 12, 8, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // ENORMOUS ROUND FULL BELLY ("panza llena")!
        // Beautiful shaded round stomach
        const bellyGrad = ctx.createRadialGradient(
          bX + 40,
          bY + 60,
          10,
          bX + 45,
          bY + 65,
          58 + bellyBreath
        );
        bellyGrad.addColorStop(0, '#5c2c16');
        bellyGrad.addColorStop(0.7, '#451a03');
        bellyGrad.addColorStop(1, '#271206');
        ctx.fillStyle = bellyGrad;
        ctx.beginPath();
        ctx.arc(bX + 40, bY + 65, 54 + bellyBreath, 0, Math.PI * 2);
        ctx.fill();

        // Round belly highlight
        ctx.fillStyle = 'rgba(251, 191, 36, 0.15)';
        ctx.beginPath();
        ctx.arc(bX + 35, bY + 50, 30 + bellyBreath * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // One Paw Resting Contentedly on the Full Belly!
        ctx.strokeStyle = '#38160a';
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.moveTo(bX + 105, bY + 40);
        ctx.lineTo(bX + 45, bY + 65 + bellyBreath * 0.8);
        ctx.stroke();

        // Paw resting on belly
        ctx.fillStyle = '#2e1205';
        ctx.beginPath();
        ctx.arc(bX + 45, bY + 65 + bellyBreath * 0.8, 14, 0, Math.PI * 2);
        ctx.fill();

        // Bear Head (Tilted back resting peacefully against tree)
        ctx.fillStyle = '#2e1205';
        ctx.beginPath();
        ctx.arc(bX + 130, bY - 5, 26, 0, Math.PI * 2);
        ctx.fill();

        // Cute round ears
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(bX + 145, bY - 26, 8, 0, Math.PI * 2);
        ctx.fill();

        // Snout pointing upward snoozing
        ctx.fillStyle = '#4a210d';
        ctx.beginPath();
        ctx.ellipse(bX + 148, bY - 8, 16, 12, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Dark nose
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(bX + 160, bY - 14, 6, 5, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Peaceful closed smile / sleeping line
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(bX + 146, bY - 2, 8, 0.2, Math.PI * 0.9);
        ctx.stroke();

        // Contented closed eyes (curved happy lines: ^_^)
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(bX + 135, bY - 12, 5, Math.PI, 0);
        ctx.stroke();

        // --- ANIMATED "Z z z" SNOOZING BUBBLES ---
        const snoreCycle = (frame * 0.03) % 3;
        ctx.fillStyle = '#93c5fd';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('z', bX + 175 + Math.sin(frame * 0.05) * 6, bY - 30 - ((frame * 0.6) % 40));
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('Z', bX + 190 + Math.sin(frame * 0.04) * 8, bY - 50 - (((frame + 20) * 0.6) % 40));
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText('Z', bX + 210 + Math.sin(frame * 0.03) * 10, bY - 75 - (((frame + 40) * 0.6) % 40));

        // Overturned empty basket nearby
        const basketX = 140;
        const basketY = 300;
        ctx.fillStyle = '#854d0e';
        ctx.beginPath();
        ctx.arc(basketX, basketY, 14, 0, Math.PI);
        ctx.fill();

        // A few scattered berry leaves and berry juice stains
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(basketX + 25, basketY + 8, 4, 0, Math.PI * 2);
        ctx.arc(basketX + 38, basketY + 9, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.ellipse(basketX + 15, basketY + 6, 7, 3, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Comic Speech Bubble on the Left
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(40, 45, 340, 52, 12);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('¡El oso se comió todos los frutos y se dio un banquete!', 210, 68);
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText('Ahora descansa plácidamente recostado al árbol... Zzz', 210, 86);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(snoreTimer);
    };
  }, [character]);

  const progressPercent = Math.min(100, Math.floor((stats.distanceCovered / stats.totalDistance) * 100));

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 p-4 md:p-6 bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-red-500/40 shadow-2xl text-white">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-300 to-amber-300">
          {phase === 'catch' ? '¡El Oso te ha Atrapado!' : 'El Gran Banquete del Oso'}
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          {phase === 'catch'
            ? 'La fiera se abalanza y te inmoviliza con su pesada zarpa...'
            : 'El oso reposa panza arriba recostado al gran roble del bosque'}
        </p>
      </div>

      {/* Cinematic Animation Canvas */}
      <div className="relative w-full">
        <canvas
          ref={canvasRef}
          width={850}
          height={400}
          className="w-full rounded-2xl shadow-2xl border-4 border-red-950/80 bg-slate-950 aspect-[850/400]"
        />

        {phase === 'catch' && (
          <button
            onClick={() => setPhase('full_belly')}
            className="absolute bottom-4 right-4 px-4 py-2 bg-slate-900/85 hover:bg-slate-800 text-xs text-slate-300 font-bold rounded-xl border border-slate-700 transition shadow-lg"
          >
            Ver Siesta del Oso →
          </button>
        )}
      </div>

      {/* Stats Summary Card */}
      <div className="w-full bg-slate-950/90 rounded-2xl p-6 border border-slate-800 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <Compass className="w-8 h-8 text-amber-400" />
          <div>
            <div className="text-xs text-slate-400">Distancia Recorrida</div>
            <div className="text-base font-bold text-white">
              {progressPercent}% ({Math.floor(stats.distanceCovered)}m / {stats.totalDistance}m)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <Cherry className="w-8 h-8 text-pink-400" />
          <div>
            <div className="text-xs text-slate-400">Frutos que te quitó el Oso</div>
            <div className="text-base font-bold text-pink-300">+{stats.berriesCollected} frutos</div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <div>
            <div className="text-xs text-slate-400">Puntuación Alcanzada</div>
            <div className="text-base font-bold text-yellow-400">{stats.score} pts</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
        <button
          onClick={onMenu}
          className="flex-1 py-3.5 px-6 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-slate-300 transition flex items-center justify-center gap-2 text-sm"
        >
          <Home className="w-5 h-5" /> Menú Principal
        </button>
        <button
          onClick={onRetry}
          className="flex-1 py-3.5 px-8 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 font-bold text-white rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
        >
          <RotateCcw className="w-5 h-5" /> Intentar de Nuevo
        </button>
      </div>
    </div>
  );
};
