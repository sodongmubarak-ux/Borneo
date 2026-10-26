/**
 * Fireland: Borneo Forest Rescue
 * Main Menu Screen
 */

import React from 'react';
import { Play, PlayCircle, Map, Heart, Settings, Info, TreePine, Globe, Shield } from 'lucide-react';
import { GameSaveData, Language } from '../game/types';
import { STAGE_TITLES, TRANSLATIONS } from '../game/i18n';
import { Sound } from '../game/audio';
import { PWAInstallPrompt } from './PWAInstallPrompt';

interface MainMenuProps {
  language: Language;
  saveData: GameSaveData;
  hasExistingSave: boolean;
  onStartNewGame: () => void;
  onContinueGame: () => void;
  onOpenWorldMap: () => void;
  onOpenWildlife: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onToggleLanguage: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  language,
  saveData,
  hasExistingSave,
  onStartNewGame,
  onContinueGame,
  onOpenWorldMap,
  onOpenWildlife,
  onOpenSettings,
  onOpenAbout,
  onToggleLanguage,
}) => {
  const t = TRANSLATIONS[language];

  const handleAction = (cb: () => void) => {
    Sound.playClick();
    Sound.startAmbientMusic();
    cb();
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-950 to-stone-950 select-none">
      {/* Background Animated Atmosphere */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-emerald-500 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-amber-600 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-green-600 blur-[100px]" />
      </div>

      {/* Top Header Row */}
      <div className="w-full flex items-center justify-between z-10">
        {/* Offline & Stage Badge */}
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/30 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300 font-semibold">{t.offlineBadge}</span>
        </div>

        {/* Quick Language Toggle */}
        <button
          onClick={onToggleLanguage}
          className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/40 text-xs font-bold text-white hover:bg-slate-800 transition active:scale-95"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>{language === 'id' ? '🇮🇩 Bahasa' : '🇬🇧 English'}</span>
        </button>
      </div>

      {/* Hero Logo & Branding */}
      <div className="flex flex-col items-center text-center z-10 my-auto">
        {/* Shield Emblem */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-emerald-800 via-green-600 to-amber-500 p-1 shadow-[0_0_40px_rgba(16,185,129,0.4)] mb-3">
          <div className="w-full h-full rounded-[22px] bg-slate-950 flex flex-col items-center justify-center border border-emerald-400/50">
            <TreePine className="w-9 h-9 sm:w-11 sm:h-11 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-amber-400">BORNEO</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-yellow-200 to-amber-400 drop-shadow-md">
          {t.gameTitle}
        </h1>
        <h2 className="text-xs sm:text-sm font-extrabold tracking-widest text-emerald-200 uppercase mt-1">
          {t.gameSubtitle}
        </h2>

        {/* Player Status Summary if saved */}
        {hasExistingSave && (
          <div className="mt-3 px-4 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-3">
            <span className="font-bold">
              {t.stage} {saveData.playerStage}: {STAGE_TITLES[saveData.playerStage][language]}
            </span>
            <span>•</span>
            <span className="font-mono text-yellow-300 font-bold">🪙 {saveData.coins}</span>
          </div>
        )}
      </div>

      {/* Main Menu Action Buttons */}
      <div className="w-full max-w-xs flex flex-col gap-2.5 z-10 mb-4">
        {/* Continue Button (if saved) */}
        {hasExistingSave && (
          <button
            onClick={() => handleAction(onContinueGame)}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 hover:from-emerald-500 hover:to-green-400 text-slate-950 font-black text-sm tracking-wider shadow-[0_4px_20px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 border-2 border-emerald-200 active:scale-95 transition"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{t.continuePlay}</span>
          </button>
        )}

        {/* Start Game Button */}
        <button
          onClick={() => handleAction(onStartNewGame)}
          className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm tracking-wider flex items-center justify-center gap-2 border-2 active:scale-95 transition ${
            !hasExistingSave
              ? 'bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 text-slate-950 border-emerald-200 shadow-xl'
              : 'bg-slate-900/80 hover:bg-slate-800 text-white border-slate-700'
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          <span>{hasExistingSave ? 'MAIN DARI AWAL' : t.startPlay}</span>
        </button>

        {/* Secondary Navigation Row: World Map & Wildlife */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAction(onOpenWorldMap)}
            className="py-2.5 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-emerald-300 font-bold text-xs border border-emerald-500/40 shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <Map className="w-4 h-4" />
            <span>{t.worldMap}</span>
          </button>

          <button
            onClick={() => handleAction(onOpenWildlife)}
            className="py-2.5 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-pink-300 font-bold text-xs border border-pink-500/40 shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>{t.wildlifeCollection}</span>
          </button>
        </div>

        {/* Tertiary Row: Settings & About */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAction(onOpenSettings)}
            className="py-2.5 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700 shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>{t.settings}</span>
          </button>

          <button
            onClick={() => handleAction(onOpenAbout)}
            className="py-2.5 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700 shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <Info className="w-4 h-4 text-slate-400" />
            <span>{t.aboutGame}</span>
          </button>
        </div>

        {/* PWA Android Install Banner */}
        <div className="mt-2">
          <PWAInstallPrompt language={language} />
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-[10px] text-slate-300 font-mono text-center z-10">
        Fireland © Borneo Rainforest Conservation • Single-player Offline Edition
      </div>
    </div>
  );
};
