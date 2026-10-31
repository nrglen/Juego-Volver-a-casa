import React, { useEffect, useRef } from 'react';
import { Character, GameStats, Obstacle, Collectible, Particle, ObstacleType } from '../types/game';
import { audioManager } from '../utils/audio';

interface GameCanvasProps {
  character: Character;
  onGameOver: (stats: GameStats) => void;
  onVictory: (stats: GameStats) => void;
  onPauseToggle: () => void;
  onStatsUpdate?: (stats: GameStats) => void;
  isPaused: boolean;
}

interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface TrackEvent {
  distance: number;
  type: 'obstacle' | 'berry';
  obstacleType?: ObstacleType;
  spawned: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  character,
  onGameOver,
  onVictory,
  onPauseToggle,
  onStatsUpdate,
  isPaused,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Exact 3m mechanics requested by user
  const statsRef = useRef<GameStats>({
    distanceCovered: 0,
    totalDistance: 450,
    bearDistance: 3.0,
    berriesCollected: 0,
    score: 0,
    multiplier: 1,
  });

  // Player state: positioned at x=340 for optimal forward view (510px of sight!)
  const playerRef = useRef({
    x: 340,
    y: 248,
    vy: 0,
    width: 46,
    height: 72,
    isJumping: false,
    isDucking: false,
    stumbleTimer: 0,
  });

  // Jump input buffering for responsive controls
  const jumpBufferRef = useRef(0);

  // Screen shake ref
  const screenShakeRef = useRef(0);
  const bearSteamTimerRef = useRef(0);

  const obstaclesRef = useRef<Obstacle[]>([]);
  const collectiblesRef = useRef<Collectible[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const backgroundXRef = useRef(0);
  const midgroundXRef = useRef(0);

  // CURATED FOREST TRACK: Well-spaced, harmonious pacing across the 450m journey
  // Obstacles are spaced ~35-40m apart (6-8 seconds of clear running space!)
  // CURATED FOREST TRACK: 14 well-spaced ground obstacles and exactly 4 rewarding berries
  const trackEventsRef = useRef<TrackEvent[]>([
    { distance: 25, type: 'obstacle', obstacleType: 'trunk', spawned: false },
    { distance: 48, type: 'obstacle', obstacleType: 'bush', spawned: false },
    { distance: 75, type: 'berry', spawned: false }, // Berry 1
    { distance: 98, type: 'obstacle', obstacleType: 'rock', spawned: false },
    { distance: 122, type: 'obstacle', obstacleType: 'river', spawned: false },
    { distance: 146, type: 'obstacle', obstacleType: 'trunk', spawned: false },
    { distance: 170, type: 'obstacle', obstacleType: 'bush', spawned: false },
    { distance: 195, type: 'berry', spawned: false }, // Berry 2
    { distance: 218, type: 'obstacle', obstacleType: 'river', spawned: false },
    { distance: 242, type: 'obstacle', obstacleType: 'rock', spawned: false },
    { distance: 266, type: 'obstacle', obstacleType: 'trunk', spawned: false },
    { distance: 290, type: 'obstacle', obstacleType: 'bush', spawned: false },
    { distance: 315, type: 'berry', spawned: false }, // Berry 3
    { distance: 338, type: 'obstacle', obstacleType: 'river', spawned: false },
    { distance: 362, type: 'obstacle', obstacleType: 'rock', spawned: false },
    { distance: 386, type: 'obstacle', obstacleType: 'trunk', spawned: false },
    { distance: 410, type: 'berry', spawned: false }, // Berry 4
    { distance: 428, type: 'obstacle', obstacleType: 'bush', spawned: false },
  ]);

  // Execute jump with physics & particles
  const triggerJump = () => {
    const player = playerRef.current;
    const groundY = 320;
    player.vy = -character.stats.jumpPower;
    player.isJumping = true;
    player.isDucking = false;
    audioManager.playJump();

    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x: player.x + player.width / 2 + (Math.random() - 0.5) * 16,
        y: groundY - 2,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 2.5 - 0.5,
        size: Math.random() * 4 + 2,
        color: '#34d399',
        life: 0,
        maxLife: 22,
      });
    }
  };

  // Keyboard controls with jump buffering
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;

      const player = playerRef.current;
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!player.isJumping) {
          triggerJump();
        } else {
          // Buffer jump if pressed shortly before landing
          jumpBufferRef.current = 8;
        }
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        if (!player.isJumping) {
          player.isDucking = true;
          player.height = 42;
        }
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        onPauseToggle();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const player = playerRef.current;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        player.isDucking = false;
        player.height = 72;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [character, isPaused, onPauseToggle]);

  // Touch handlers for mobile
  const handleTouchJump = () => {
    if (isPaused) return;
    const player = playerRef.current;
    if (!player.isJumping) {
      triggerJump();
    } else {
      jumpBufferRef.current = 8;
    }
  };

  const handleTouchDuckStart = () => {
    if (isPaused) return;
    const player = playerRef.current;
    if (!player.isJumping) {
      player.isDucking = true;
      player.height = 42;
    }
  };

  const handleTouchDuckEnd = () => {
    const player = playerRef.current;
    player.isDucking = false;
    player.height = 72;
  };

  // Main Game Loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let hudUpdateCounter = 0;

    const gameLoop = () => {
      const groundY = 320;

      if (!isPaused) {
        const stats = statsRef.current;
        const player = playerRef.current;

        // 1. Update distance & score
        const baseSpeed = 5.2 * character.stats.speed;
        stats.distanceCovered += 0.16 * character.stats.speed;
        stats.score += Math.floor(character.stats.speed * 2);

        // Cap maximum distance at 5.0m
        if (stats.bearDistance > 5.0) {
          stats.bearDistance = 5.0;
        }

        // Check Victory (Reached 450m cabin)
        if (stats.distanceCovered >= stats.totalDistance) {
          onVictory({ ...stats });
          return;
        }

        // Check Game Over (Bear catches girl at 0 meters)
        if (stats.bearDistance <= 0.05) {
          audioManager.playGameOver();
          onGameOver({ ...stats });
          return;
        }

        // 2. Player physics
        player.vy += 0.72; // responsive gravity
        player.y += player.vy;

        // Landing on ground
        if (player.y >= groundY - player.height) {
          player.y = groundY - player.height;
          player.vy = 0;
          player.isJumping = false;

          // Process buffered jump if player pressed Space right before landing
          if (jumpBufferRef.current > 0) {
            jumpBufferRef.current = 0;
            triggerJump();
          }
        }

        if (jumpBufferRef.current > 0) {
          jumpBufferRef.current--;
        }

        if (player.stumbleTimer > 0) {
          player.stumbleTimer--;
        }

        if (screenShakeRef.current > 0) {
          screenShakeRef.current *= 0.88;
          if (screenShakeRef.current < 0.2) screenShakeRef.current = 0;
        }

        // Parallax background scrolling
        backgroundXRef.current = (backgroundXRef.current - baseSpeed * 0.3) % canvas.width;
        midgroundXRef.current = (midgroundXRef.current - baseSpeed * 0.6) % canvas.width;

        // 3. Track Spawning based on Harmonious Schedule
        trackEventsRef.current.forEach((event) => {
          if (!event.spawned && stats.distanceCovered >= event.distance) {
            event.spawned = true;

            if (event.type === 'obstacle' && event.obstacleType) {
              let obsWidth = 56;
              let obsHeight = 36;
              let obsY = groundY - 36;

              if (event.obstacleType === 'trunk') {
                obsWidth = 66;
                obsHeight = 34;
                obsY = groundY - 34;
              } else if (event.obstacleType === 'river') {
                obsWidth = 84;
                obsHeight = 20;
                obsY = groundY - 2;
              } else if (event.obstacleType === 'bush') {
                obsWidth = 60;
                obsHeight = 40;
                obsY = groundY - 40;
              } else if (event.obstacleType === 'rock') {
                obsWidth = 50;
                obsHeight = 40;
                obsY = groundY - 40;
              }

              obstaclesRef.current.push({
                id: Math.random().toString(),
                type: event.obstacleType,
                x: canvas.width + 60,
                width: obsWidth,
                height: obsHeight,
                y: obsY,
              });
            } else if (event.type === 'berry') {
              collectiblesRef.current.push({
                id: Math.random().toString(),
                type: 'berry',
                x: canvas.width + 60,
                y: groundY - 76,
                width: 32,
                height: 32,
                collected: false,
              });
            }
          }
        });

        // 4. Move & Collide Obstacles (Fair Hitbox: Inset by 8px)
        obstaclesRef.current.forEach((obs) => {
          obs.x -= baseSpeed;

          // Player hurtbox
          const playerBox = {
            x: player.x + 10,
            y: player.y + 6,
            width: player.width - 20,
            height: player.height - 8,
          };

          // Inset obstacle hitbox for clean, fair collision
          const obsBox = {
            x: obs.x + 8,
            y: obs.y + 6,
            width: obs.width - 16,
            height: obs.height - 6,
          };

          if (
            playerBox.x < obsBox.x + obsBox.width &&
            playerBox.x + playerBox.width > obsBox.x &&
            playerBox.y < obsBox.y + obsBox.height &&
            playerBox.y + playerBox.height > obsBox.y
          ) {
            if (player.stumbleTimer === 0) {
              // Stumble: Bear closes in by exactly 1.0 meter!
              if (obs.type === 'river') {
                audioManager.playSplash();
              } else {
                audioManager.playStumble();
              }
              audioManager.playBearRoar();

              const penalty = 1.0 * character.stats.stumbleRecovery;
              stats.bearDistance = Math.max(0, stats.bearDistance - penalty);
              player.stumbleTimer = 55; // 55 frames of invulnerability (prevents double hit)
              screenShakeRef.current = 16;

              // Floating indicator: "-1.0m!"
              floatingTextsRef.current.push({
                id: Math.random().toString(),
                text: '-1.0m',
                x: player.x + 10,
                y: player.y - 10,
                vy: -1.2,
                color: '#ef4444',
                alpha: 1,
                life: 0,
                maxLife: 40,
              });

              // Particles
              const particleColor = obs.type === 'river' ? '#38bdf8' : '#f87171';
              for (let i = 0; i < 14; i++) {
                particlesRef.current.push({
                  x: player.x + player.width / 2,
                  y: player.y + player.height / 2,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  size: Math.random() * 6 + 3,
                  color: particleColor,
                  life: 0,
                  maxLife: 26,
                });
              }
            }
          }
        });

        obstaclesRef.current = obstaclesRef.current.filter((obs) => obs.x + obs.width > -50);

        // 5. Move & Collect Berries
        collectiblesRef.current.forEach((col) => {
          col.x -= baseSpeed;

          if (!col.collected) {
            const playerBox = {
              x: player.x,
              y: player.y,
              width: player.width,
              height: player.height,
            };

            const colBox = {
              x: col.x - 4,
              y: col.y - 4,
              width: col.width + 8,
              height: col.height + 8,
            };

            if (
              playerBox.x < colBox.x + colBox.width &&
              playerBox.x + playerBox.width > colBox.x &&
              playerBox.y < colBox.y + colBox.height &&
              playerBox.y + playerBox.height > colBox.y
            ) {
              col.collected = true;
              audioManager.playBerry();
              stats.berriesCollected += 1;

              // Berry Boost: Bear pushed back by 0.5m!
              const boost = 0.5 * character.stats.berryBoost;
              stats.bearDistance = Math.min(5.0, stats.bearDistance + boost);
              stats.score += 250;

              // Floating indicator: "+0.5m!"
              floatingTextsRef.current.push({
                id: Math.random().toString(),
                text: '+0.5m',
                x: col.x,
                y: col.y - 10,
                vy: -1.2,
                color: '#34d399',
                alpha: 1,
                life: 0,
                maxLife: 40,
              });

              for (let i = 0; i < 12; i++) {
                particlesRef.current.push({
                  x: col.x + 16,
                  y: col.y + 16,
                  vx: (Math.random() - 0.5) * 6,
                  vy: -Math.random() * 5 - 2,
                  size: Math.random() * 5 + 3,
                  color: '#f43f5e',
                  life: 0,
                  maxLife: 28,
                });
              }
            }
          }
        });

        collectiblesRef.current = collectiblesRef.current.filter((col) => col.x + col.width > -50 && !col.collected);

        // 6. Update Floating Text Feedback
        floatingTextsRef.current.forEach((ft) => {
          ft.y += ft.vy;
          ft.life++;
          ft.alpha = Math.max(0, 1 - ft.life / ft.maxLife);
        });
        floatingTextsRef.current = floatingTextsRef.current.filter((ft) => ft.life < ft.maxLife);

        // 7. Update Particles
        particlesRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life++;
        });
        particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);

        // Bear steam breath particles
        bearSteamTimerRef.current++;
        if (bearSteamTimerRef.current % 14 === 0) {
          const minBearX = 50;
          const maxBearX = player.x - 55;
          const bearRatio = Math.max(0, Math.min(5.0, stats.bearDistance)) / 5.0;
          const curBearX = maxBearX - bearRatio * (maxBearX - minBearX);

          particlesRef.current.push({
            x: curBearX + 115,
            y: groundY - 60,
            vx: 3 + Math.random() * 2,
            vy: -1 - Math.random() * 1.5,
            size: 6 + Math.random() * 4,
            color: 'rgba(255, 255, 255, 0.45)',
            life: 0,
            maxLife: 24,
          });

          particlesRef.current.push({
            x: curBearX + 10,
            y: groundY - 4,
            vx: -3 - Math.random() * 3,
            vy: -2 - Math.random() * 2,
            size: 4 + Math.random() * 4,
            color: '#78350f',
            life: 0,
            maxLife: 20,
          });
        }

        hudUpdateCounter++;
        if (hudUpdateCounter % 4 === 0 && onStatsUpdate) {
          onStatsUpdate({ ...stats });
        }
      }

      // --- RENDER SCENE ---
      ctx.save();

      let shakeX = 0;
      let shakeY = 0;
      if (screenShakeRef.current > 0) {
        shakeX = (Math.random() - 0.5) * screenShakeRef.current;
        shakeY = (Math.random() - 0.5) * screenShakeRef.current;
      }
      ctx.translate(shakeX, shakeY);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(0.4, '#1e1b4b');
      skyGrad.addColorStop(0.7, '#311042');
      skyGrad.addColorStop(1, '#701a75');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Fireflies
      ctx.fillStyle = 'rgba(253, 224, 71, 0.7)';
      for (let i = 0; i < 20; i++) {
        const fx = (i * 67 + Date.now() * 0.04) % canvas.width;
        const fy = ((i * 41) % 190) + Math.sin(Date.now() * 0.0025 + i) * 12;
        ctx.beginPath();
        ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Parallax Distant Layer
      ctx.fillStyle = '#090d16';
      const bgX = backgroundXRef.current;
      for (let i = -1; i < 3; i++) {
        const startX = i * 420 + (bgX % 420);
        ctx.beginPath();
        ctx.moveTo(startX, 320);
        ctx.lineTo(startX + 110, 140);
        ctx.lineTo(startX + 220, 320);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(startX + 160, 320);
        ctx.lineTo(startX + 280, 100);
        ctx.lineTo(startX + 400, 320);
        ctx.fill();
      }

      // Parallax Midground Layer
      ctx.fillStyle = '#151e2e';
      const mgX = midgroundXRef.current;
      for (let i = -1; i < 3; i++) {
        const startX = i * 320 + (mgX % 320);
        ctx.fillRect(startX + 85, 170, 34, 150);
        ctx.beginPath();
        ctx.arc(startX + 102, 160, 70, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(startX + 95, 255, 9, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#151e2e';
      }

      // Ground Terrain
      const groundGrad = ctx.createLinearGradient(0, 320, 0, canvas.height);
      groundGrad.addColorStop(0, '#064e3b');
      groundGrad.addColorStop(0.3, '#022c22');
      groundGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, 320, canvas.width, canvas.height - 320);

      ctx.fillStyle = '#10b981';
      ctx.fillRect(0, 320, canvas.width, 5);

      // --- RENDER GROUND OBSTACLES: TRUNK, RIVER, BUSH, ROCK ---
      obstaclesRef.current.forEach((obs) => {
        if (obs.type === 'trunk') {
          // 1. Mossy Fallen Tree Trunk
          ctx.fillStyle = '#5c2c16';
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 8);
          ctx.fill();

          ctx.strokeStyle = '#38160a';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(obs.x + 6, obs.y + 10);
          ctx.lineTo(obs.x + obs.width - 6, obs.y + 10);
          ctx.moveTo(obs.x + 10, obs.y + 22);
          ctx.lineTo(obs.x + obs.width - 10, obs.y + 22);
          ctx.stroke();

          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.roundRect(obs.x + 10, obs.y, obs.width - 20, 6, 3);
          ctx.fill();

          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(obs.x + 18, obs.y - 2, 5, Math.PI, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === 'river') {
          // 2. Mountain River Stream Crossing
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(obs.x, groundY, obs.width, 24);

          const waterGrad = ctx.createLinearGradient(obs.x, groundY, obs.x + obs.width, groundY + 20);
          waterGrad.addColorStop(0, '#0284c7');
          waterGrad.addColorStop(0.5, '#38bdf8');
          waterGrad.addColorStop(1, '#0369a1');
          ctx.fillStyle = waterGrad;
          ctx.fillRect(obs.x + 2, groundY, obs.width - 4, 20);

          const flowOffset = (Date.now() * 0.04) % 18;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(obs.x + 8 + flowOffset, groundY + 6);
          ctx.lineTo(obs.x + 24 + flowOffset, groundY + 6);
          ctx.moveTo(obs.x + 28 + flowOffset, groundY + 13);
          ctx.lineTo(obs.x + 48 + flowOffset, groundY + 13);
          ctx.stroke();

          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.ellipse(obs.x + 4, groundY + 3, 6, 4, 0, 0, Math.PI * 2);
          ctx.ellipse(obs.x + obs.width - 4, groundY + 3, 6, 4, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(obs.x + obs.width / 2, groundY + 9, 6, 0, Math.PI * 1.8);
          ctx.fill();
        } else if (obs.type === 'bush') {
          // 3. Lush Forest Bush
          ctx.fillStyle = '#15803d';
          ctx.beginPath();
          ctx.arc(obs.x + 18, obs.y + 24, 18, 0, Math.PI * 2);
          ctx.arc(obs.x + 44, obs.y + 22, 19, 0, Math.PI * 2);
          ctx.arc(obs.x + 31, obs.y + 14, 16, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(obs.x + 18, obs.y + 16, 11, 0, Math.PI * 2);
          ctx.arc(obs.x + 38, obs.y + 14, 12, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(obs.x + 24, obs.y + 12, 3, 0, Math.PI * 2);
          ctx.arc(obs.x + 40, obs.y + 22, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === 'rock') {
          // 4. Smooth Ancient Moss Boulder
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.ellipse(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2, obs.height / 2, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.ellipse(obs.x + obs.width / 2 - 4, obs.y + obs.height / 2 - 4, obs.width / 3, obs.height / 3.5, -0.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.ellipse(obs.x + obs.width / 2 - 2, obs.y + 10, obs.width / 2.6, 8, -0.1, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // --- RENDER SCARCE WILD BERRIES ---
      collectiblesRef.current.forEach((col) => {
        if (!col.collected) {
          const bob = Math.sin(Date.now() * 0.007 + col.x) * 4;

          // Glowing aura
          ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
          ctx.beginPath();
          ctx.arc(col.x + 16, col.y + 16 + bob, 22, 0, Math.PI * 2);
          ctx.fill();

          // Berries cluster
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(col.x + 10, col.y + 18 + bob, 7.5, 0, Math.PI * 2);
          ctx.arc(col.x + 22, col.y + 17 + bob, 7, 0, Math.PI * 2);
          ctx.arc(col.x + 16, col.y + 10 + bob, 7, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fda4af';
          ctx.beginPath();
          ctx.arc(col.x + 8, col.y + 16 + bob, 2.5, 0, Math.PI * 2);
          ctx.arc(col.x + 20, col.y + 15 + bob, 2.5, 0, Math.PI * 2);
          ctx.arc(col.x + 15, col.y + 8 + bob, 2.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.ellipse(col.x + 16, col.y + 4 + bob, 5, 2.5, 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // --- RENDER FLOATING TEXT FEEDBACK (+0.5m / -1.0m) ---
      floatingTextsRef.current.forEach((ft) => {
        ctx.save();
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.alpha;
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // --- RENDER BEAR (EXACT 3 METERS DYNAMICS) ---
      const player = playerRef.current;
      const stats = statsRef.current;

      const minBearX = 50;
      const maxBearX = player.x - 55;
      const bearRatio = Math.max(0, Math.min(5.0, stats.bearDistance)) / 5.0;
      const bearScreenX = maxBearX - bearRatio * (maxBearX - minBearX);

      const gallopPhase = (Date.now() * 0.016) % (Math.PI * 2);
      const bearHumpBob = Math.sin(gallopPhase * 2) * 5;
      const frontLegCycle = Math.sin(gallopPhase) * 22;
      const backLegCycle = Math.cos(gallopPhase) * 20;

      ctx.save();
      ctx.translate(bearScreenX, groundY - 88 + bearHumpBob);

      // Bear Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(60, 88 - bearHumpBob, 55, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Back Hind Legs
      ctx.strokeStyle = '#271206';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(25, 48);
      ctx.lineTo(15 + backLegCycle * 0.7, 76 - bearHumpBob);
      ctx.lineTo(10 + backLegCycle, 88 - bearHumpBob);
      ctx.stroke();

      // Back Front Leg
      ctx.beginPath();
      ctx.moveTo(90, 48);
      ctx.lineTo(82 + frontLegCycle * 0.7, 74 - bearHumpBob);
      ctx.lineTo(76 + frontLegCycle, 88 - bearHumpBob);
      ctx.stroke();

      // Body / Torso
      ctx.fillStyle = '#38160a';
      ctx.beginPath();
      ctx.ellipse(55, 40, 52, 34, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Shoulder Hump
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(75, 26, 26, 0, Math.PI * 2);
      ctx.fill();

      // Front Foreleg
      ctx.strokeStyle = '#38160a';
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.moveTo(85, 46);
      ctx.lineTo(95 - frontLegCycle * 0.6, 70 - bearHumpBob);
      ctx.lineTo(108 - frontLegCycle, 88 - bearHumpBob);
      ctx.stroke();

      // Claws
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      const clawX = 108 - frontLegCycle;
      const clawY = 88 - bearHumpBob;
      ctx.moveTo(clawX, clawY - 4);
      ctx.lineTo(clawX + 8, clawY + 2);
      ctx.lineTo(clawX + 2, clawY + 4);
      ctx.fill();

      // Fore Hind Leg
      ctx.strokeStyle = '#38160a';
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.moveTo(32, 46);
      ctx.lineTo(26 - backLegCycle * 0.6, 72 - bearHumpBob);
      ctx.lineTo(34 - backLegCycle, 88 - bearHumpBob);
      ctx.stroke();

      // Head & Jaws
      ctx.fillStyle = '#2e1205';
      ctx.beginPath();
      ctx.arc(102, 30, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#4a210d';
      ctx.beginPath();
      ctx.ellipse(118, 34, 15, 12, 0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.ellipse(128, 32, 5, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Jaws & Fangs
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.moveTo(116, 36);
      ctx.lineTo(128, 39);
      ctx.lineTo(121, 46);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(122, 36);
      ctx.lineTo(126, 36);
      ctx.lineTo(124, 42);
      ctx.closePath();
      ctx.fill();

      // Red Eyes
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(110, 25, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fca5a5';
      ctx.beginPath();
      ctx.arc(111, 24, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Ears
      ctx.fillStyle = '#271206';
      ctx.beginPath();
      ctx.arc(92, 14, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Threat overlay if bear is 1 meter or closer
      if (stats.bearDistance <= 1.0) {
        const pulse = (Math.sin(Date.now() * 0.015) + 1) / 2;
        const alertGrad = ctx.createLinearGradient(0, 0, 180, 0);
        alertGrad.addColorStop(0, `rgba(239, 68, 68, ${0.45 * pulse})`);
        alertGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = alertGrad;
        ctx.fillRect(0, 0, 180, canvas.height);

        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`¡A ${stats.bearDistance.toFixed(1)}m!`, bearScreenX + 30, groundY - 105 + bearHumpBob);
      }

      // --- RENDER CHARACTER (PROPER ATHLETIC JUMPING) ---
      const isFlashing = player.stumbleTimer > 0 && Math.floor(player.stumbleTimer / 4) % 2 === 0;

      if (!isFlashing) {
        const isAirborne = player.y < groundY - player.height - 2;
        const footBaseY = player.y + player.height;
        const hipX = player.x + 22;
        const hipY = player.y + 44;

        ctx.save();

        // Shadow
        const jumpElevation = groundY - footBaseY;
        const shadowScale = Math.max(0.4, 1 - jumpElevation / 140);
        ctx.fillStyle = `rgba(0, 0, 0, ${0.4 * shadowScale})`;
        ctx.beginPath();
        ctx.ellipse(player.x + 22, groundY + 2, 22 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cloak
        const capeWindCycle = Math.sin(Date.now() * 0.02) * 8;
        const capeLift = isAirborne ? -15 : 0;
        ctx.fillStyle = character.outfitColor;
        ctx.beginPath();
        ctx.moveTo(player.x + 14, player.y + 26);
        ctx.quadraticCurveTo(
          player.x - 22,
          player.y + 36 + capeLift + capeWindCycle,
          player.x - 30,
          player.y + 58 + capeLift + capeWindCycle * 1.4
        );
        ctx.lineTo(player.x - 14, player.y + 60 + capeLift);
        ctx.lineTo(player.x + 18, player.y + 36);
        ctx.closePath();
        ctx.fill();

        // LEGS (Proper athletic jump/run/duck)
        if (player.isDucking) {
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 9;
          ctx.lineCap = 'round';

          ctx.beginPath();
          ctx.moveTo(hipX, hipY);
          ctx.lineTo(hipX + 26, footBaseY - 4);
          ctx.stroke();

          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.roundRect(hipX + 22, footBaseY - 10, 16, 9, 3);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(hipX, hipY);
          ctx.lineTo(hipX - 14, footBaseY - 4);
          ctx.stroke();
        } else if (isAirborne) {
          // TUCKED AIRBORNE JUMP
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 8;
          ctx.lineCap = 'round';

          ctx.beginPath();
          ctx.moveTo(hipX, hipY);
          ctx.lineTo(hipX + 16, hipY + 12);
          ctx.lineTo(hipX + 6, footBaseY - 8);
          ctx.stroke();

          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.roundRect(hipX + 2, footBaseY - 14, 13, 8, 3);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(hipX, hipY);
          ctx.lineTo(hipX - 14, hipY + 14);
          ctx.lineTo(hipX - 6, footBaseY - 12);
          ctx.stroke();

          ctx.fillStyle = '#5c2c16';
          ctx.beginPath();
          ctx.roundRect(hipX - 10, footBaseY - 16, 12, 8, 3);
          ctx.fill();
        } else {
          // NATURAL RUN CYCLE
          const runPhase = (Date.now() * 0.016 * character.stats.speed) % (Math.PI * 2);
          const legSwing1 = Math.sin(runPhase) * 18;
          const legSwing2 = -Math.sin(runPhase) * 18;

          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 8;
          ctx.lineCap = 'round';

          ctx.beginPath();
          ctx.moveTo(hipX, hipY);
          ctx.lineTo(hipX + legSwing2 * 0.7, hipY + 16);
          ctx.lineTo(hipX + legSwing2, footBaseY - 2);
          ctx.stroke();

          ctx.fillStyle = '#5c2c16';
          ctx.beginPath();
          ctx.roundRect(hipX + legSwing2 - 5, footBaseY - 10, 14, 9, 3);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(hipX, hipY);
          ctx.lineTo(hipX + legSwing1 * 0.7, hipY + 16);
          ctx.lineTo(hipX + legSwing1, footBaseY - 2);
          ctx.stroke();

          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.roundRect(hipX + legSwing1 - 4, footBaseY - 10, 14, 9, 3);
          ctx.fill();
        }

        // Torso
        ctx.fillStyle = character.outfitColor;
        ctx.beginPath();
        ctx.roundRect(player.x + 12, player.y + 22, 22, 26, 6);
        ctx.fill();

        ctx.fillStyle = '#451a03';
        ctx.fillRect(player.x + 12, player.y + 36, 22, 6);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(player.x + 21, player.y + 36, 5, 6);

        // Arms
        const armCycle = isAirborne ? -25 : Math.cos(Date.now() * 0.016 * character.stats.speed) * 16;
        ctx.strokeStyle = character.outfitColor;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(player.x + 20, player.y + 26);
        ctx.lineTo(player.x + 10 - armCycle * 0.6, player.y + 38);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(player.x + 24, player.y + 26);
        ctx.lineTo(player.x + 34 + armCycle * 0.6, player.y + 36);
        ctx.stroke();

        // Head
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(player.x + 23, player.y + 15, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(player.x + 28, player.y + 14, 2, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        if (character.id === 'angelina') {
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.arc(player.x + 21, player.y + 13, 12, Math.PI * 0.7, Math.PI * 2.2);
          ctx.fill();

          const hairWind = Math.sin(Date.now() * 0.02) * 5;
          ctx.lineWidth = 5;
          ctx.strokeStyle = '#b45309';
          ctx.beginPath();
          ctx.moveTo(player.x + 14, player.y + 14);
          ctx.quadraticCurveTo(player.x - 6, player.y + 18 + hairWind, player.x - 18, player.y + 28 + hairWind);
          ctx.stroke();

          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(player.x - 12, player.y + 22 + hairWind, 4, 4);
        } else {
          ctx.fillStyle = '#3e1a06';
          ctx.beginPath();
          ctx.arc(player.x + 21, player.y + 13, 12, Math.PI * 0.7, Math.PI * 2.2);
          ctx.fill();

          const hairWind = Math.sin(Date.now() * 0.018) * 6;
          ctx.lineWidth = 6;
          ctx.strokeStyle = '#3e1a06';
          ctx.beginPath();
          ctx.moveTo(player.x + 13, player.y + 15);
          ctx.quadraticCurveTo(player.x - 8, player.y + 22 + hairWind, player.x - 22, player.y + 32 + hairWind);
          ctx.stroke();

          ctx.fillStyle = '#34d399';
          ctx.beginPath();
          ctx.arc(player.x + 20, player.y + 5, 3.5, 0, Math.PI * 2);
          ctx.arc(player.x + 26, player.y + 6, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // Particles
      particlesRef.current.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - p.life / p.maxLife), 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [character, isPaused, onGameOver, onVictory, onStatsUpdate]);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center select-none">
      <canvas
        ref={canvasRef}
        width={850}
        height={400}
        className="w-full max-w-full rounded-2xl shadow-2xl border-4 border-emerald-900/50 bg-slate-950 aspect-[850/400]"
      />

      {/* Mobile / Touch Controls */}
      <div className="w-full mt-4 grid grid-cols-2 gap-4 md:hidden px-4">
        <button
          onPointerDown={handleTouchDuckStart}
          onPointerUp={handleTouchDuckEnd}
          onPointerLeave={handleTouchDuckEnd}
          className="py-4 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg border-2 border-emerald-600 active:scale-95 transition"
        >
          Agacharse (↓)
        </button>
        <button
          onClick={handleTouchJump}
          className="py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg border-2 border-amber-500 active:scale-95 transition"
        >
          ¡Saltar! (Espacio)
        </button>
      </div>

      <div className="mt-3 text-center text-xs text-emerald-300/80 hidden md:block">
        Controles: <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-mono">Espacio</kbd> o <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-mono">↑</kbd> para saltar troncos, ríos, arbustos y rocas | <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-mono">P</kbd> para pausar
      </div>
    </div>
  );
};
