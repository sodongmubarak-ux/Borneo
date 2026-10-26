/**
 * Fireland: Borneo Forest Rescue
 * High Performance 60FPS 2D Canvas Game Engine
 */

import { Sound } from './audio';
import {
  FireEntity,
  ParticleEntity,
  PlayerStage,
  RescuableAnimalEntity,
  TreeObstacle,
  Vector2D,
  WaterSourceEntity,
  WildlifeSpecies,
  WorldBuildingEntity,
} from './types';

export interface GameEngineCallbacks {
  onFireExtinguished: (count: number, coinsEarned: number) => void;
  onAnimalRescued: (species: WildlifeSpecies['id']) => void;
  onMissionAccomplished: () => void;
  onMissionFailed: () => void;
  onWaterChanged: (current: number, max: number) => void;
  onStaminaChanged: (current: number, max: number) => void;
  onSmokeHazeChanged: (density: number) => void;
  onPlayerHealthChanged: (health: number) => void;
  onNearBuilding: (buildingId: string | null) => void;
  onNearWater: (isNear: boolean) => void;
  onNearFire: (isNear: boolean) => void;
  onNearAnimal: (animal: RescuableAnimalEntity | null) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameEngineCallbacks;

  // Environment mode
  public environment: 'base' | 'outskirts' | 'peat_swamp' | 'sanctuary_hills' = 'base';

  // World size
  public readonly worldWidth = 2400;
  public readonly worldHeight = 2400;

  // Camera
  public camera: Vector2D = { x: 400, y: 400 };
  public zoom: number = 1.0;

  // Player State
  public player = {
    x: 600,
    y: 600,
    vx: 0,
    vy: 0,
    speed: 180, // pixels per sec
    angle: 0,
    water: 100,
    maxWater: 100,
    stamina: 100,
    maxStamina: 100,
    smokeExposure: 0,
    health: 100,
    maxHealth: 100,
    isSpraying: false,
    isSprinting: false,
    isRefilling: false,
    animFrame: 0,
    walkTimer: 0,
  };

  // Upgrades
  public equipment = {
    tankLevel: 1,
    nozzleLevel: 1,
    maskLevel: 1,
    suitLevel: 1,
  };

  // Joystick Input
  public joystickVector: Vector2D = { x: 0, y: 0 };
  public keyInput = {
    up: false,
    down: false,
    left: false,
    right: false,
    spray: false,
    sprint: false,
  };

  // Entities
  public fires: FireEntity[] = [];
  public animals: RescuableAnimalEntity[] = [];
  public waterSources: WaterSourceEntity[] = [];
  public buildings: WorldBuildingEntity[] = [];
  public trees: TreeObstacle[] = [];
  public particles: ParticleEntity[] = [];

  // Mission Tracking
  public initialFireCount: number = 0;
  public extinguishedCount: number = 0;
  public rescuedCount: number = 0;
  public targetFires: number = 0;
  public targetAnimals: number = 0;
  public isGameOver: boolean = false;

