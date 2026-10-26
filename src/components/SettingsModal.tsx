/**
 * Fireland: Borneo Forest Rescue
 * Settings Modal
 */

import React, { useState } from 'react';
import { X, Settings, Globe, Volume2, Music, Sliders, Trash2, AlertTriangle } from 'lucide-react';
import { GameSaveData, Language } from '../game/types';
import { TRANSLATIONS } from '../game/i18n';
import { Sound } from '../game/audio';

interface SettingsModalProps {
  language: Language;
  saveData: GameSaveData;
  onUpdateSave: (updater: (prev: GameSaveData) => GameSaveData) => void;
  onResetData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  language,
  saveData,
  onUpdateSave,
  onResetData,
  onClose,
}) => {
  const t = TRANSLATIONS[language];
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleLanguageChange = (newLang: Language) => {
    Sound.playClick();
    onUpdateSave((prev) => ({ ...prev, language: newLang }));
  };

  const handleSoundToggle = () => {
    const next = !saveData.soundEnabled;
    Sound.setSoundEnabled(next);
    if (next) Sound.playClick();
    onUpdateSave((prev) => ({ ...prev, soundEnabled: next }));
  };

  const handleMusicToggle = () => {
    Sound.playClick();
    const next = !saveData.musicEnabled;
    Sound.setMusicEnabled(next);
    onUpdateSave((prev) => ({ ...prev, musicEnabled: next }));
  };

  const handleSensitivityChange = (val: number) => {
    onUpdateSave((prev) => ({ ...prev, joystickSensitivity: val }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border-2 border-emerald-500/50 shadow-2xl p-5 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base text-white tracking-wider">
              {t.settings}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="flex flex-col gap-4 mt-4">
          {/* Language Selection */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Globe className="w-5 h-5 text-sky-400" />
              <div>
                <h4 className="text-xs font-bold text-white">{t.bahasa}</h4>
                <p className="text-[10px] text-slate-400">Pilih bahasa permainan</p>
              </div>
            </div>
            <div className="flex rounded-xl bg-slate-800 p-1 gap-1">
              <button
                onClick={() => handleLanguageChange('id')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  language === 'id' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                ID
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  language === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Sound FX Toggle */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-xs font-bold text-white">{t.efekSuara}</h4>
                <p className="text-[10px] text-slate-400">Efek air, api, dan satwa</p>
              </div>
            </div>
            <button
              onClick={handleSoundToggle}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                saveData.soundEnabled ? 'bg-emerald-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  saveData.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Music Toggle */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Music className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-xs font-bold text-white">{t.musikLatar}</h4>
                <p className="text-[10px] text-slate-400">Suasana hutan Kalimantan</p>
              </div>
            </div>
            <button
              onClick={handleMusicToggle}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                saveData.musicEnabled ? 'bg-emerald-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  saveData.musicEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Joystick Sensitivity */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-purple-400" />
                <h4 className="text-xs font-bold text-white">{t.sensitivitasJoystick}</h4>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {saveData.joystickSensitivity.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={saveData.joystickSensitivity}
              onChange={(e) => handleSensitivityChange(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Reset Save Data */}
          <div className="pt-2">
            {!showConfirmReset ? (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="w-full py-2.5 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.resetData}</span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/60 flex flex-col gap-3">
                <div className="flex items-start gap-2 text-rose-300 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{t.konfirmasiReset}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                  >
                    {t.batal}
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmReset(false);
                      onResetData();
                      onClose();
                    }}
                    className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                  >
                    {t.yaHapus}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider active:scale-95 transition"
        >
          {t.tutup}
        </button>
      </div>
    </div>
  );
};
