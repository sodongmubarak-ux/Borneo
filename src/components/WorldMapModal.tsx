/**
 * Fireland: Borneo Forest Rescue
 * Interactive World Map & Mission Selection Modal
 */

import React from 'react';
import { X, MapPin, Lock, Award, Flame, AlertCircle } from 'lucide-react';
import { GameSaveData, Language } from '../game/types';
import { MISSIONS } from '../game/missions';
import { STAGE_TITLES, TRANSLATIONS } from '../game/i18n';
import { Sound } from '../game/audio';

interface WorldMapModalProps {
  language: Language;
  saveData: GameSaveData;
  onSelectMission: (missionId: string) => void;
  onSelectBase: () => void;
  onClose: () => void;
}

export const WorldMapModal: React.FC<WorldMapModalProps> = ({
  language,
  saveData,
  onSelectMission,
  onSelectBase,
  onClose,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-emerald-500/50 shadow-2xl p-5 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base text-white tracking-wider">
              {t.pilihArea} (BORNEO)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Player Rank Banner */}
        <div className="mt-3 p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
              {t.stage} {saveData.playerStage}
            </span>
            <h4 className="text-sm font-extrabold text-white">
              {STAGE_TITLES[saveData.playerStage][language]}
            </h4>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400">Total Koin</span>
            <div className="text-sm font-black text-yellow-300 font-mono">
              🪙 {saveData.coins}
            </div>
          </div>
        </div>

        {/* Missions List */}
        <div className="flex flex-col gap-3 mt-4">
          {/* Basecamp Entry */}
          <div
            onClick={() => {
              Sound.playClick();
              onSelectBase();
            }}
            className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900/60 to-slate-900 border-2 border-emerald-400/60 hover:border-emerald-300 shadow-lg cursor-pointer active:scale-98 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-400/50 flex items-center justify-center text-2xl">
                🏡
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white group-hover:text-emerald-300 transition">
                  {t.baseCamp}
                </h4>
                <p className="text-xs text-emerald-200/80">
                  Rumah, kebun, tangki air & perlengkapan
                </p>
              </div>
            </div>
            <button className="px-3.5 py-1.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 text-white font-bold text-xs tracking-wider">
              Masuk
            </button>
          </div>

          {/* Missions */}
          {MISSIONS.map((m) => {
            const isUnlocked = saveData.playerStage >= m.requiredStage;
            const isCompleted = saveData.completedMissions.includes(m.id);

            return (
              <div
                key={m.id}
                className={`p-4 rounded-2xl border-2 transition flex flex-col gap-2.5 ${
                  isUnlocked
                    ? 'bg-slate-950/70 border-slate-700 hover:border-emerald-500/60 shadow-lg'
                    : 'bg-slate-950/40 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {m.environment === 'sanctuary_hills' ? '🦧' : m.environment === 'peat_swamp' ? '🔥' : '🌾'}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {m.name[language]}
                      </h4>
                      <p className="text-xs text-slate-300">
                        {m.subtitle[language]}
                      </p>
                    </div>
                  </div>

                  {isCompleted && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-500/40 shrink-0">
                      <Award className="w-3 h-3" />
                      SELESAI
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {m.description[language]}
                </p>

                {/* Hazards & Rewards bar */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-yellow-400 font-bold flex items-center gap-1">
                      🪙 +{m.rewardCoins} Koin
                    </span>
                    {m.hazards.length > 0 && (
                      <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-0.5">
                        <AlertCircle className="w-3 h-3" />
                        {m.hazards.includes('heavy_smoke') ? 'Asap Pekat' : 'Gambut'}
                      </span>
                    )}
                  </div>

                  {isUnlocked ? (
                    <button
                      onClick={() => {
                        Sound.playClick();
                        onSelectMission(m.id);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold text-xs tracking-wider shadow-md flex items-center gap-1 active:scale-95 transition"
                    >
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>{t.mulaiMisi}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                      <Lock className="w-3.5 h-3.5" />
                      <span>{t.syaratTahap} {m.requiredStage}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs tracking-wider active:scale-95 transition"
        >
          {t.tutup}
        </button>
      </div>
    </div>
  );
};
