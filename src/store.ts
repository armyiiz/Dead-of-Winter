import { create } from 'zustand';
import { Survivor, Location, Item, Crisis, MainObjective } from './types';
import survivorsData from './data/Survivors.json';
import locationsData from './data/Locations.json';
import itemsData from './data/Items.json';
import crisisData from './data/Crisis.json';
import objectivesData from './data/MainObjectives.json';

// Helper
const createItemFromId = (itemId: string): Item | undefined => itemsData.find(item => item.id === itemId);

interface GameState {
  morale: number;
  currentDay: number;
  currentPhase: 'Crisis' | 'Player' | 'Colony' | 'End';
  mainObjective: MainObjective | null;
  currentCrisis: Crisis | null;
  gameStatus: 'Playing' | 'Won' | 'Lost';
  actionLog: string[];
  survivors: Survivor[];
  locations: Location[];
  crisisDeck: Crisis[];
  colonyInventory: Item[];
  waste: number;
  actionDice: number[];
  selectedSurvivorId: string | null;

  // Actions
  setupGame: () => void;
  nextPhase: () => void;
  spendDice: (diceValue: number) => void;
  selectSurvivor: (survivorId: string | null) => void;
  moveSurvivor: (survivorId: string, locationId: string, diceValue: number) => void;
  attack: (survivorId: string, diceValue: number) => void;
  search: (survivorId: string, diceValue: number) => void;
  buildBarricade: (survivorId: string, diceValue: number) => void;
  cleanWaste: (diceValue: number) => void;
  depositItems: (survivorId: string) => void;
}

