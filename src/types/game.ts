export type GameState = 'menu' | 'character_select' | 'playing' | 'paused' | 'game_over' | 'cinematic' | 'victory';

export interface Character {
  id: 'angelina' | 'isabell';
  name: string;
  title: string;
  description: string;
  avatarBg: string;
  accentColor: string;
  stats: {
    speed: number;
    jumpPower: number;
    stumbleRecovery: number; // multiplier for recovery
    berryBoost: number; // bonus multiplier for berries
  };
  abilityName: string;
  abilityDescription: string;
  color: string;
  hairColor: string;
  outfitColor: string;
}

export type ObstacleType = 'trunk' | 'river' | 'bush' | 'rock';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  width: number;
  height: number;
  y: number;
}

export type CollectibleType = 'berry';

export interface Collectible {
  id: string;
  type: CollectibleType;
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface GameStats {
  distanceCovered: number; // meters towards home (e.g. 0 to 500m)
  totalDistance: number;
  bearDistance: number; // current distance from bear in meters (starts at 3.0m, -1.0m per stumble, +0.5m per berry)
  berriesCollected: number;
  score: number;
  multiplier: number;
}
