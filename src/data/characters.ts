import { Character } from '../types/game';

export const CHARACTERS: Character[] = [
  {
    id: 'angelina',
    name: 'Angelina',
    title: 'La Exploradora Ágil',
    description: 'Una joven valiente y veloz que conoce cada rincón del bosque encantado. Sus reflejos felinos le permiten saltar más alto y recuperarse rápidamente de los tropiezos.',
    avatarBg: 'from-amber-600 to-orange-800',
    accentColor: '#d97706',
    stats: {
      speed: 1.15,
      jumpPower: 13.5,
      stumbleRecovery: 0.7, // 30% less penalty
      berryBoost: 1.3,
    },
    abilityName: 'Salto Élfico',
    abilityDescription: 'Salto mejorado y menor pérdida de distancia al tropezar con obstáculos.',
    color: '#f59e0b',
    hairColor: '#b45309',
    outfitColor: '#9a3412',
  },
  {
    id: 'isabell',
    name: 'Isabell',
    title: 'La Heredera Botánica',
    description: 'Estudiosa de la flora mística del bosque. Isabell tiene una conexión profunda con la naturaleza, lo que hace que cada fruto silvestre le otorgue un impulso de velocidad colosal.',
    avatarBg: 'from-emerald-700 to-teal-900',
    accentColor: '#0d9488',
    stats: {
      speed: 1.1,
      jumpPower: 12.0,
      stumbleRecovery: 1.0,
      berryBoost: 1.7, // 70% stronger berry boost
    },
    abilityName: 'Energía Silvestre',
    abilityDescription: 'Los frutos del bosque otorgan un impulso de velocidad y distancia del oso muy superior.',
    color: '#14b8a6',
    hairColor: '#451a03',
    outfitColor: '#065f46',
  },
];
