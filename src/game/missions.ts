/**
 * Fireland: Borneo Forest Rescue
 * Mission Definitions and World Areas
 */

import { MissionDef } from './types';

export const MISSIONS: MissionDef[] = [
  {
    id: 'mission_1_outskirts',
    name: {
      id: 'Misi 1: Pinggiran Kebun & Rumah',
      en: 'Mission 1: Outskirts & Plantation',
    },
    subtitle: {
      id: 'Kebakaran mendekati rumah warga dan kebun kelapa!',
      en: 'Wildfire approaching villager homes and groves!',
    },
    description: {
      id: 'Angin kencang menerbangkan bara api ke arah pekarangan desa. Lindungi rumah dan padamkan titik api sebelum menjalar ke pemukiman.',
      en: 'Gusty winds blew embers toward the village perimeter. Protect homes and extinguish hotspots before they engulf properties.',
    },
    environment: 'outskirts',
    requiredStage: 1,
    rewardCoins: 120,
    rewardExp: 50,
    difficulty: 1,
    hazards: [],
    objectives: {
      extinguishFires: 6,
      protectBuildings: 2,
    },
  },
  {
    id: 'mission_2_peat_swamp',
    name: {
      id: 'Misi 2: Hutan Rawa Gambut Barito',
      en: 'Mission 2: Barito Peat Swamp Forest',
    },
    subtitle: {
      id: 'Api bawah tanah menyala di lapisan gambut tebal!',
      en: 'Subsurface fire smoldering in dense peat layers!',
    },
    description: {
      id: 'Lahan gambut kering terbakar hingga ke kedalaman tanah, menghasilkan asap pekat beracun. Gunakan masker respirator dan manfaatkan kanal air untuk mengisi tangki.',
      en: 'Dry peat soils are combusting underground, releasing thick toxic haze. Equip your respirator mask and utilize swamp canals to refill water.',
    },
    environment: 'peat_swamp',
    requiredStage: 2,
    rewardCoins: 250,
    rewardExp: 120,
    difficulty: 2,
    hazards: ['peat', 'heavy_smoke'],
    objectives: {
      extinguishFires: 10,
    },
  },
  {
    id: 'mission_3_sanctuary',
    name: {
      id: 'Misi 3: Suaka Satwa Bukit Raya',
      en: 'Mission 3: Bukit Raya Wildlife Sanctuary',
    },
    subtitle: {
      id: 'Kepung api dan selamatkan satwa langka Kalimantan!',
      en: 'Encircle the flames and rescue trapped endangered animals!',
    },
    description: {
      id: 'Kobaran api besar mengurung Orangutan di atas dahan pohon, Bekantan di tepian rawa, dan Beruang Madu yang terluka. Padamkan api di sekitar mereka dan bawa ke zona evakuasi helipad.',
      en: 'Raging flames have trapped a mother Orangutan in canopy branches, a Proboscis Monkey on river edge, and a wounded Sun Bear. Douse surrounding fires and guide them to safety.',
    },
    environment: 'sanctuary_hills',
    requiredStage: 3,
    rewardCoins: 450,
    rewardExp: 260,
    difficulty: 3,
    hazards: ['peat', 'heavy_smoke', 'wind_spread'],
    objectives: {
      extinguishFires: 12,
      rescueAnimals: {
        species: 'orangutan',
        count: 3,
      },
    },
  },
];
