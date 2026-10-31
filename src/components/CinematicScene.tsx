import React, { useEffect, useRef, useState } from 'react';
import { Character, GameStats } from '../types/game';
import { audioManager } from '../utils/audio';
import { Home, RotateCcw, Cherry, Trophy, Heart, ArrowRight } from 'lucide-react';

interface CinematicSceneProps {
  character: Character;
  stats: GameStats;
  onReplay: () => void;
  onMenu: () => void;
}

export const CinematicScene: React.FC<CinematicSceneProps> = ({
  character,
  stats,
  onReplay,
  onMenu,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Phase tracker for UI sync:
  // 'outside' (girl runs in, door slams, bear arrives ONCE and frustrates, then walks away)
  // 'inside' (inside the cabin talking with mother by the fireplace)
  const [currentScene, setCurrentScene] = useState<'outside' | 'inside'>('outside');
  const [dialogueStep, setDialogueStep] = useState<number>(0);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Single timeline counter (prevents bear from restarting)
    let frame = 0;

    // Outside actors state (Runs EXACTLY ONCE)
    let girlX = 60;
    const girlY = 250;
    const doorX = 620;
    let doorClosed = false;
    let doorSlamEffect = 0;

    let bearX = -120;
    const bearTargetX = 490;
    let bearState: 'waiting' | 'charging' | 'skidding' | 'frustrated' | 'leaving' = 'waiting';
    let bearPawLift = 0;
    let bearHasFrustrated = false;

    // Play victory celebration
    audioManager.playVictory();

    const loop = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (frame < 260) {
        // ==========================================
        // SCENE 1: OUTSIDE CABIN (Single continuous run)
        // ==========================================

        // Twilight Sky Gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGrad.addColorStop(0, '#1e1b4b');
        skyGrad.addColorStop(0.5, '#4c1d95');
        skyGrad.addColorStop(1, '#9d174d');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Fireflies
        ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
        for (let i = 0; i < 18; i++) {
          const fx = (i * 51 + Date.now() * 0.02) % canvas.width;
          const fy = ((i * 33) % 150) + Math.sin(Date.now() * 0.003 + i) * 6;
          ctx.beginPath();
          ctx.arc(fx, fy, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Distant pines
        ctx.fillStyle = '#0f172a';
        for (let i = 0; i < 6; i++) {
          const px = i * 150 - 20;
          ctx.beginPath();
          ctx.moveTo(px, 320);
          ctx.lineTo(px + 45, 130);
          ctx.lineTo(px + 90, 320);
          ctx.fill();
        }

        // Ground clearing
        const groundGrad = ctx.createLinearGradient(0, 320, 0, canvas.height);
        groundGrad.addColorStop(0, '#065f46');
        groundGrad.addColorStop(1, '#022c22');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, 320, canvas.width, canvas.height - 320);

        ctx.fillStyle = '#10b981';
        ctx.fillRect(0, 320, canvas.width, 5);

        // --- MOTHER'S CABIN EXTERIOR ---
        const cabinX = 580;
        const cabinY = 160;
        const cabinW = 240;
        const cabinH = 160;

        // Chimney & Smoke
        ctx.fillStyle = '#475569';
        ctx.fillRect(cabinX + 40, cabinY - 50, 30, 60);

        ctx.fillStyle = 'rgba(226, 232, 240, 0.45)';
        for (let i = 0; i < 4; i++) {
          const sy = cabinY - 60 - i * 22 - (frame * 0.8) % 30;
          const sx = cabinX + 55 + Math.sin(frame * 0.03 + i) * 12;
          ctx.beginPath();
          ctx.arc(sx, sy, 12 + i * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Wooden Cabin Walls
        ctx.fillStyle = '#78350f';
        ctx.fillRect(cabinX, cabinY, cabinW, cabinH);

        // Log siding
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 3;
        for (let y = cabinY + 20; y < cabinY + cabinH; y += 22) {
          ctx.beginPath();
          ctx.moveTo(cabinX, y);
          ctx.lineTo(cabinX + cabinW, y);
          ctx.stroke();
        }

        // Triangular Slanted Roof
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.moveTo(cabinX - 25, cabinY + 10);
        ctx.lineTo(cabinX + cabinW / 2, cabinY - 60);
        ctx.lineTo(cabinX + cabinW + 25, cabinY + 10);
        ctx.closePath();
        ctx.fill();

        // Glowing warm window
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.roundRect(cabinX + 130, cabinY + 40, 60, 50, 6);
        ctx.fill();

        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cabinX + 160, cabinY + 40);
        ctx.lineTo(cabinX + 160, cabinY + 90);
        ctx.moveTo(cabinX + 130, cabinY + 65);
        ctx.lineTo(cabinX + 190, cabinY + 65);
        ctx.stroke();

        // Porch Wooden Steps
        ctx.fillStyle = '#92400e';
        ctx.fillRect(doorX - 20, 310, 80, 10);
        ctx.fillRect(doorX - 10, 300, 70, 10);

        // Door Frame
        ctx.fillStyle = '#292524';
        ctx.fillRect(doorX, cabinY + 45, 52, 115);

        // Door (Open initially, then slammed shut)
        if (doorClosed) {
          ctx.fillStyle = '#b45309';
          ctx.fillRect(doorX + 2, cabinY + 47, 48, 111);

          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2;
          ctx.strokeRect(doorX + 2, cabinY + 47, 48, 111);

          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(doorX + 10, cabinY + 105, 4, 0, Math.PI * 2);
          ctx.fill();

          // Door slam visual ring
          if (doorSlamEffect > 0) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${doorSlamEffect / 15})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(doorX + 26, cabinY + 100, 30 + (15 - doorSlamEffect) * 3, 0, Math.PI * 2);
            ctx.stroke();
            doorSlamEffect--;
          }
        } else {
          // Open door with warm welcoming light
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(doorX + 2, cabinY + 47, 48, 111);
        }

        // --- GIRL SPRINTS INTO CABIN (Only runs once, until reaching door) ---
        if (!doorClosed) {
          girlX += 7.5;
          const legCycle = Math.sin(Date.now() * 0.02) * 12;

          ctx.fillStyle = character.outfitColor;
          ctx.fillRect(girlX, girlY + 20, 24, 28);

          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.moveTo(girlX + 12, girlY + 46);
          ctx.lineTo(girlX + 6 + legCycle, 320);
          ctx.moveTo(girlX + 12, girlY + 46);
          ctx.lineTo(girlX + 18 - legCycle, 320);
          ctx.stroke();

          ctx.fillStyle = '#fed7aa';
          ctx.beginPath();
          ctx.arc(girlX + 12, girlY + 12, 12, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = character.hairColor;
          ctx.beginPath();
          ctx.arc(girlX + 10, girlY + 10, 11, Math.PI * 0.7, Math.PI * 2.2);
          ctx.fill();

          // Berry basket in hand
          ctx.fillStyle = '#854d0e';
          ctx.beginPath();
          ctx.arc(girlX + 26, girlY + 34, 7, 0, Math.PI);
          ctx.fill();
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(girlX + 26, girlY + 31, 5, 0, Math.PI * 2);
          ctx.fill();

          // Reach the door: SLAM SHUT!
          if (girlX >= doorX - 8) {
            doorClosed = true;
            doorSlamEffect = 15;
            audioManager.playDoorSlam();
            // Start bear charge immediately
            bearState = 'charging';
          }
        }

        // --- BEAR ARRIVES EXACTLY ONCE & DOES FRUSTRATION GESTURE ---
        if (doorClosed || frame > 30) {
          if (bearState === 'waiting' && frame > 30) {
            bearState = 'charging';
          }

          if (bearState === 'charging') {
            bearX += 8.5; // Fast charge toward cabin
            if (bearX >= bearTargetX - 60) {
              bearState = 'skidding';
            }
          } else if (bearState === 'skidding') {
            bearX += 2.0;
            // Skidding dirt
            ctx.fillStyle = '#78350f';
            for (let i = 0; i < 4; i++) {
              ctx.beginPath();
              ctx.arc(bearX + 80 + Math.random() * 20, 318, Math.random() * 5 + 3, 0, Math.PI * 2);
              ctx.fill();
            }
            if (bearX >= bearTargetX) {
              bearState = 'frustrated';
              if (!bearHasFrustrated) {
                bearHasFrustrated = true;
                audioManager.playBearFrustration();
              }
            }
          } else if (bearState === 'frustrated') {
            // Paws waving in the air in comic frustration right at the closed door!
            bearPawLift = Math.sin(Date.now() * 0.015) * 16;
            if (frame > 175) {
              bearState = 'leaving';
            }
          } else if (bearState === 'leaving') {
            bearX -= 3.0; // Slumps and walks away into the mist
          }

          // Draw Bear
          ctx.save();
          ctx.translate(bearX, 230);
          if (bearState === 'leaving') {
            ctx.scale(-1, 1); // Flip horizontally to walk away left
          }

          // Body
          ctx.fillStyle = '#38160a';
          ctx.beginPath();
          ctx.ellipse(50, 48, 48, 32, 0, 0, Math.PI * 2);
          ctx.fill();

          // Hump
          ctx.fillStyle = '#451a03';
          ctx.beginPath();
          ctx.arc(70, 32, 24, 0, Math.PI * 2);
          ctx.fill();

          // Legs
          ctx.strokeStyle = '#271206';
          ctx.lineWidth = 14;
          ctx.beginPath();
          ctx.moveTo(30, 55);
          ctx.lineTo(26, 90);
          ctx.moveTo(70, 55);
          ctx.lineTo(76, 90);
          ctx.stroke();

          // Head
          ctx.fillStyle = '#2e1205';
          ctx.beginPath();
          ctx.arc(95, 34, 20, 0, Math.PI * 2);
          ctx.fill();

          // Ears
          ctx.fillStyle = '#451a03';
          ctx.beginPath();
          ctx.arc(88, 18, 6, 0, Math.PI * 2);
          ctx.fill();

          // Snout
          ctx.fillStyle = '#5c2c16';
          ctx.beginPath();
          ctx.ellipse(108, 38, 12, 10, 0, 0, Math.PI * 2);
          ctx.fill();

          // Frustration comic speech bubble and raised paws
          if (bearState === 'frustrated') {
            ctx.strokeStyle = '#38160a';
            ctx.lineWidth = 12;
            ctx.beginPath();
            ctx.moveTo(85, 45);
            ctx.lineTo(105, 5 + bearPawLift);
            ctx.stroke();

            // Comic sweatdrop/frustration mark
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(102, 10, 8, 0, Math.PI);
            ctx.stroke();

            // Speech bubble: ¡¡GRRRR!!
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(105, -20, 95, 28, 8);
            ctx.fill();
            ctx.fillStyle = '#dc2626';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText('¡¡GRRRR!!', 120, -2);
          } else {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(100, 28, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }

        // Subtitles during outside action
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        if (!doorClosed) {
          ctx.fillText('¡La niña llega a la choza y entra a toda prisa!', canvas.width / 2, 45);
        } else if (bearState === 'frustrated') {
          ctx.fillText('¡¡SLAM!! La puerta se cierra de golpe y el oso se frustra al no poder entrar...', canvas.width / 2, 45);
        } else if (bearState === 'leaving') {
          ctx.fillText('El oso se retira derrotado de vuelta al bosque.', canvas.width / 2, 45);
        }
      } else {
        // ==========================================
        // SCENE 2: INSIDE THE CABIN (TALKING WITH MOTHER)
        // ==========================================
        if (currentScene !== 'inside') {
          setCurrentScene('inside');
        }

        // Cozy Wooden Cabin Room Interior
        ctx.fillStyle = '#451a03'; // warm timber wall
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Wooden floor planks
        ctx.fillStyle = '#78350f';
        ctx.fillRect(0, 280, canvas.width, 120);
        ctx.strokeStyle = '#38160a';
        ctx.lineWidth = 2;
        for (let py = 295; py < canvas.height; py += 18) {
          ctx.beginPath();
          ctx.moveTo(0, py);
          ctx.lineTo(canvas.width, py);
          ctx.stroke();
        }

        // Stone Fireplace with dancing fire
        const fX = 60;
        const fY = 120;
        ctx.fillStyle = '#475569';
        ctx.fillRect(fX, fY, 140, 160);
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(fX + 20, fY + 40, 100, 120, [15, 15, 0, 0]);
        ctx.fill();

        // Fireplace glow
        const fireFlicker = Math.sin(Date.now() * 0.02) * 6;
        const fireGrad = ctx.createRadialGradient(fX + 70, fY + 110, 10, fX + 70, fY + 110, 90 + fireFlicker);
        fireGrad.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
        fireGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.35)');
        fireGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = fireGrad;
        ctx.fillRect(fX - 40, fY - 10, 220, 200);

        // Animated Dancing Flames
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(fX + 35, fY + 155);
        ctx.lineTo(fX + 55, fY + 100 + fireFlicker);
        ctx.lineTo(fX + 70, fY + 85 + fireFlicker);
        ctx.lineTo(fX + 85, fY + 105 - fireFlicker);
        ctx.lineTo(fX + 105, fY + 155);
        ctx.fill();

        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.moveTo(fX + 50, fY + 155);
        ctx.lineTo(fX + 70, fY + 100 + fireFlicker * 0.5);
        ctx.lineTo(fX + 90, fY + 155);
        ctx.fill();

        // Hanging herbs & pots on wall
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.ellipse(260, 90, 8, 20, 0.2, 0, Math.PI * 2);
        ctx.ellipse(285, 95, 7, 18, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Wooden Dining Table
        const tX = 350;
        const tY = 220;
        ctx.fillStyle = '#92400e';
        ctx.fillRect(tX, tY, 200, 18); // tabletop
        ctx.fillRect(tX + 15, tY + 18, 12, 60); // legs
        ctx.fillRect(tX + 175, tY + 18, 12, 60);

        // Wooden Bowl with freshly collected wild berries on table
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(tX + 100, tY + 6, 22, 0, Math.PI);
        ctx.fill();

        // Fresh Berries in Bowl
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(tX + 92, tY - 4, 7, 0, Math.PI * 2);
        ctx.arc(tX + 108, tY - 3, 7, 0, Math.PI * 2);
        ctx.arc(tX + 100, tY - 10, 6, 0, Math.PI * 2);
        ctx.fill();

        // Steaming Teapot on table
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(tX + 45, tY - 6, 12, 0, Math.PI * 2);
        ctx.fill();

        // Steam from teapot
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let s = 0; s < 3; s++) {
          const sy = tY - 22 - s * 12 - (frame * 0.4) % 18;
          ctx.beginPath();
          ctx.arc(tX + 45 + Math.sin(frame * 0.04 + s) * 5, sy, 4 + s * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // --- MOTHER (Standing lovingly by the table) ---
        const momX = 580;
        const momY = 170;

        // Mother's dress & floral apron
        ctx.fillStyle = '#9f1239'; // rose dress
        ctx.beginPath();
        ctx.roundRect(momX + 8, momY + 30, 36, 80, 8);
        ctx.fill();

        ctx.fillStyle = '#fef08a'; // apron
        ctx.fillRect(momX + 14, momY + 45, 24, 55);

        // Mother's face & smile
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(momX + 26, momY + 16, 16, 0, Math.PI * 2);
        ctx.fill();

        // Mother's hair tied in a gentle bun
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(momX + 26, momY + 12, 16, Math.PI * 0.8, Math.PI * 2.2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(momX + 26, momY - 4, 8, 0, Math.PI * 2); // bun
        ctx.fill();

        // Mother smiling eyes
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(momX + 22, momY + 16, 2, 0, Math.PI * 2);
        ctx.arc(momX + 30, momY + 16, 2, 0, Math.PI * 2);
        ctx.fill();

        // Mother's welcoming open arms
        ctx.strokeStyle = '#9f1239';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(momX + 12, momY + 36);
        ctx.lineTo(momX - 12, momY + 54);
        ctx.stroke();

        // --- DAUGHTER (ANGELINA / ISABELL) TALKING TO HER MOM ---
        const dX = 300;
        const dY = 190;

        // Daughter Body
        ctx.fillStyle = character.outfitColor;
        ctx.beginPath();
        ctx.roundRect(dX + 10, dY + 24, 26, 65, 6);
        ctx.fill();

        // Face
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(dX + 23, dY + 14, 14, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = character.hairColor;
        ctx.beginPath();
        ctx.arc(dX + 21, dY + 11, 14, Math.PI * 0.7, Math.PI * 2.2);
        ctx.fill();

        // Expressive gestures while telling the story
        const talkGesture = Math.sin(Date.now() * 0.008) * 8;
        ctx.strokeStyle = character.outfitColor;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(dX + 30, dY + 35);
        ctx.lineTo(dX + 52, dY + 30 + talkGesture);
        ctx.stroke();

        // In-Canvas Speech Bubble above Daughter
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(160, 40, 360, 55, 12);
        ctx.fill();

        // Speech pointer
        ctx.beginPath();
        ctx.moveTo(310, 95);
        ctx.lineTo(320, 115);
        ctx.lineTo(330, 95);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`"${character.name}: ¡Mamá, un oso me persiguió por todo el bosque!"`, 340, 64);
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText('¡Mira todos los ricos frutos que logré traer para la casa!', 340, 82);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [character]);

  const dialogues = [
    {
      speaker: character.name,
      avatarBg: character.avatarBg,
      title: 'Hija Valiente',
      text: `¡Mamá, mamá! ¡Logré recolectar los frutos silvestres del bosque! Pero no vas a creer lo que pasó... ¡un oso gigantesco apareció a solo 3 metros de distancia y me persiguió todo el camino! ¡Tuve que saltar troncos caídos, cruzar ríos, esquivar arbustos y rocas en el suelo para escapar y llegar a casa!`,
    },
    {
      speaker: 'Mamá',
      avatarBg: 'from-amber-600 to-rose-700',
      title: 'Madre Cariñosa',
      text: `¡Cielo santo, mi valiente niña! ¡Qué alivio tan inmenso que estés a salvo en mis brazos! Mira cuántos hermosos frutos trajiste. Ven junto al fuego a calentarte los pies. He preparado una sopa deliciosa para celebrar que volviste a casa sana y salva.`,
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 p-4 md:p-6 bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-emerald-500/40 shadow-2xl text-white">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
          {currentScene === 'outside' ? '¡Llegada a la Choza de Mamá!' : 'A Salvo en Casa: Hablando con Mamá'}
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          {currentScene === 'outside'
            ? 'El oso llega una sola vez, hace su gesto de frustración y se retira...'
            : 'En el calor del hogar compartiendo los frutos y contando la aventura'}
        </p>
      </div>

      {/* Main Cinematic Canvas */}
      <div className="relative w-full">
        <canvas
          ref={canvasRef}
          width={850}
          height={400}
          className="w-full rounded-2xl shadow-2xl border-4 border-emerald-900/60 bg-slate-950 aspect-[850/400]"
        />

        {currentScene === 'outside' && (
          <button
            onClick={() => setCurrentScene('inside')}
            className="absolute bottom-4 right-4 px-4 py-2 bg-slate-900/85 hover:bg-slate-800 text-xs text-slate-300 font-bold rounded-xl border border-slate-700 transition shadow-lg"
          >
            Ver Interior de la Casa →
          </button>
        )}
      </div>

      {/* Dialogue and Storytelling Card */}
      <div className="w-full bg-slate-950/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${dialogues[dialogueStep].avatarBg} flex items-center justify-center font-bold text-base border border-white/20 shadow-inner`}>
            {dialogues[dialogueStep].speaker[0]}
          </div>
          <div>
            <span className="font-bold text-sm text-white">{dialogues[dialogueStep].speaker}</span>
            <span className="text-xs text-slate-400 ml-2">({dialogues[dialogueStep].title})</span>
          </div>
        </div>

        <p className="text-sm md:text-base text-slate-200 leading-relaxed italic bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          "{dialogues[dialogueStep].text}"
        </p>

        {dialogueStep === 0 && (
          <button
            onClick={() => setDialogueStep(1)}
            className="mt-4 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 font-bold text-xs rounded-xl flex items-center gap-2 transition ml-auto"
          >
            Escuchar a Mamá <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Final Mission Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <Cherry className="w-8 h-8 text-pink-400" />
          <div>
            <div className="text-xs text-slate-400">Frutos Recolectados</div>
            <div className="text-lg font-bold text-pink-300">+{stats.berriesCollected}</div>
          </div>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-400" />
          <div>
            <div className="text-xs text-slate-400">Puntuación Total</div>
            <div className="text-lg font-bold text-amber-300">{stats.score}</div>
          </div>
        </div>

        <div className="col-span-2 md:col-span-1 bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <Home className="w-8 h-8 text-emerald-400" />
          <div>
            <div className="text-xs text-slate-400">Estado de la Misión</div>
            <div className="text-sm font-bold text-emerald-400">¡A Salvo en Casa!</div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
        <button
          onClick={onMenu}
          className="flex-1 py-3.5 px-6 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-slate-300 transition flex items-center justify-center gap-2 text-sm"
        >
          <Home className="w-5 h-5" /> Menú Principal
        </button>
        <button
          onClick={onReplay}
          className="flex-1 py-3.5 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold text-white rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
        >
          <RotateCcw className="w-5 h-5" /> Jugar de Nuevo
        </button>
      </div>
    </div>
  );
};
