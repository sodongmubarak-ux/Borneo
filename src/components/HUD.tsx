/**
 * Fireland: Borneo Forest Rescue
 * Top Status Perimeter HUD for Mobile
 */

import React from 'react';
import { Droplet, Wind, AlertTriangle, Coins, Pause } from 'lucide-react';
import { Language } from '../game/types';
import { TRANSLATIONS } from '../game/i18n';

interface HUDProps {
  language: Language;
  water: number;
  maxWater: number;
  stamina: number;
  maxStamina: number;
  smokeExposure: number;
  coins: number;
  extinguishedCount: number;
  targetFires: number;
  rescuedCount: number;
  targetAnimals: number;
  environment: string;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  language,
  water,
  maxWater,
  stamina,
  maxStamina,
  smokeExposure,
  coins,
  extinguishedCount,
  targetFires,
  rescuedCount,
  targetAnimals,
  environment,
  onPause,
}) => {
  const t = TRANSLATIONS[language];
  const waterPct = Math.round((water / maxWater) * 100);
  const staminaPct = Math.round((stamina / maxStamina) * 100);

  return (
    <div className="flex flex-col gap-2 pointer-events-none select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Water & Stamina & Smoke Meters */}
        <div className="flex flex-col gap-1.5 bg-slate-950/75 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-emerald-500/30 shadow-lg pointer-events-auto">
          {/* Water Meter */}
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-sky-400 shrink-0 fill-current" />
            <div className="w-24 sm:w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-sky-500/40">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-75"
                style={{ width: `${waterPct}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-bold text-sky-200 tabular-nums">
              {Math.round(water)}L
            </span>
          </div>

          {/* Stamina Meter */}
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="w-24 sm:w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-amber-500/40">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-75"
                style={{ width: `${staminaPct}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-200 tabular-nums">
              {staminaPct}%
            </span>
          </div>

          {/* Smoke Hazard (visible when in smoke) */}
          {smokeExposure > 5 && (
            <div className="flex items-center gap-2 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <div className="w-24 sm:w-32 h-2 bg-slate-800 rounded-full overflow-hidden border border-rose-500/40">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-rose-600 transition-all duration-75"
                  style={{ width: `${smokeExposure}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-rose-300 tabular-nums">
                {t.smokeHaze}
              </span>
            </div>
          )}
        </div>

        {/* Right: Coins & Pause Button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Coin Badge */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-yellow-500/40 shadow-lg">
            <Coins className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-extrabold text-yellow-300 font-mono tabular-nums">
              {coins}
            </span>
          </div>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="w-10 h-10 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center shadow-lg active:scale-95 transition"
            aria-label="Pause Game"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mission Objective Tracker (in mission areas) */}
      {environment !== 'base' && (
        <div className="self-center bg-slate-950/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-500/40 shadow-md flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-orange-300">
            <span>🔥 {t.fireExtinguished}:</span>
            <span className="font-mono font-bold text-white tabular-nums">
              {extinguishedCount} / {targetFires}
            </span>
          </div>

          {targetAnimals > 0 && (
            <div className="flex items-center gap-1.5 text-pink-300">
              <span>🦧 {t.animalsRescued}:</span>
              <span className="font-mono font-bold text-white tabular-nums">
                {rescuedCount} / {targetAnimals}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
