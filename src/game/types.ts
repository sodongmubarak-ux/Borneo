/**
 * Fireland: Borneo Forest Rescue
 * Core Game Types and Interfaces
 */

export type Language = 'id' | 'en';

export type PlayerStage = 1 | 2 | 3 | 4 | 5;

export interface EquipmentLevels {
  tankLevel: number;       // 1: 100L, 2: 250L, 3: 450L, 4: 750L
  nozzleLevel: number;     // 1: Standar, 2: Tekanan Tinggi, 3: Vortex Dual, 4: Hydro Canon
  maskLevel: number;       // 1: Kain, 2: Masker N95, 3: Respirator Ganda, 4: SCBA Damkar
  suitLevel: number;       // 1: Baju Biasa, 2: Jaket Relawan, 3: Wearpack Tahan Panas, 4: Baju Damkar Nomex
}

export interface BuildingState {
  id: 'house' | 'garden' | 'water_tank' | 'tool_shed' | 'rescue_post' | 'wildlife_habitat';
  level: number;
  health: number; // 0 - 100
  maxHealth: number;
  repairCost: number;
  upgradeCost: number;
}

export interface WildlifeSpecies {
  id: 'orangutan' | 'bekantan' | 'beruang_madu' | 'macan_dahan' | 'rangkong';
  name: string;
  scientificName: string;
  conservationStatus: string;
  rescuedCount: number;
  targetCount: number;
  description: Record<Language, string>;
  habitatLore: Record<Language, string>;
  icon: string;
  color: string;
}

export interface MissionObjective {
  id: string;
  description: Record<Language, string>;
  current: number;
  target: number;
  isComplete: boolean;
}

export interface MissionDef {
  id: string;
  name: Record<Language, string>;
  subtitle: Record<Language, string>;
  description: Record<Language, string>;
  environment: 'base' | 'outskirts' | 'peat_swamp' | 'sanctuary_hills';
  requiredStage: PlayerStage;
  rewardCoins: number;
  rewardExp: number;
  difficulty: 1 | 2 | 3;
  hazards: ('peat' | 'heavy_smoke' | 'wind_spread')[];
  objectives: {
    extinguishFires: number;
    rescueAnimals?: { species: WildlifeSpecies['id']; count: number };
    protectBuildings?: number;
  };
}

export interface GameSaveData {
  language: Language;
  soundEnabled: boolean;
  musicEnabled: boolean;
  joystickSensitivity: number; // 0.5 - 2.0
  coins: number;
  playerStage: PlayerStage;
  exp: number;
  completedMissions: string[];
  equipment: EquipmentLevels;
  buildings: Record<BuildingState['id'], BuildingState>;
  wildlifeRescued: Record<WildlifeSpecies['id'], number>;
  lastSavedAt: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface FireEntity {
  id: string;
  x: number;
  y: number;
  intensity: number; // 0 - 100
  maxIntensity: number;
  isPeat: boolean; // burns deeper, takes more water
  spreadTimer: number;
  radius: number;
}

export interface RescuableAnimalEntity {
  id: string;
  species: WildlifeSpecies['id'];
  name: string;
  x: number;
  y: number;
  isTrapped: boolean;
  isRescued: boolean;
  health: number; // decreases if fire too close
  cryTimer: number;
}

export interface WaterSourceEntity {
  id: string;
  name: Record<Language, string>;
  x: number;
  y: number;
  radius: number;
  type: 'river' | 'tank' | 'hydrant' | 'swamp_canal';
}

export interface WorldBuildingEntity {
  id: BuildingState['id'];
  name: Record<Language, string>;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ParticleEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'water' | 'smoke' | 'fire' | 'ember' | 'steam' | 'sparkle' | 'heart';
}

export interface TreeObstacle {
  x: number;
  y: number;
  type: 'palm' | 'dipterocarp' | 'fern' | 'burned_stump' | 'house_structure';
  radius: number;
  health: number;
  isOnFire: boolean;
}