const useGameStore = create<GameState>((set, get) => ({
  // Initial State
  morale: 0, currentDay: 0, currentPhase: 'Crisis', mainObjective: null, currentCrisis: null,
  gameStatus: 'Playing', actionLog: [], waste: 0, colonyInventory: [],
  survivors: [], locations: [], crisisDeck: [], actionDice: [], selectedSurvivorId: null,

  setupGame: () => {
    const randomObjective = objectivesData[Math.floor(Math.random() * objectivesData.length)];
    const startingSurvivors = [...survivorsData].sort(() => 0.5 - Math.random()).slice(0, 3)
      .map(s => ({ ...s, hp: s.skill.name === "Frank" ? 4 : (s.skill.name === "Arthur" || s.skill.name === "Chloe" ? 2 : 3), locationId: 'L001', personalInventory: [] }));
    set({
      mainObjective: randomObjective,
      survivors: startingSurvivors,
      locations: locationsData.map(loc => ({ ...loc, zombies: 0, barricades: 0 })),
      crisisDeck: [...crisisData].sort(() => 0.5 - Math.random()),
      morale: 5,
      currentDay: 1,
      currentPhase: 'Crisis',
      gameStatus: 'Playing',
      actionLog: ['เกมเริ่มต้นแล้ว!'],
      waste: 0,
      colonyInventory: [],
      actionDice: [],
      selectedSurvivorId: null,
    });
  },

  spendDice: (diceValue) => {
    const { actionDice } = get();
    const diceIndex = actionDice.indexOf(diceValue);
    if (diceIndex > -1) {
      const newDice = [...actionDice];
      newDice.splice(diceIndex, 1);
      set({ actionDice: newDice });
    }
  },

  nextPhase: () => {
    const { currentPhase, gameStatus, survivors, currentCrisis, colonyInventory, waste, mainObjective, currentDay } = get();
    if (gameStatus !== 'Playing') return;

    // --- CRISIS PHASE ---
    if (currentPhase === 'Crisis') {
      const nextCrisis = get().crisisDeck.pop();
      // Zombie Spawning
      const updatedLocations = get().locations.map(loc => {
        if (survivors.some(s => s.locationId === loc.id) && loc.id !== 'L001') {
          return { ...loc, zombies: loc.zombies + 1 };
        }
        return loc;
      });
      set({ locations: updatedLocations, currentCrisis: nextCrisis, currentPhase: 'Player', actionLog: [...get().actionLog, `--- วันที่ ${get().currentDay}, เฟสวิกฤต ---`, `วิกฤต: ${nextCrisis?.title}`] });
    }

    // --- PLAYER PHASE ---
    else if (currentPhase === 'Player') {
      const diceCount = survivors.length + 1;
      const newDice = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
      set({ actionDice: newDice, currentPhase: 'Colony', actionLog: [...get().actionLog, `--- เฟสผู้เล่น ---`, `ทอยลูกเต๋าได้: ${newDice.join(', ')}`] });
    }

    // --- COLONY PHASE ---
    else if (currentPhase === 'Colony') {
      let log = [`--- เฟสที่หลบภัย ---`];
      // 1. Resolve Crisis
      let crisisSuccess = true;
      if (currentCrisis) {
        const required = currentCrisis.requirements;
        const available = [...colonyInventory, ...survivors.flatMap(s => s.personalInventory)];
        for (const req of required) {
            if (available.filter(item => item.type === req.type).length < req.amount) {
                crisisSuccess = false;
                break;
            }
        }
        if(crisisSuccess) {
            log.push(`แก้ไขวิกฤตสำเร็จ!`);
        } else {
            log.push(`แก้ไขวิกฤตล้มเหลว! ${currentCrisis.penalty.type}`);
            set(state => ({ morale: state.morale - (currentCrisis.penalty.value || 1) }));
        }
      }

      // 2. Consume Food
      const survivorsAtCompound = survivors.filter(s => s.locationId === 'L001');
      let foodConsumed = 0;
      let foodNeeded = survivorsAtCompound.length;
      let currentFood = colonyInventory.filter(i => i.type === 'FOOD').length;
      if (currentFood >= foodNeeded) {
          foodConsumed = foodNeeded;
          log.push(`ผู้รอดชีวิต ${foodNeeded} คนบริโภคอาหาร.`);
      } else {
          log.push(`อาหารไม่พอ! ผู้รอดชีวิต ${foodNeeded - currentFood} คนอดอยาก.`);
          // Starvation logic would go here
      }

      // 3. Waste & Rats
      const rats = Math.floor(waste / 3);
      if (rats > survivors.length) {
          log.push(`หนูระบาด! เสียขวัญกำลังใจและอาหาร.`);
          set(state => ({ morale: state.morale - 1 }));
      }
      set(state => ({ actionLog: [...state.actionLog, ...log], currentPhase: 'End' }));
    }

    // --- END PHASE ---
    else if (currentPhase === 'End') {
        let log = [`--- จบวัน ---`];
        let newGameStatus = gameStatus;
        if (get().morale <= 0) newGameStatus = 'Lost';
        if (mainObjective?.winCondition.type === 'SURVIVE_DAYS' && currentDay >= mainObjective.winCondition.value!) newGameStatus = 'Won';

        if (newGameStatus !== 'Playing') {
            log.push(`เกมจบแล้ว! ผล: ${newGameStatus.toUpperCase()}`);
            set({ gameStatus: newGameStatus, actionLog: [...get().actionLog, ...log] });
        } else {
            set(state => ({ currentDay: state.currentDay + 1, currentPhase: 'Crisis', actionLog: [...state.actionLog, ...log] }));
        }
    }
  },

  selectSurvivor: (survivorId) => set({ selectedSurvivorId: survivorId }),

  moveSurvivor: (survivorId, locationId, diceValue) => {
    get().spendDice(diceValue);
    // ... move logic with exposure die ...
    set(state => ({ survivors: state.survivors.map(s => s.id === survivorId ? { ...s, locationId } : s) }));
  },

  attack: (survivorId, diceValue) => {
    get().spendDice(diceValue);
    // ... attack logic ...
  },

  search: (survivorId, diceValue) => {
    get().spendDice(diceValue);
    // ... search logic ...
  },

  buildBarricade: (survivorId, diceValue) => {
    get().spendDice(diceValue);
    // ... build logic ...
  },

  cleanWaste: (diceValue) => {
    get().spendDice(diceValue);
    set(state => ({ waste: Math.max(0, state.waste - 3) }));
  },

  depositItems: (survivorId) => {
    // ... deposit logic ...
  }
}));

export default useGameStore;
