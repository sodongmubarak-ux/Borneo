/**
 * Fireland: Borneo Forest Rescue
 * Action Control Buttons for Mobile Android
 */

import React from 'react';
import { Flame, Droplet, Heart, Wind, Map, Wrench } from 'lucide-react';
import { Language, RescuableAnimalEntity } from '../game/types';
import { TRANSLATIONS } from '../game/i18n';

interface ActionControlsProps {
  language: Language;
  water: number;
  maxWater: number;
  isSpraying: boolean;
  isSprinting: boolean;
  nearWater: boolean;
  nearFire: boolean;
  nearAnimal: RescuableAnimalEntity | null;
  nearBuildingId: string | null;
  onSprayStart: () => void;
  onSprayEnd: () => void;
  onRefillStart: () => void;
  onRefillEnd: () => void;
  onSprintStart: () => void;
  onSprintEnd: () => void;
  onRescueAnimal: () => void;
  onOpenMap: () => void;
  onOpenBuilding: () => void;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
  language,
  water,
  isSpraying,
  isSprinting,
  nearWater,
  nearAnimal,
  nearBuildingId,
  onSprayStart,
  onSprayEnd,
  onRefillStart,
  onRefillEnd,
  onSprintStart,
  onSprintEnd,
  onRescueAnimal,
  onOpenMap,
  onOpenBuilding,
}) => {
  const t = TRANSLATIONS[language];

  const handleVibrate = () => {
    if ('vibrate' in navigator) {
      try { navigator.vibrate(15); } catch {}
    }
  };

  return (
    <div className="flex flex-col items-end gap-3 pointer-events-auto select-none touch-none">
      {/* Secondary Top Row: Map & Building buttons */}
      <div className="flex items-center gap-2">
        {nearBuildingId && (
          <button
            onClick={() => { handleVibrate(); onOpenBuilding(); }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs tracking-wider shadow-lg border border-amber-300 animate-bounce active:scale-95 transition"
          >
            <Wrench className="w-4 h-4" />
            <span>KELOLA</span>
          </button>
        )}

        <button
          onClick={() => { handleVibrate(); onOpenMap(); }}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 text-xs font-bold shadow-md active:scale-95 transition"
        >
          <Map className="w-4 h-4 text-emerald-400" />
          <span>{t.peta}</span>
        </button>

        {/* Sprint Button */}
        <button
          onTouchStart={(e) => { e.preventDefault(); handleVibrate(); onSprintStart(); }}
          onTouchEnd={(e) => { e.preventDefault(); onSprintEnd(); }}
          onMouseDown={() => { handleVibrate(); onSprintStart(); }}
          onMouseUp={onSprintEnd}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-md transition active:scale-95 ${
            isSprinting
              ? 'bg-amber-500 text-slate-950 border-2 border-yellow-200'
              : 'bg-slate-900/80 text-amber-300 border border-amber-500/40'
          }`}
        >
          <Wind className="w-4 h-4" />
          <span>{t.lari}</span>
        </button>
      </div>

      {/* Dynamic Context Button: Rescue Animal */}
      {nearAnimal && (
        <button
          onClick={() => { handleVibrate(); onRescueAnimal(); }}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-extrabold text-sm tracking-wider shadow-2xl border-2 border-pink-300 flex items-center justify-center gap-2 animate-pulse active:scale-95"
        >
          <Heart className="w-5 h-5 fill-current" />
          <span>{t.selamatkan} ({nearAnimal.name})</span>
        </button>
      )}

      {/* Dynamic Context Button: Refill Water */}
      {nearWater && (
        <button
          onTouchStart={(e) => { e.preventDefault(); handleVibrate(); onRefillStart(); }}
          onTouchEnd={(e) => { e.preventDefault(); onRefillEnd(); }}
          onMouseDown={() => { handleVibrate(); onRefillStart(); }}
          onMouseUp={onRefillEnd}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-500 text-white font-extrabold text-sm tracking-wider shadow-xl border-2 border-sky-300 flex items-center justify-center gap-2 active:scale-95"
        >
          <Droplet className="w-5 h-5 fill-current" />
          <span>{t.isiAir}</span>
        </button>
      )}

      {/* Primary Extinguish Action Button */}
      <button
        onTouchStart={(e) => { e.preventDefault(); handleVibrate(); onSprayStart(); }}
        onTouchEnd={(e) => { e.preventDefault(); onSprayEnd(); }}
        onMouseDown={() => { handleVibrate(); onSprayStart(); }}
        onMouseUp={onSprayEnd}
        disabled={water <= 0}
        className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1 shadow-2xl transition-all duration-75 border-4 active:scale-90 ${
          water <= 0
            ? 'bg-slate-800/80 border-slate-600 text-slate-400 opacity-60'
            : isSpraying
            ? 'bg-gradient-to-tr from-sky-600 to-cyan-400 border-white text-white shadow-cyan-500/50 scale-95 ring-4 ring-cyan-300'
            : 'bg-gradient-to-tr from-blue-700 to-sky-500 border-sky-200 text-white shadow-blue-900/60'
        }`}
      >
        <Flame className={`w-8 h-8 ${isSpraying ? 'text-yellow-200 animate-spin' : 'text-sky-100'}`} />
        <span className="text-[11px] font-black tracking-wider leading-none">
          {t.padamkan}
        </span>
        <span className="text-[9px] font-semibold opacity-80 leading-none">
          {Math.round(water)}L
        </span>
      </button>
    </div>
  );
};
