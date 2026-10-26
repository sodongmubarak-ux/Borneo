/**
 * Fireland: Borneo Forest Rescue
 * Pause Menu Modal
 */

import React from 'react';
import { Play, Settings, Home, LogOut, Shield } from 'lucide-react';
import { Language } from '../game/types';
import { TRANSLATIONS } from '../game/i18n';
import { Sound } from '../game/audio';

interface PauseMenuModalProps {
  language: Language;
  environment: string;
  onResume: () => void;
  onOpenSettings: () => void;
  onReturnToBase: () => void;
  onSaveAndExit: () => void;
}

export const PauseMenuModal: React.FC<PauseMenuModalProps> = ({
  language,
  environment,
  onResume,
  onOpenSettings,
  onReturnToBase,
  onSaveAndExit,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-xs rounded-3xl bg-slate-900 border-2 border-emerald-500/50 shadow-2xl p-6 flex flex-col items-center text-center">
        {/* Emblem */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-400/50 flex items-center justify-center text-2xl mb-3 shadow-lg">
          🌲
        </div>

        {/* Title */}
        <h3 className="text-lg font-black text-white tracking-wider mb-1">
          {t.paused}
        </h3>
        <p className="text-[11px] text-slate-400 mb-5">
          Progres disimpan secara otomatis ke memori lokal.
        </p>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Resume */}
          <button
            onClick={() => {
              Sound.playClick();
              onResume();
            }}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs tracking-wider shadow-md flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{t.resume}</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              Sound.playClick();
              onOpenSettings();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs tracking-wider border border-slate-700 shadow-md flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <Settings className="w-4 h-4 text-emerald-400" />
            <span>{t.settings}</span>
          </button>

          {/* Return to Base (if currently in a mission) */}
          {environment !== 'base' && (
            <button
              onClick={() => {
                Sound.playClick();
                onReturnToBase();
              }}
              className="w-full py-2.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 font-bold text-xs tracking-wider border border-amber-500/40 shadow-md flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Home className="w-4 h-4" />
              <span>{t.returnToBase}</span>
            </button>
          )}

          {/* Save & Exit to Main Menu */}
          <button
            onClick={() => {
              Sound.playClick();
              onSaveAndExit();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold text-xs tracking-wider border border-rose-500/30 shadow-md flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.saveAndExit}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
