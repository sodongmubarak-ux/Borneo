/**
 * Fireland: Borneo Forest Rescue
 * Interactive Canvas Game View & Playfield
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '../game/engine';
import { BuildingState, GameSaveData, Language, RescuableAnimalEntity, Vector2D } from '../game/types';
import { MISSIONS } from '../game/missions';
import { SaveManager } from '../game/storage';
import { Sound } from '../game/audio';
import { HUD } from './HUD';
import { TouchJoystick } from './TouchJoystick';
import { ActionControls } from './ActionControls';
import { StrategicMapModal } from './StrategicMapModal';
import { BuildingModal } from './BuildingModal';
import { SettingsModal } from './SettingsModal';
import { PauseMenuModal } from './PauseMenuModal';
import { MissionResultModal } from './MissionResultModal';

interface GameViewProps {
  environment: 'base' | 'outskirts' | 'peat_swamp' | 'sanctuary_hills';
  activeMissionId?: string;
  saveData: GameSaveData;
  onUpdateSave: (updater: (prev: GameSaveData) => GameSaveData) => void;
  onReturnToMainMenu: () => void;
  onSwitchEnvironment: (env: 'base' | 'outskirts' | 'peat_swamp' | 'sanctuary_hills', missionId?: string) => void;
}

export const GameView: React.FC<GameViewProps> = ({
  environment,
  activeMissionId,
  saveData,
  onUpdateSave,
  onReturnToMainMenu,
  onSwitchEnvironment,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // HUD & Game Live Stats
  const [water, setWater] = useState(100);
  const [maxWater, setMaxWater] = useState(100);
  const [stamina, setStamina] = useState(100);
  const [maxStamina, setMaxStamina] = useState(100);
  const [smokeExposure, setSmokeExposure] = useState(0);
  const [extinguishedCount, setExtinguishedCount] = useState(0);
  const [targetFires, setTargetFires] = useState(0);
  const [rescuedCount, setRescuedCount] = useState(0);
  const [targetAnimals, setTargetAnimals] = useState(0);

  // Proximity Triggers
  const [nearWater, setNearWater] = useState(false);
  const [nearFire, setNearFire] = useState(false);
  const [nearAnimal, setNearAnimal] = useState<RescuableAnimalEntity | null>(null);
  const [nearBuildingId, setNearBuildingId] = useState<BuildingState['id'] | null>(null);

  // Active Control States
  const [isSpraying, setIsSpraying] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);

  // Modals
  const [showPause, setShowPause] = useState(false);
  const [showStrategicMap, setShowStrategicMap] = useState(false);
  const [showBuildingModal, setShowBuildingModal] = useState<BuildingState['id'] | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [missionResult, setMissionResult] = useState<{ isVictory: boolean } | null>(null);

  const activeMission = MISSIONS.find(m => m.id === activeMissionId);

  // Initialize Game Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions to window size
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (engineRef.current) {
        engineRef.current.resize(window.innerWidth, window.innerHeight);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const engine = new GameEngine(canvas, {
      onFireExtinguished: (count, coinsEarned) => {
        setExtinguishedCount(count);
        onUpdateSave(prev => ({ ...prev, coins: prev.coins + coinsEarned }));
      },
      onAnimalRescued: (species) => {
        setRescuedCount(prev => prev + 1);
        onUpdateSave(prev => ({
          ...prev,
          coins: prev.coins + 150,
          wildlifeRescued: {
            ...prev.wildlifeRescued,
            [species]: (prev.wildlifeRescued[species] || 0) + 1,
          },
        }));
      },
      onMissionAccomplished: () => {
        setMissionResult({ isVictory: true });
      },
      onMissionFailed: () => {
        setMissionResult({ isVictory: false });
      },
      onWaterChanged: (cur, max) => {
        setWater(cur);
        setMaxWater(max);
      },
      onStaminaChanged: (cur, max) => {
        setStamina(cur);
        setMaxStamina(max);
      },
      onSmokeHazeChanged: (density) => {
        setSmokeExposure(density);
      },
      onPlayerHealthChanged: () => {},
      onNearBuilding: (bId) => {
        setNearBuildingId(bId as BuildingState['id'] | null);
      },
      onNearWater: (isNear) => setNearWater(isNear),
      onNearFire: (isNear) => setNearFire(isNear),
      onNearAnimal: (animal) => setNearAnimal(animal),
    });

    engine.init(environment, saveData.equipment);
    setTargetFires(engine.targetFires);
    setTargetAnimals(engine.targetAnimals);

    engine.start();
    engineRef.current = engine;

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.stop();
      engineRef.current = null;
    };
  }, [environment]);

  // Sync equipment upgrades to engine if upgraded while playing
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.equipment = saveData.equipment;
    }
  }, [saveData.equipment]);

  // Keyboard controls for desktop preview & testing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') engineRef.current.keyInput.up = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') engineRef.current.keyInput.down = true;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') engineRef.current.keyInput.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') engineRef.current.keyInput.right = true;
      if (e.key === ' ') {
        engineRef.current.keyInput.spray = true;
        setIsSpraying(true);
      }
      if (e.key === 'Shift') {
        engineRef.current.keyInput.sprint = true;
        setIsSprinting(true);
      }
      if (e.key === 'Escape') {
        setShowPause(p => !p);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') engineRef.current.keyInput.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') engineRef.current.keyInput.down = false;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') engineRef.current.keyInput.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') engineRef.current.keyInput.right = false;
      if (e.key === ' ') {
        engineRef.current.keyInput.spray = false;
        setIsSpraying(false);
        Sound.stopWaterSpray();
      }
      if (e.key === 'Shift') {
        engineRef.current.keyInput.sprint = false;
        setIsSprinting(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Joystick move handler
  const handleJoystickMove = useCallback((vec: Vector2D) => {
    if (engineRef.current) {
      engineRef.current.joystickVector = vec;
    }
  }, []);

  // Actions handlers
  const handleSprayStart = () => {
    setIsSpraying(true);
    if (engineRef.current) engineRef.current.player.isSpraying = true;
  };
  const handleSprayEnd = () => {
    setIsSpraying(false);
    if (engineRef.current) {
      engineRef.current.player.isSpraying = false;
      Sound.stopWaterSpray();
    }
  };

  const handleRefillStart = () => {
    if (engineRef.current) engineRef.current.player.isRefilling = true;
  };
  const handleRefillEnd = () => {
    if (engineRef.current) engineRef.current.player.isRefilling = false;
  };

  const handleSprintStart = () => {
    setIsSprinting(true);
    if (engineRef.current) engineRef.current.player.isSprinting = true;
  };
  const handleSprintEnd = () => {
    setIsSprinting(false);
    if (engineRef.current) engineRef.current.player.isSprinting = false;
  };

  const handleRescueAnimal = () => {
    if (!nearAnimal || !engineRef.current) return;
    const ok = engineRef.current.rescueAnimal(nearAnimal.id);
    if (!ok) {
      alert('Padamkan api di sekeliling satwa terlebih dahulu!');
    }
  };

  // Claim Mission Rewards
  const handleClaimReward = (bonusCoins: number) => {
    const totalBonus = (activeMission?.rewardCoins || 100) + bonusCoins;
    onUpdateSave(prev => {
      const nextCompleted = activeMissionId && !prev.completedMissions.includes(activeMissionId)
        ? [...prev.completedMissions, activeMissionId]
        : prev.completedMissions;

      // Check stage progression:
      // Misi 1 complete -> Stage 2 (Penolong)
      // Misi 2 complete -> Stage 3 (Relawan)
      // Misi 3 complete -> Stage 4 / 5 (Pahlawan Borneo)
      let nextStage = prev.playerStage;
      if (activeMissionId === 'mission_1_outskirts' && nextStage < 2) nextStage = 2;
      if (activeMissionId === 'mission_2_peat_swamp' && nextStage < 3) nextStage = 3;
      if (activeMissionId === 'mission_3_sanctuary' && nextStage < 5) nextStage = 5;

      return {
        ...prev,
        coins: prev.coins + totalBonus,
        playerStage: nextStage,
        completedMissions: nextCompleted,
      };
    });
    setMissionResult(null);
    onSwitchEnvironment('base');
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 select-none touch-none">
      {/* 60FPS 2D Game Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />

      {/* Top HUD Overlay (85% playfield unobstructed) */}
      <div className="absolute top-0 left-0 right-0 p-3 z-20 pointer-events-none">
        <HUD
          language={saveData.language}
          water={water}
          maxWater={maxWater}
          stamina={stamina}
          maxStamina={maxStamina}
          smokeExposure={smokeExposure}
          coins={saveData.coins}
          extinguishedCount={extinguishedCount}
          targetFires={targetFires}
          rescuedCount={rescuedCount}
          targetAnimals={targetAnimals}
          environment={environment}
          onPause={() => setShowPause(true)}
        />
      </div>

      {/* Bottom Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 flex items-end justify-between z-20 pointer-events-none">
        {/* Left Thumb Joystick */}
        <div className="pointer-events-auto">
          <TouchJoystick
            onMove={handleJoystickMove}
            sensitivity={saveData.joystickSensitivity}
          />
        </div>

        {/* Right Thumb Actions Cluster */}
        <div className="pointer-events-auto">
          <ActionControls
            language={saveData.language}
            water={water}
            maxWater={maxWater}
            isSpraying={isSpraying}
            isSprinting={isSprinting}
            nearWater={nearWater}
            nearFire={nearFire}
            nearAnimal={nearAnimal}
            nearBuildingId={nearBuildingId}
            onSprayStart={handleSprayStart}
            onSprayEnd={handleSprayEnd}
            onRefillStart={handleRefillStart}
            onRefillEnd={handleRefillEnd}
            onSprintStart={handleSprintStart}
            onSprintEnd={handleSprintEnd}
            onRescueAnimal={handleRescueAnimal}
            onOpenMap={() => setShowStrategicMap(true)}
            onOpenBuilding={() => nearBuildingId && setShowBuildingModal(nearBuildingId)}
          />
        </div>
      </div>

      {/* Modals */}
      {showPause && (
        <PauseMenuModal
          language={saveData.language}
          environment={environment}
          onResume={() => setShowPause(false)}
          onOpenSettings={() => {
            setShowPause(false);
            setShowSettings(true);
          }}
          onReturnToBase={() => {
            setShowPause(false);
            onSwitchEnvironment('base');
          }}
          onSaveAndExit={() => {
            setShowPause(false);
            SaveManager.save(saveData);
            onReturnToMainMenu();
          }}
        />
      )}

      {showStrategicMap && engineRef.current && (
        <StrategicMapModal
          language={saveData.language}
          worldWidth={engineRef.current.worldWidth}
          worldHeight={engineRef.current.worldHeight}
          playerPos={{ x: engineRef.current.player.x, y: engineRef.current.player.y }}
          fires={engineRef.current.fires}
          animals={engineRef.current.animals}
          waterSources={engineRef.current.waterSources}
          buildings={engineRef.current.buildings}
          onClose={() => setShowStrategicMap(false)}
        />
      )}

      {showBuildingModal && (
        <BuildingModal
          buildingId={showBuildingModal}
          language={saveData.language}
          saveData={saveData}
          onUpdateSave={onUpdateSave}
          onClose={() => setShowBuildingModal(null)}
        />
      )}

      {showSettings && (
        <SettingsModal
          language={saveData.language}
          saveData={saveData}
          onUpdateSave={onUpdateSave}
          onResetData={() => {
            const resetData = SaveManager.reset();
            onUpdateSave(() => resetData);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {missionResult && (
        <MissionResultModal
          isVictory={missionResult.isVictory}
          language={saveData.language}
          firesExtinguished={extinguishedCount}
          animalsRescued={rescuedCount}
          rewardCoins={activeMission?.rewardCoins || 100}
          onClaim={handleClaimReward}
          onRetry={() => {
            setMissionResult(null);
            if (engineRef.current) {
              engineRef.current.init(environment, saveData.equipment);
              setTargetFires(engineRef.current.targetFires);
              setTargetAnimals(engineRef.current.targetAnimals);
            }
          }}
          onReturnToBase={() => {
            setMissionResult(null);
            onSwitchEnvironment('base');
          }}
        />
      )}
    </div>
  );
};
