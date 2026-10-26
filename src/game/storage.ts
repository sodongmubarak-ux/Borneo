/**
 * Fireland: Borneo Forest Rescue
 * Local Storage Persistence Manager (100% Offline)
 */

import { GameSaveData, Language, PlayerStage } from './types';

const SAVE_KEY = 'fireland_borneo_save_v1';

export const DEFAULT_SAVE_DATA: GameSaveData = {
  language: 'id',
  soundEnabled: true,
  musicEnabled: true,
  joystickSensitivity: 1.0,
  coins: 150,
  playerStage: 1,
  exp: 0,
  completedMissions: [],
  equipment: {
    tankLevel: 1,    // 100L
    nozzleLevel: 1,  // Normal
    maskLevel: 1,    // Bandana
    suitLevel: 1,    // Standard
  },
  buildings: {
    house: {
      id: 'house',
      level: 1,
      health: 100,
      maxHealth: 100,
      repairCost: 40,
      upgradeCost: 120,
    },
    garden: {
      id: 'garden',
      level: 1,
      health: 100,
      maxHealth: 100,
      repairCost: 30,
      upgradeCost: 100,
    },
    water_tank: {
      id: 'water_tank',
      level: 1,
      health: 100,
      maxHealth: 100,
      repairCost: 50,
      upgradeCost: 150,
    },
    tool_shed: {
      id: 'tool_shed',
      level: 1,
      health: 100,
      maxHealth: 100,
      repairCost: 60,
      upgradeCost: 180,
    },
    rescue_post: {
      id: 'rescue_post',
      level: 1,
      health: 100,
      maxHealth: 100,
      repairCost: 75,
      upgradeCost: 220,
    },
    wildlife_habitat: {
      id: 'wildlife_habitat',
      level: 1,
      health: 100,
      maxHealth: 100,
      repairCost: 80,
      upgradeCost: 250,
    },
  },
  wildlifeRescued: {
    orangutan: 0,
    bekantan: 0,
    beruang_madu: 0,
    macan_dahan: 0,
    rangkong: 0,
  },
  lastSavedAt: Date.now(),
};

export class SaveManager {
  public static load(): GameSaveData {
    if (typeof window === 'undefined') return DEFAULT_SAVE_DATA;
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return { ...DEFAULT_SAVE_DATA };
      const parsed = JSON.parse(raw);
      // Merge with defaults in case schema evolved
      return {
        ...DEFAULT_SAVE_DATA,
        ...parsed,
        equipment: { ...DEFAULT_SAVE_DATA.equipment, ...(parsed.equipment || {}) },
        buildings: { ...DEFAULT_SAVE_DATA.buildings, ...(parsed.buildings || {}) },
        wildlifeRescued: { ...DEFAULT_SAVE_DATA.wildlifeRescued, ...(parsed.wildlifeRescued || {}) },
      };
    } catch {
      return { ...DEFAULT_SAVE_DATA };
    }
  }

  public static save(data: GameSaveData): void {
    if (typeof window === 'undefined') return;
    try {
      const toSave = { ...data, lastSavedAt: Date.now() };
      localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
    } catch {
      // Storage full or private mode fallback
    }
  }

  public static hasSave(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(SAVE_KEY);
  }

  public static reset(): GameSaveData {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SAVE_KEY);
    }
    return { ...DEFAULT_SAVE_DATA, lastSavedAt: Date.now() };
  }
}
