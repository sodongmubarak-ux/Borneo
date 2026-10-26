/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameSaveData, Language } from './game/types';
import { SaveManager } from './game/storage';
import { Sound } from './game/audio';
import { MainMenu } from './components/MainMenu';
import { GameView } from './components/GameView';
import { WorldMapModal } from './components/WorldMapModal';
import { WildlifeModal } from './components/WildlifeModal';
import { SettingsModal } from './components/SettingsModal';
import { AboutModal } from './components/AboutModal';
import { MISSIONS } from './game/missions';

export default function App() {
  const [saveData, setSaveData] = useState<GameSaveData>(() => SaveManager.load());
  const [screen, setScreen] = useState<'menu' | 'playing'>('menu');
  const [environment, setEnvironment] = useState<'base' | 'outskirts' | 'peat_swamp' | 'sanctuary_hills'>('base');
  const [activeMissionId, setActiveMissionId] = useState<string | undefined>(undefined);

  // Modals accessible from Main Menu
  const [showWorldMap, setShowWorldMap] = useState(false);
  const [showWildlife, setShowWildlife] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // Autosave whenever saveData updates
  useEffect(() => {
    SaveManager.save(saveData);
  }, [saveData]);

  // Audio settings sync
  useEffect(() => {
    Sound.setSoundEnabled(saveData.soundEnabled);
    Sound.setMusicEnabled(saveData.musicEnabled);
  }, [saveData.soundEnabled, saveData.musicEnabled]);

  const handleUpdateSave = (updater: (prev: GameSaveData) => GameSaveData) => {
    setSaveData(prev => {
      const updated = updater(prev);
      SaveManager.save(updated);
      return updated;
    });
  };

  const handleStartNewGame = () => {
    setEnvironment('base');
    setActiveMissionId(undefined);
    setScreen('playing');
  };

  const handleContinueGame = () => {
    setEnvironment('base');
    setActiveMissionId(undefined);
    setScreen('playing');
  };

  const handleSelectMission = (missionId: string) => {
    const mission = MISSIONS.find(m => m.id === missionId);
    if (!mission) return;
    setActiveMissionId(missionId);
    setEnvironment(mission.environment);
    setShowWorldMap(false);
    setScreen('playing');
  };

  const handleSelectBase = () => {
    setActiveMissionId(undefined);
    setEnvironment('base');
    setShowWorldMap(false);
    setScreen('playing');
  };

  const handleToggleLanguage = () => {
    Sound.playClick();
    const nextLang: Language = saveData.language === 'id' ? 'en' : 'id';
    handleUpdateSave(prev => ({ ...prev, language: nextLang }));
  };

  const hasExistingSave = SaveManager.hasSave() || saveData.playerStage > 1 || saveData.completedMissions.length > 0;

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950 font-sans select-none">
      {screen === 'menu' ? (
        <MainMenu
          language={saveData.language}
          saveData={saveData}
          hasExistingSave={hasExistingSave}
          onStartNewGame={handleStartNewGame}
          onContinueGame={handleContinueGame}
          onOpenWorldMap={() => setShowWorldMap(true)}
          onOpenWildlife={() => setShowWildlife(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenAbout={() => setShowAbout(true)}
          onToggleLanguage={handleToggleLanguage}
        />
      ) : (
        <GameView
          environment={environment}
          activeMissionId={activeMissionId}
          saveData={saveData}
          onUpdateSave={handleUpdateSave}
          onReturnToMainMenu={() => {
            setScreen('menu');
          }}
          onSwitchEnvironment={(newEnv, newMissionId) => {
            setEnvironment(newEnv);
            setActiveMissionId(newMissionId);
          }}
        />
      )}

      {/* Global Modals from Main Menu */}
      {showWorldMap && (
        <WorldMapModal
          language={saveData.language}
          saveData={saveData}
          onSelectMission={handleSelectMission}
          onSelectBase={handleSelectBase}
          onClose={() => setShowWorldMap(false)}
        />
      )}

      {showWildlife && (
        <WildlifeModal
          language={saveData.language}
          saveData={saveData}
          onClose={() => setShowWildlife(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          language={saveData.language}
          saveData={saveData}
          onUpdateSave={handleUpdateSave}
          onResetData={() => {
            const resetData = SaveManager.reset();
            setSaveData(resetData);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showAbout && (
        <AboutModal
          language={saveData.language}
          onClose={() => setShowAbout(false)}
        />
      )}
    </div>
  );
}
