/**
 * Fireland: Borneo Forest Rescue
 * Interactive Basecamp Building & Equipment Upgrade Modal
 */

import React, { useState } from 'react';
import { X, Wrench, Shield, Droplet, Wind, Coins, Sparkles, Heart } from 'lucide-react';
import { BuildingState, EquipmentLevels, GameSaveData, Language } from '../game/types';
import { TRANSLATIONS } from '../game/i18n';
import { Sound } from '../game/audio';

interface BuildingModalProps {
  buildingId: BuildingState['id'];
  language: Language;
  saveData: GameSaveData;
  onUpdateSave: (updater: (prev: GameSaveData) => GameSaveData) => void;
  onClose: () => void;
}

export const BuildingModal: React.FC<BuildingModalProps> = ({
  buildingId,
  language,
  saveData,
  onUpdateSave,
  onClose,
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'facility' | 'equipment'>(
    buildingId === 'tool_shed' ? 'equipment' : 'facility'
  );
  const [harvestMsg, setHarvestMsg] = useState<string | null>(null);

  const building = saveData.buildings[buildingId] || {
    id: buildingId,
    level: 1,
    health: 100,
    maxHealth: 100,
    repairCost: 40,
    upgradeCost: 120,
  };

  const buildingNames: Record<BuildingState['id'], string> = {
    house: t.rumahPemain,
    garden: t.kebunPohon,
    water_tank: t.tangkiAirMarkas,
    tool_shed: t.gudangAlat,
    rescue_post: t.posPenyelamatan,
    wildlife_habitat: t.habitatSatwa,
  };

  const buildingDescs: Record<BuildingState['id'], string> = {
    house: t.rumahDesc,
    garden: t.kebunDesc,
    water_tank: t.tangkiAirDesc,
    tool_shed: t.gudangDesc,
    rescue_post: t.posDesc,
    wildlife_habitat: t.habitatDesc,
  };

  const handleRepair = () => {
    if (saveData.coins < building.repairCost) {
      alert(t.koinTidakCukup);
      return;
    }
    Sound.playClick();
    Sound.playCoin();
    onUpdateSave((prev) => ({
      ...prev,
      coins: prev.coins - building.repairCost,
      buildings: {
        ...prev.buildings,
        [buildingId]: {
          ...prev.buildings[buildingId],
          health: 100,
        },
      },
    }));
  };

  const handleUpgradeBuilding = () => {
    if (saveData.coins < building.upgradeCost) {
      alert(t.koinTidakCukup);
      return;
    }
    Sound.playClick();
    Sound.playCoin();
    onUpdateSave((prev) => ({
      ...prev,
      coins: prev.coins - building.upgradeCost,
      buildings: {
        ...prev.buildings,
        [buildingId]: {
          ...prev.buildings[buildingId],
          level: prev.buildings[buildingId].level + 1,
          upgradeCost: Math.round(prev.buildings[buildingId].upgradeCost * 1.6),
        },
      },
    }));
  };

  const handleHarvestGarden = () => {
    Sound.playCoin();
    const harvestBonus = 35 + building.level * 15;
    setHarvestMsg(`+${harvestBonus} ${t.coins}!`);
    onUpdateSave((prev) => ({
      ...prev,
      coins: prev.coins + harvestBonus,
    }));
    setTimeout(() => setHarvestMsg(null), 2500);
  };

  const handleUpgradeEquipment = (type: keyof EquipmentLevels, cost: number) => {
    if (saveData.coins < cost) {
      alert(t.koinTidakCukup);
      return;
    }
    Sound.playClick();
    Sound.playCoin();
    onUpdateSave((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      equipment: {
        ...prev.equipment,
        [type]: prev.equipment[type] + 1,
      },
    }));
  };

  const eq = saveData.equipment;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border-2 border-emerald-500/50 shadow-2xl p-5 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base text-white tracking-wide">
              {buildingNames[buildingId]}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch if tool shed */}
        {buildingId === 'tool_shed' && (
          <div className="flex rounded-xl bg-slate-800 p-1 mt-3 gap-1">
            <button
              onClick={() => setActiveTab('equipment')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'equipment' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              {t.peralatanRelawan}
            </button>
            <button
              onClick={() => setActiveTab('facility')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'facility' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              {t.fasilitasMarkas}
            </button>
          </div>
        )}

        {/* Facility Tab */}
        {activeTab === 'facility' && (
          <div className="flex flex-col gap-4 mt-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              {buildingDescs[buildingId]}
            </p>

            {/* Health & Level stats */}
            <div className="bg-slate-950/70 rounded-2xl p-4 border border-emerald-500/30 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{t.levelSekarang}</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {t.stage} {building.level}
                </span>
              </div>

              {/* Durability */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{t.statusKondisi}</span>
                  <span className="font-bold text-emerald-300">{building.health}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${building.health}%` }}
                  />
                </div>
              </div>

              {/* Garden Free Harvest Button */}
              {buildingId === 'garden' && (
                <div className="mt-2 flex flex-col gap-2">
                  <button
                    onClick={handleHarvestGarden}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold text-xs tracking-wider shadow-lg flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>Panen Buah Kebun (+{35 + building.level * 15} Koin)</span>
                  </button>
                  {harvestMsg && (
                    <span className="text-xs font-bold text-yellow-400 text-center animate-bounce">
                      {harvestMsg}
                    </span>
                  )}
                </div>
              )}

              {/* Sanctuary Rescued Animals Summary */}
              {buildingId === 'wildlife_habitat' && (
                <div className="mt-2 flex flex-col gap-2">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-pink-400 fill-current" />
                    <span>Satwa Aman di Suaka Borneo:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-700">
                      <div className="text-lg">🦧</div>
                      <div className="font-bold text-white">{saveData.wildlifeRescued.orangutan}</div>
                      <div className="text-[10px] text-slate-400">Orangutan</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-700">
                      <div className="text-lg">🐒</div>
                      <div className="font-bold text-white">{saveData.wildlifeRescued.bekantan}</div>
                      <div className="text-[10px] text-slate-400">Bekantan</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-700">
                      <div className="text-lg">🐻</div>
                      <div className="font-bold text-white">{saveData.wildlifeRescued.beruang_madu}</div>
                      <div className="text-[10px] text-slate-400">Beruang</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Repair & Upgrade Actions */}
            <div className="flex gap-2">
              {building.health < 100 && (
                <button
                  onClick={handleRepair}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs tracking-wider shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Wrench className="w-4 h-4" />
                  <span>{t.perbaiki} ({building.repairCost} Koin)</span>
                </button>
              )}

              <button
                onClick={handleUpgradeBuilding}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider shadow-md flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>{t.tingkatkan} ({building.upgradeCost} Koin)</span>
              </button>
            </div>
          </div>
        )}

        {/* Equipment Tab */}
        {activeTab === 'equipment' && (
          <div className="flex flex-col gap-3 mt-3">
            {/* Backpack Tank */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-900/60 border border-sky-400/40 flex items-center justify-center">
                  <Droplet className="w-5 h-5 text-sky-400 fill-current" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{t.kapasitasTangki}</h4>
                  <p className="text-[10px] text-slate-400">
                    {[100, 250, 450, 750][eq.tankLevel - 1]}L Air
                  </p>
                </div>
              </div>
              {eq.tankLevel < 4 ? (
                <button
                  onClick={() => handleUpgradeEquipment('tankLevel', eq.tankLevel * 100)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 active:scale-95"
                >
                  <Coins className="w-3.5 h-3.5 text-yellow-300" />
                  <span>{eq.tankLevel * 100}</span>
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-400">{t.maksimal}</span>
              )}
            </div>

            {/* Nozzle Jet */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-900/60 border border-blue-400/40 flex items-center justify-center">
                  <Wind className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{t.tekananNozzle}</h4>
                  <p className="text-[10px] text-slate-400">
                    Tingkat {eq.nozzleLevel} (Jangkauan + Daya Semprot)
                  </p>
                </div>
              </div>
              {eq.nozzleLevel < 4 ? (
                <button
                  onClick={() => handleUpgradeEquipment('nozzleLevel', eq.nozzleLevel * 120)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 active:scale-95"
                >
                  <Coins className="w-3.5 h-3.5 text-yellow-300" />
                  <span>{eq.nozzleLevel * 120}</span>
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-400">{t.maksimal}</span>
              )}
            </div>

            {/* Anti Smoke Mask */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-900/60 border border-amber-400/40 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{t.maskerRespirator}</h4>
                  <p className="text-[10px] text-slate-400">
                    Tingkat {eq.maskLevel} (Perlindungan Asap Tebal)
                  </p>
                </div>
              </div>
              {eq.maskLevel < 4 ? (
                <button
                  onClick={() => handleUpgradeEquipment('maskLevel', eq.maskLevel * 150)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 active:scale-95"
                >
                  <Coins className="w-3.5 h-3.5 text-yellow-300" />
                  <span>{eq.maskLevel * 150}</span>
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-400">{t.maksimal}</span>
              )}
            </div>

            {/* Protective Suit */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-900/60 border border-rose-400/40 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{t.bajuPelindung}</h4>
                  <p className="text-[10px] text-slate-400">
                    Tingkat {eq.suitLevel} (Ketahanan Panas Bara Api)
                  </p>
                </div>
              </div>
              {eq.suitLevel < 4 ? (
                <button
                  onClick={() => handleUpgradeEquipment('suitLevel', eq.suitLevel * 160)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 active:scale-95"
                >
                  <Coins className="w-3.5 h-3.5 text-yellow-300" />
                  <span>{eq.suitLevel * 160}</span>
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-400">{t.maksimal}</span>
              )}
            </div>
          </div>
        )}

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
