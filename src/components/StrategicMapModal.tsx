/**
 * Fireland: Borneo Forest Rescue
 * Strategic Overhead Radar Minimap Modal
 */

import React from 'react';
import { X, Navigation, Flame, Droplet, Heart, Home } from 'lucide-react';
import { Language, RescuableAnimalEntity, FireEntity, WaterSourceEntity, WorldBuildingEntity } from '../game/types';
import { TRANSLATIONS } from '../game/i18n';

interface StrategicMapModalProps {
  language: Language;
  worldWidth: number;
  worldHeight: number;
  playerPos: { x: number; y: number };
  fires: FireEntity[];
  animals: RescuableAnimalEntity[];
  waterSources: WaterSourceEntity[];
  buildings: WorldBuildingEntity[];
  onClose: () => void;
}

export const StrategicMapModal: React.FC<StrategicMapModalProps> = ({
  language,
  worldWidth,
  worldHeight,
  playerPos,
  fires,
  animals,
  waterSources,
  buildings,
  onClose,
}) => {
  const t = TRANSLATIONS[language];

  // Map display dimensions
  const mapSize = 280;

  const toMapX = (x: number) => (x / worldWidth) * mapSize;
  const toMapY = (y: number) => (y / worldHeight) * mapSize;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-emerald-500/50 shadow-2xl p-5 flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-emerald-500/30">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base text-emerald-200 tracking-wider">
              {t.peta} STRATEGIS BORNEO
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tactical Radar Canvas / Grid */}
        <div
          className="relative mt-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500/40 overflow-hidden shadow-inner flex items-center justify-center"
          style={{ width: `${mapSize}px`, height: `${mapSize}px` }}
        >
          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="border border-emerald-500/10" />
            ))}
          </div>

          {/* Compass Rose */}
          <span className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-400/60 font-mono">
            U (NORTH)
          </span>

          {/* Water Sources */}
          {waterSources.map((w) => (
            <div
              key={w.id}
              className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/40 border border-sky-300 flex items-center justify-center animate-pulse"
              style={{ left: `${toMapX(w.x)}px`, top: `${toMapY(w.y)}px` }}
              title="Water Source"
            >
              <Droplet className="w-3 h-3 text-sky-200 fill-current" />
            </div>
          ))}

          {/* Buildings */}
          {buildings.map((b) => (
            <div
              key={b.id}
              className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-md bg-amber-600/70 border border-amber-300 flex items-center justify-center shadow-md"
              style={{ left: `${toMapX(b.x + b.width / 2)}px`, top: `${toMapY(b.y + b.height / 2)}px` }}
              title="Building"
            >
              <Home className="w-3 h-3 text-amber-100" />
            </div>
          ))}

          {/* Trapped Animals */}
          {animals.filter(a => !a.isRescued).map((a) => (
            <div
              key={a.id}
              className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500 border border-white flex items-center justify-center shadow-lg animate-bounce"
              style={{ left: `${toMapX(a.x)}px`, top: `${toMapY(a.y)}px` }}
              title={a.name}
            >
              <Heart className="w-3.5 h-3.5 text-white fill-current" />
            </div>
          ))}

          {/* Fires */}
          {fires.map((f) => (
            <div
              key={f.id}
              className="absolute w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500 border border-yellow-300 flex items-center justify-center shadow-md animate-ping"
              style={{ left: `${toMapX(f.x)}px`, top: `${toMapY(f.y)}px` }}
              title="Active Fire Spot"
            />
          ))}

          {/* Player Position (Hero marker) */}
          <div
            className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white border-2 border-emerald-400 shadow-[0_0_12px_#34d399] flex items-center justify-center z-10"
            style={{ left: `${toMapX(playerPos.x)}px`, top: `${toMapY(playerPos.y)}px` }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          </div>
        </div>

        {/* Map Legend */}
        <div className="w-full mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-white border border-emerald-400" />
            <span>Pemain (Anda)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-current" />
            <span>Titik Api ({fires.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-sky-400 fill-current" />
            <span>Sumber Air</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-pink-400 fill-current" />
            <span>Satwa Liar</span>
          </div>
        </div>

        {/* Close CTA */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide shadow-lg active:scale-95 transition"
        >
          {t.tutup}
        </button>
      </div>
    </div>
  );
};
