/**
 * Fireland: Borneo Forest Rescue
 * Borneo Endangered Wildlife Sanctuary & Compendium Modal
 */

import React, { useState } from 'react';
import { X, Heart, ShieldAlert, Sparkles, MapPin } from 'lucide-react';
import { GameSaveData, Language } from '../game/types';
import { TRANSLATIONS, WILDLIFE_DATA } from '../game/i18n';
import { Sound } from '../game/audio';

interface WildlifeModalProps {
  language: Language;
  saveData: GameSaveData;
  onClose: () => void;
}

export const WildlifeModal: React.FC<WildlifeModalProps> = ({
  language,
  saveData,
  onClose,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedKey, setSelectedKey] = useState<string>('orangutan');

  const animalKeys = Object.keys(WILDLIFE_DATA);
  const currentAnimal = WILDLIFE_DATA[selectedKey];
  const rescuedCount = saveData.wildlifeRescued[selectedKey as keyof typeof saveData.wildlifeRescued] || 0;

  const animalEmojis: Record<string, string> = {
    orangutan: '🦧',
    bekantan: '🐒',
    beruang_madu: '🐻',
    macan_dahan: '🐆',
    rangkong: '🦤',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-emerald-500/50 shadow-2xl p-5 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400 fill-current" />
            <h3 className="font-extrabold text-base text-white tracking-wider">
              {t.wildlifeCollection}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Animal Selector Badges */}
        <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
          {animalKeys.map((key) => {
            const data = WILDLIFE_DATA[key];
            const isSelected = selectedKey === key;
            const count = saveData.wildlifeRescued[key as keyof typeof saveData.wildlifeRescued] || 0;

            return (
              <button
                key={key}
                onClick={() => {
                  Sound.playClick();
                  setSelectedKey(key);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border-2 shrink-0 transition active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-600/30 border-emerald-400 text-white shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="text-xl">{animalEmojis[key] || '🐾'}</span>
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight line-clamp-1">
                    {data.name[language]}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold">
                    {count > 0 ? `✨ ${count} Selamat` : 'Belum Ditemukan'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Animal Detail Card */}
        <div className="flex flex-col gap-3.5 mt-2 p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/30">
          {/* Avatar and Name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-800 to-amber-600 border-2 border-yellow-400/50 flex items-center justify-center text-4xl shadow-xl">
              {animalEmojis[selectedKey] || '🐾'}
            </div>
            <div>
              <h4 className="text-base font-extrabold text-white">
                {currentAnimal.name[language]}
              </h4>
              <p className="text-xs font-serif italic text-emerald-300">
                {currentAnimal.scientificName}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-rose-400">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{currentAnimal.status[language]}</span>
              </div>
            </div>
          </div>

          {/* Rescue Status Banner */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">
              {t.populasiTerselamatkan}:
            </span>
            <span className="text-sm font-extrabold text-emerald-300 font-mono">
              {rescuedCount} Ekor di Suaka
            </span>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              {t.keteranganSatwa}
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentAnimal.description[language]}
            </p>
          </div>

          {/* Native Habitat */}
          <div className="flex items-start gap-2 text-xs text-slate-300">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">{t.habitatAlami}: </span>
              <span>{currentAnimal.habitat[language]}</span>
            </div>
          </div>

          {/* Sanctuary Bonus Lore */}
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-yellow-300 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-200">
              <span className="font-bold text-yellow-300">Pengaruh Suaka Borneo: </span>
              {currentAnimal.bonusLore[language]}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs tracking-wider active:scale-95 transition"
        >
          {t.tutup}
        </button>
      </div>
    </div>
  );
};