  // Loop control
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private animId: number = 0;

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Could not get 2D canvas context');
    this.ctx = ctx;
    this.callbacks = callbacks;
  }

  public init(
    environment: 'base' | 'outskirts' | 'peat_swamp' | 'sanctuary_hills',
    equipment: { tankLevel: number; nozzleLevel: number; maskLevel: number; suitLevel: number }
  ) {
    this.environment = environment;
    this.equipment = equipment;
    this.isGameOver = false;
    this.extinguishedCount = 0;
    this.rescuedCount = 0;

    // Apply equipment stats
    const waterCapacities = [100, 250, 450, 750];
    this.player.maxWater = waterCapacities[Math.min(equipment.tankLevel - 1, 3)];
    this.player.water = this.player.maxWater;
    this.player.stamina = 100;
    this.player.smokeExposure = 0;
    this.player.health = 100;

    // Reset entities
    this.fires = [];
    this.animals = [];
    this.waterSources = [];
    this.buildings = [];
    this.trees = [];
    this.particles = [];

    this.setupWorld(environment);

    // Initial camera placement
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;

    // Trigger initial callbacks
    this.callbacks.onWaterChanged(this.player.water, this.player.maxWater);
    this.callbacks.onStaminaChanged(this.player.stamina, this.player.maxStamina);
    this.callbacks.onSmokeHazeChanged(this.player.smokeExposure);
    this.callbacks.onPlayerHealthChanged(this.player.health);
  }

  private setupWorld(env: 'base' | 'outskirts' | 'peat_swamp' | 'sanctuary_hills') {
    if (env === 'base') {
      // Basecamp Layout
      this.player.x = 600;
      this.player.y = 650;

      // Buildings
      this.buildings = [
        { id: 'house', name: { id: 'Rumah Tinggal', en: 'Ranger House' }, x: 500, y: 400, width: 140, height: 110 },
        { id: 'garden', name: { id: 'Kebun Buah', en: 'Fruit Grove' }, x: 800, y: 380, width: 150, height: 130 },
        { id: 'water_tank', name: { id: 'Tangki Air Markas', en: 'Central Water Tank' }, x: 320, y: 550, width: 100, height: 90 },
        { id: 'tool_shed', name: { id: 'Gudang Alat', en: 'Tool Shed' }, x: 820, y: 650, width: 120, height: 100 },
        { id: 'rescue_post', name: { id: 'Pos Satwa', en: 'Rescue Clinic' }, x: 340, y: 800, width: 130, height: 100 },
        { id: 'wildlife_habitat', name: { id: 'Suaka Borneo', en: 'Wildlife Sanctuary' }, x: 620, y: 920, width: 220, height: 160 },
      ];

      // Water source at the tank
      this.waterSources = [
        { id: 'base_tank', name: { id: 'Keran Tangki Air', en: 'Tank Tap' }, x: 370, y: 595, radius: 90, type: 'tank' },
        { id: 'base_creek', name: { id: 'Sungai Markas', en: 'Basecamp Creek' }, x: 1200, y: 700, radius: 150, type: 'river' },
      ];

      // Basecamp peaceful flora
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * 1800 + 100;
        const y = Math.random() * 1800 + 100;
        // Don't spawn on top of buildings
        const nearBuilding = this.buildings.some(b => Math.hypot(b.x - x, b.y - y) < 140);
        if (!nearBuilding) {
          this.trees.push({
            x,
            y,
            type: Math.random() > 0.5 ? 'palm' : 'dipterocarp',
            radius: 28,
            health: 100,
            isOnFire: false,
          });
        }
      }

      this.initialFireCount = 0;
      this.targetFires = 0;
      this.targetAnimals = 0;

    } else if (env === 'outskirts') {
      // Mission 1: Outskirts
      this.player.x = 400;
      this.player.y = 800;

      // Water canal
      this.waterSources = [
        { id: 'village_river', name: { id: 'Sungai Desa', en: 'Village River' }, x: 250, y: 800, radius: 130, type: 'river' },
        { id: 'farm_well', name: { id: 'Sumur Kebun', en: 'Farm Well' }, x: 950, y: 500, radius: 80, type: 'tank' },
      ];

      // Threatened buildings
      this.buildings = [
        { id: 'house', name: { id: 'Rumah Petani 1', en: 'Farm Cottage 1' }, x: 650, y: 600, width: 120, height: 90 },
        { id: 'garden', name: { id: 'Gudang Panen', en: 'Harvest Granary' }, x: 900, y: 750, width: 110, height: 90 },
      ];

      // Trees
      for (let i = 0; i < 60; i++) {
        this.trees.push({
          x: Math.random() * 1600 + 200,
          y: Math.random() * 1600 + 200,
          type: Math.random() > 0.4 ? 'palm' : 'fern',
          radius: 26,
          health: 100,
          isOnFire: false,
        });
      }

      // 6 Fires spreading near the cottage and trees
      const firePositions = [
        { x: 800, y: 600 },
        { x: 840, y: 680 },
        { x: 1050, y: 750 },
        { x: 1100, y: 850 },
        { x: 750, y: 900 },
        { x: 920, y: 980 },
      ];

      this.fires = firePositions.map((pos, idx) => ({
        id: `fire_outskirt_${idx}`,
        x: pos.x,
        y: pos.y,
        intensity: 85,
        maxIntensity: 100,
        isPeat: false,
        spreadTimer: 0,
        radius: 35,
      }));

      this.initialFireCount = this.fires.length;
      this.targetFires = 6;
      this.targetAnimals = 0;

    } else if (env === 'peat_swamp') {
      // Mission 2: Peat Swamp Forest
      this.player.x = 350;
      this.player.y = 950;

      // Swamp canals
      this.waterSources = [
        { id: 'swamp_canal_1', name: { id: 'Kanal Gambut Primer', en: 'Primary Peat Canal' }, x: 350, y: 800, radius: 140, type: 'swamp_canal' },
        { id: 'swamp_canal_2', name: { id: 'Aliran Rawa Barito', en: 'Barito Swamp Creek' }, x: 1100, y: 1200, radius: 120, type: 'swamp_canal' },
      ];

      // Swamp deadwood & ferns
      for (let i = 0; i < 80; i++) {
        this.trees.push({
          x: Math.random() * 1800 + 200,
          y: Math.random() * 1800 + 200,
          type: Math.random() > 0.5 ? 'burned_stump' : 'fern',
          radius: 24,
          health: 100,
          isOnFire: false,
        });
      }

      // 10 Stubborn Peat Hotspots
      const peatPositions = [
        { x: 600, y: 850 },
        { x: 720, y: 820 },
        { x: 850, y: 900 },
        { x: 920, y: 780 },
        { x: 1040, y: 860 },
        { x: 1180, y: 950 },
        { x: 800, y: 1100 },
        { x: 950, y: 1150 },
        { x: 1100, y: 1080 },
        { x: 1250, y: 1120 },
      ];

      this.fires = peatPositions.map((pos, idx) => ({
        id: `fire_peat_${idx}`,
        x: pos.x,
        y: pos.y,
        intensity: 95,
        maxIntensity: 100,
        isPeat: true,
        spreadTimer: 0,
        radius: 38,
      }));

      this.initialFireCount = this.fires.length;
      this.targetFires = 10;
      this.targetAnimals = 0;

    } else if (env === 'sanctuary_hills') {
      // Mission 3: Bukit Raya Sanctuary Rescue
      this.player.x = 400;
      this.player.y = 600;

      // Mountain river & helipad
      this.waterSources = [
        { id: 'sanctuary_river', name: { id: 'Sungai Bukit Raya', en: 'Bukit Raya River' }, x: 380, y: 500, radius: 150, type: 'river' },
        { id: 'waterfall_pool', name: { id: 'Kolam Air Terjun', en: 'Waterfall Basin' }, x: 1400, y: 400, radius: 140, type: 'river' },
      ];

      // Trees
      for (let i = 0; i < 90; i++) {
        this.trees.push({
          x: Math.random() * 2000 + 200,
          y: Math.random() * 2000 + 200,
          type: 'dipterocarp',
          radius: 30,
          health: 100,
          isOnFire: false,
        });
      }

      // 3 Endangered Animals Trapped by Wildfires
      this.animals = [
        {
          id: 'rescue_orangutan',
          species: 'orangutan',
          name: 'Ibu Mimin & Bayi (Orangutan)',
          x: 950,
          y: 750,
          isTrapped: true,
          isRescued: false,
          health: 100,
          cryTimer: 0,
        },
        {
          id: 'rescue_bekantan',
          species: 'bekantan',
          name: 'Gaston (Bekantan)',
          x: 1250,
          y: 900,
          isTrapped: true,
          isRescued: false,
          health: 100,
          cryTimer: 0,
        },
        {
          id: 'rescue_beruang',
          species: 'beruang_madu',
          name: 'Koko (Beruang Madu)',
          x: 820,
          y: 1150,
          isTrapped: true,
          isRescued: false,
          health: 100,
          cryTimer: 0,
        },
      ];

      // 12 Fires forming ring hazards around the animals
      const ringPositions = [
        // Ring around Orangutan
        { x: 900, y: 720 },
        { x: 1000, y: 720 },
        { x: 920, y: 820 },
        { x: 1020, y: 810 },
        // Ring around Bekantan
        { x: 1200, y: 860 },
        { x: 1300, y: 870 },
        { x: 1220, y: 960 },
        { x: 1310, y: 950 },
        // Ring around Sun Bear
        { x: 770, y: 1100 },
        { x: 870, y: 1100 },
        { x: 790, y: 1200 },
        { x: 890, y: 1210 },
      ];

      this.fires = ringPositions.map((pos, idx) => ({
        id: `fire_sanctuary_${idx}`,
        x: pos.x,
        y: pos.y,
        intensity: 90,
        maxIntensity: 100,
        isPeat: false,
        spreadTimer: 0,
        radius: 36,
      }));

      this.initialFireCount = this.fires.length;
      this.targetFires = 12;
      this.targetAnimals = 3;
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    this.animId = requestAnimationFrame(this.loop);
  }

  public stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = 0;
    }
    Sound.stopWaterSpray();
  }

  private loop(currentTime: number) {
    if (!this.isRunning) return;

    const rawDt = (currentTime - this.lastTime) / 1000;
    const dt = Math.min(rawDt, 0.05); // clamp delta time for stability
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    this.animId = requestAnimationFrame(this.loop);
  }

  private update(dt: number) {
    if (this.isGameOver) return;

    // Movement direction: combine touch joystick and keyboard WASD
    let dx = this.joystickVector.x;
    let dy = this.joystickVector.y;

    if (this.keyInput.left) dx -= 1;
    if (this.keyInput.right) dx += 1;
    if (this.keyInput.up) dy -= 1;
    if (this.keyInput.down) dy += 1;

    // Normalize diagonal
    const mag = Math.hypot(dx, dy);
    if (mag > 1) {
      dx /= mag;
      dy /= mag;
    }

    const isMoving = mag > 0.08;

    // Sprint handling
    const isSprintingRequested = this.player.isSprinting || this.keyInput.sprint;
    const canSprint = isSprintingRequested && this.player.stamina > 2 && isMoving;

    let currentSpeed = this.player.speed;
    if (canSprint) {
      currentSpeed *= 1.6;
      this.player.stamina = Math.max(0, this.player.stamina - dt * 22);
      this.callbacks.onStaminaChanged(this.player.stamina, this.player.maxStamina);
    } else {
      // Recover stamina
      if (this.player.stamina < this.player.maxStamina) {
        this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + dt * 16);
        this.callbacks.onStaminaChanged(this.player.stamina, this.player.maxStamina);
      }
    }

    // Apply movement
    if (isMoving) {
      this.player.vx = dx * currentSpeed;
      this.player.vy = dy * currentSpeed;
      this.player.x += this.player.vx * dt;
      this.player.y += this.player.vy * dt;

      // Update angle
      this.player.angle = Math.atan2(dy, dx);

      // Walk cycle animation
      this.player.walkTimer += dt * (canSprint ? 14 : 9);
      this.player.animFrame = Math.floor(this.player.walkTimer) % 4;
    } else {
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.animFrame = 0;
    }

    // World clamp
    this.player.x = Math.max(40, Math.min(this.worldWidth - 40, this.player.x));
    this.player.y = Math.max(40, Math.min(this.worldHeight - 40, this.player.y));

    // Smooth camera follow
    const camTargetX = this.player.x;
    const camTargetY = this.player.y;
    this.camera.x += (camTargetX - this.camera.x) * 0.08;
    this.camera.y += (camTargetY - this.camera.y) * 0.08;

    // Check near water sources
    let nearWaterSource = false;
    for (const src of this.waterSources) {
      const dist = Math.hypot(this.player.x - src.x, this.player.y - src.y);
      if (dist < src.radius) {
        nearWaterSource = true;
        // If player is holding refill or pressing refill
        if (this.player.isRefilling) {
          if (this.player.water < this.player.maxWater) {
            this.player.water = Math.min(this.player.maxWater, this.player.water + dt * 65);
            this.callbacks.onWaterChanged(this.player.water, this.player.maxWater);
            Sound.playRefillWater();
            // Emit water refill sparkles
            this.emitParticles(this.player.x, this.player.y, 2, 'water');
          }
        }
        break;
      }
    }
    this.callbacks.onNearWater(nearWaterSource);

    // Check near buildings
    let nearBuildingId: string | null = null;
    for (const b of this.buildings) {
      const bx = b.x + b.width / 2;
      const by = b.y + b.height / 2;
      const dist = Math.hypot(this.player.x - bx, this.player.y - by);
      if (dist < Math.max(b.width, b.height) * 0.75) {
        nearBuildingId = b.id;
        break;
      }
    }
    this.callbacks.onNearBuilding(nearBuildingId);

    // Water spraying logic
    const isSprayingRequested = this.player.isSpraying || this.keyInput.spray;
    if (isSprayingRequested && this.player.water > 0) {
      Sound.startWaterSpray();
      // Deplete water
      const nozzleEfficiency = [1.0, 1.25, 1.5, 1.8][Math.min(this.equipment.nozzleLevel - 1, 3)];
      const waterDrainRate = 18 / nozzleEfficiency;
      this.player.water = Math.max(0, this.player.water - dt * waterDrainRate);
      this.callbacks.onWaterChanged(this.player.water, this.player.maxWater);

      // Spawn water stream particles
      const sprayRange = 110 + this.equipment.nozzleLevel * 25;
      const sprayAngle = this.player.angle;
      const nozzleX = this.player.x + Math.cos(sprayAngle) * 20;
      const nozzleY = this.player.y + Math.sin(sprayAngle) * 20;

      for (let i = 0; i < 3; i++) {
        const spread = (Math.random() - 0.5) * 0.35;
        const speed = Math.random() * (sprayRange * 2) + 200;
        this.particles.push({
          x: nozzleX,
          y: nozzleY,
          vx: Math.cos(sprayAngle + spread) * speed,
          vy: Math.sin(sprayAngle + spread) * speed,
          life: 0.35,
          maxLife: 0.35,
          color: '#38bdf8',
          size: Math.random() * 4 + 3,
          type: 'water',
        });
      }

      // Check collision between water stream and active fires
      const nozzleReachX = this.player.x + Math.cos(sprayAngle) * (sprayRange * 0.7);
      const nozzleReachY = this.player.y + Math.sin(sprayAngle) * (sprayRange * 0.7);

      for (const fire of this.fires) {
        const distToJet = Math.hypot(fire.x - nozzleReachX, fire.y - nozzleReachY);
        const distToPlayer = Math.hypot(fire.x - this.player.x, fire.y - this.player.y);

        if (distToJet < fire.radius + 40 && distToPlayer < sprayRange + 30) {
          // Water hits fire!
          const power = (40 + this.equipment.nozzleLevel * 20) * (fire.isPeat ? 0.65 : 1.0);
          fire.intensity -= dt * power;

          // Emit steam particles
          if (Math.random() < 0.6) {
            this.emitParticles(fire.x, fire.y, 2, 'steam');
          }

          if (fire.intensity <= 0) {
            Sound.playFireExtinguishPuff();
            Sound.playCoin();
            this.extinguishedCount++;
            this.callbacks.onFireExtinguished(this.extinguishedCount, 25);
            this.emitParticles(fire.x, fire.y, 16, 'sparkle');
          }
        }
      }
    } else {
      Sound.stopWaterSpray();
    }

    // Filter out extinguished fires
    this.fires = this.fires.filter(f => f.intensity > 0);

    // Fire ambient sounds & proximity warning
    let closestFireDist = 9999;
    for (const f of this.fires) {
      const dist = Math.hypot(this.player.x - f.x, this.player.y - f.y);
      if (dist < closestFireDist) {
        closestFireDist = dist;
      }

      // Slowly emit smoke and ember particles
      if (Math.random() < 0.3) {
        this.particles.push({
          x: f.x + (Math.random() - 0.5) * f.radius,
          y: f.y + (Math.random() - 0.5) * f.radius,
          vx: (Math.random() - 0.5) * 20,
          vy: -Math.random() * 40 - 20,
          life: 0.8,
          maxLife: 0.8,
          color: Math.random() > 0.5 ? '#f97316' : '#ef4444',
          size: Math.random() * 5 + 3,
          type: 'fire',
        });
      }

      // Natural slow fire spread simulation (gentle & balanced)
      f.spreadTimer += dt;
      if (f.spreadTimer > 18 && this.fires.length < 20) {
        f.spreadTimer = 0;
        // Chance to create a nearby small flame
        const angle = Math.random() * Math.PI * 2;
        const spreadDist = f.radius + 35;
        this.fires.push({
          id: `spread_${Date.now()}_${Math.random()}`,
          x: f.x + Math.cos(angle) * spreadDist,
          y: f.y + Math.sin(angle) * spreadDist,
          intensity: 40,
          maxIntensity: 100,
          isPeat: f.isPeat,
          spreadTimer: 0,
          radius: 30,
        });
      }
    }

    this.callbacks.onNearFire(closestFireDist < 160);

    // Smoke hazard simulation
    if (closestFireDist < 200) {
      // Accumulate smoke
      const maskReduction = [0.2, 0.45, 0.7, 0.95][Math.min(this.equipment.maskLevel - 1, 3)];
      const smokeRate = (1 - maskReduction) * 18;
      this.player.smokeExposure = Math.min(100, this.player.smokeExposure + dt * smokeRate);
    } else {
      // Recover smoke exposure
      this.player.smokeExposure = Math.max(0, this.player.smokeExposure - dt * 25);
    }
    this.callbacks.onSmokeHazeChanged(this.player.smokeExposure);

    // Check Rescuable Animals
    let nearAnimal: RescuableAnimalEntity | null = null;
    for (const a of this.animals) {
      if (a.isRescued) continue;

      const dist = Math.hypot(this.player.x - a.x, this.player.y - a.y);
      if (dist < 80) {
        nearAnimal = a;
      }

      // Check if fire too close to animal
      for (const f of this.fires) {
        const fireDist = Math.hypot(a.x - f.x, a.y - f.y);
        if (fireDist < f.radius + 30) {
          a.health = Math.max(0, a.health - dt * 5);
        }
      }
    }
    this.callbacks.onNearAnimal(nearAnimal);

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Check Victory Condition
    if (this.environment !== 'base') {
      const firesCleared = this.fires.length === 0 || this.extinguishedCount >= this.targetFires;
      const animalsCleared = this.targetAnimals === 0 || this.rescuedCount >= this.targetAnimals;

      if (firesCleared && animalsCleared) {
        this.isGameOver = true;
        Sound.stopWaterSpray();
        Sound.playVictoryFanfare();
        this.callbacks.onMissionAccomplished();
      }
    }
  }

  public rescueAnimal(animalId: string): boolean {
    const animal = this.animals.find(a => a.id === animalId && !a.isRescued);
    if (!animal) return false;

    // Check if perimeter fire is cleared
    const perimeterFire = this.fires.some(f => Math.hypot(f.x - animal.x, f.y - animal.y) < 110);
    if (perimeterFire) {
      return false; // Still surrounded by fire
    }

    animal.isRescued = true;
    this.rescuedCount++;
    Sound.playAnimalRescue();
    this.emitParticles(animal.x, animal.y, 20, 'heart');
    this.callbacks.onAnimalRescued(animal.species);
    return true;
  }

  private emitParticles(x: number, y: number, count: number, type: ParticleEntity['type']) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 80 + 20;
      let color = '#38bdf8';
      let size = 4;
      if (type === 'fire') color = '#ef4444';
      if (type === 'smoke') color = '#64748b';
      if (type === 'steam') { color = '#f1f5f9'; size = 6; }
      if (type === 'sparkle') { color = '#facc15'; size = 5; }
      if (type === 'heart') { color = '#ec4899'; size = 8; }

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.6,
        maxLife: 0.6,
        color,
        size,
        type,
      });
    }
  }

  private render() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Clear background
    ctx.fillStyle = this.environment === 'peat_swamp' ? '#1c1917' : '#064e3b';
    ctx.fillRect(0, 0, w, h);

    // Save camera context
    ctx.save();
    // Center camera on screen
    ctx.translate(w / 2, h / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.camera.x, -this.camera.y);

    // Render Terrain Ground Grid
    this.renderTerrain();

    // Render Water Sources
    this.renderWaterSources();

    // Render Buildings
    this.renderBuildings();

    // Render Trees
    this.renderTrees();

    // Render Rescuable Animals
    this.renderAnimals();

    // Render Fires
    this.renderFires();

    // Render Particles (water drops, steam, embers)
    this.renderParticles();

    // Render Player Character
    this.renderPlayer();

    ctx.restore();

    // Screen-space smoke haze vignette
    if (this.player.smokeExposure > 10) {
      const alpha = (this.player.smokeExposure / 100) * 0.45;
      ctx.fillStyle = `rgba(60, 45, 30, ${alpha})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  private renderTerrain() {
    const { ctx } = this;
    const tileSize = 80;
    const startX = Math.max(0, Math.floor((this.camera.x - this.canvas.width / 2) / tileSize) * tileSize);
    const endX = Math.min(this.worldWidth, Math.ceil((this.camera.x + this.canvas.width / 2) / tileSize) * tileSize);
    const startY = Math.max(0, Math.floor((this.camera.y - this.canvas.height / 2) / tileSize) * tileSize);
    const endY = Math.min(this.worldHeight, Math.ceil((this.camera.y + this.canvas.height / 2) / tileSize) * tileSize);

    ctx.lineWidth = 1;
    for (let x = startX; x <= endX; x += tileSize) {
      for (let y = startY; y <= endY; y += tileSize) {
        if (this.environment === 'peat_swamp') {
          ctx.fillStyle = (x + y) % (tileSize * 2) === 0 ? '#292524' : '#1c1917';
        } else {
          ctx.fillStyle = (x + y) % (tileSize * 2) === 0 ? '#065f46' : '#047857';
        }
        ctx.fillRect(x, y, tileSize, tileSize);
      }
    }

    // World boundary border
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, this.worldWidth, this.worldHeight);
  }

  private renderWaterSources() {
    const { ctx } = this;
    for (const src of this.waterSources) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(src.x, src.y, src.radius, 0, Math.PI * 2);

      if (src.type === 'river') {
        const grad = ctx.createRadialGradient(src.x, src.y, 10, src.x, src.y, src.radius);
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(1, '#0284c7');
        ctx.fillStyle = grad;
      } else if (src.type === 'swamp_canal') {
        ctx.fillStyle = '#0f766e';
      } else {
        ctx.fillStyle = '#0284c7';
      }
      ctx.fill();

      // Ripple ring
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💧 ' + (src.name.id || 'Air'), src.x, src.y + 5);

      ctx.restore();
    }
  }

  private renderBuildings() {
    const { ctx } = this;
    for (const b of this.buildings) {
      ctx.save();
      // Drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(b.x + 8, b.y + 8, b.width, b.height);

      // Building Base / Wall
      ctx.fillStyle = b.id === 'house' ? '#78350f' : b.id === 'water_tank' ? '#0369a1' : '#14532d';
      ctx.fillRect(b.x, b.y, b.width, b.height);

      // Roof / Accent
      ctx.fillStyle = b.id === 'house' ? '#b45309' : b.id === 'water_tank' ? '#0284c7' : '#166534';
      ctx.fillRect(b.x + 4, b.y + 4, b.width - 8, b.height * 0.4);

      // Door / Portal
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(b.x + b.width / 2 - 12, b.y + b.height - 24, 24, 24);

      // Border
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x, b.y, b.width, b.height);

      // Building label
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.name.id || b.id, b.x + b.width / 2, b.y - 8);

      ctx.restore();
    }
  }

  private renderTrees() {
    const { ctx } = this;
    for (const t of this.trees) {
      ctx.save();
      // Tree trunk shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(t.x + 4, t.y + 6, t.radius * 0.9, t.radius * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tree foliage
      if (t.type === 'palm') {
        // Tropical Palm / Coconut Tree
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(t.x, t.y, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#15803d';
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          ctx.beginPath();
          ctx.ellipse(t.x + Math.cos(a) * 18, t.y + Math.sin(a) * 18, 14, 6, a, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (t.type === 'burned_stump') {
        // Burned peat stump
        ctx.fillStyle = '#262626';
        ctx.beginPath();
        ctx.arc(t.x, t.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(t.x - 3, t.y - 3, 6, 6);
      } else {
        // Big Dipterocarp rainforest tree canopy
        ctx.fillStyle = '#047857';
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(t.x - 4, t.y - 4, t.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderAnimals() {
    const { ctx } = this;
    for (const a of this.animals) {
      if (a.isRescued) continue;

      ctx.save();
      // Animal distress indicator / circle
      ctx.fillStyle = 'rgba(234, 88, 12, 0.3)';
      ctx.beginPath();
      ctx.arc(a.x, a.y, 32, 0, Math.PI * 2);
      ctx.fill();

      // Animal body
      if (a.species === 'orangutan') {
        // Orangutan orange fur
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(a.x, a.y, 18, 0, Math.PI * 2);
        ctx.fill();
        // Arms
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(a.x - 14, a.y - 6, 8, 0, Math.PI * 2);
        ctx.arc(a.x + 14, a.y - 6, 8, 0, Math.PI * 2);
        ctx.fill();
        // Face
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(a.x, a.y - 2, 7, 0, Math.PI * 2);
        ctx.fill();
      } else if (a.species === 'bekantan') {
        // Bekantan proboscis nose
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(a.x, a.y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fdba74';
        ctx.fillRect(a.x - 3, a.y + 4, 6, 10);
      } else {
        // Sun Bear black & golden chest
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.arc(a.x, a.y, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(a.x, a.y + 4, 7, 0, Math.PI);
        ctx.fill();
      }

      // Name & Status
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(a.name, a.x, a.y - 24);

      // Health bar
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(a.x - 20, a.y - 18, 40, 5);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(a.x - 20, a.y - 18, (a.health / 100) * 40, 5);

      ctx.restore();
    }
  }

  private renderFires() {
    const { ctx } = this;
    const time = performance.now() * 0.006;

    for (const f of this.fires) {
      ctx.save();
      // Ground scorch mark
      ctx.fillStyle = 'rgba(20, 10, 5, 0.6)';
      ctx.beginPath();
      ctx.ellipse(f.x, f.y + 8, f.radius * 1.1, f.radius * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer flame glow
      const flicker = Math.sin(time + f.x) * 4;
      const grad = ctx.createRadialGradient(f.x, f.y, 4, f.x, f.y, f.radius + flicker);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.3, '#f97316');
      grad.addColorStop(0.8, '#dc2626');
      grad.addColorStop(1, 'rgba(185, 28, 28, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(f.x, f.y - 6, f.radius + flicker, 0, Math.PI * 2);
      ctx.fill();

      // Inner intense core
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(f.x, f.y, (f.radius * 0.35) * (f.intensity / 100), 0, Math.PI * 2);
      ctx.fill();

      // Fire HP gauge
      const barW = 34;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(f.x - barW / 2, f.y - f.radius - 12, barW, 5);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(f.x - barW / 2, f.y - f.radius - 12, (f.intensity / f.maxIntensity) * barW, 5);

      ctx.restore();
    }
  }

  private renderParticles() {
    const { ctx } = this;
    for (const p of this.particles) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / p.maxLife;

      if (p.type === 'heart') {
        ctx.font = '16px sans-serif';
        ctx.fillText('💚', p.x, p.y);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderPlayer() {
    const { ctx, player } = this;
    ctx.save();
    ctx.translate(player.x, player.y);

    // Player ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rotate body towards facing direction
    ctx.rotate(player.angle);

    // Legs animation
    const legOffset = Math.sin(player.animFrame * Math.PI) * 6;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-10, -4 + legOffset, 7, 14);
    ctx.fillRect(3, -4 - legOffset, 7, 14);

    // Torso / Suit (changes color based on suit level)
    const suitColors = ['#059669', '#ea580c', '#e11d48', '#facc15'];
    ctx.fillStyle = suitColors[Math.min(this.equipment.suitLevel - 1, 3)];
    ctx.beginPath();
    ctx.roundRect(-12, -12, 24, 24, [6]);
    ctx.fill();

    // Backpack Water Tank on player's back
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(-18, -8, 8, 16, [3]);
    ctx.fill();
    // Water level meter on tank
    ctx.fillStyle = '#38bdf8';
    const tankFillRatio = player.water / player.maxWater;
    ctx.fillRect(-17, 6 - 12 * tankFillRatio, 6, 12 * tankFillRatio);

    // Hands & Spray Nozzle
    ctx.fillStyle = '#fde047';
    ctx.fillRect(8, -6, 14, 5); // water hose
    ctx.fillStyle = '#64748b';
    ctx.fillRect(20, -7, 6, 7); // nozzle tip

    // Head & Helmet
    ctx.fillStyle = '#fed7aa'; // face
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();

    // Firefighter Helmet
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(-2, 0, 9, Math.PI * 0.5, Math.PI * 1.5);
    ctx.fill();

    // Mask representation (if upgraded)
    if (this.equipment.maskLevel > 1) {
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(2, -4, 6, 8);
    }

    ctx.restore();
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}
