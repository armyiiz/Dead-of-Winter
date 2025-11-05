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
      const diceCount = survivors.length + 1;
      const newDice = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
      set({ locations: updatedLocations, currentCrisis: nextCrisis, currentPhase: 'Player', actionDice: newDice, actionLog: [...get().actionLog, `--- วันที่ ${get().currentDay}, เฟสวิกฤต ---`, `วิกฤต: ${nextCrisis?.title}`, `ทอยลูกเต๋าได้: ${newDice.join(', ')}`] });
    }

    // --- PLAYER PHASE ---
    else if (currentPhase === 'Player') {
      set({ currentPhase: 'Colony', actionLog: [...get().actionLog, `--- เฟสผู้เล่น ---`] });
    }

    // --- COLONY PHASE ---
    else if (currentPhase === 'Colony') {
      let log = [`--- เฟสที่หลบภัย ---`];
      // 1. Resolve Crisis
      let crisisSuccess = true;
      if (currentCrisis) {
        const required = currentCrisis.requirements;
        let availableItems: Item[] = [];

        if (currentCrisis.crisisType === 'Abstract') {
          availableItems = [...colonyInventory, ...survivors.flatMap(s => s.personalInventory)];
        } else { // 'Physical'
          availableItems = [...colonyInventory];
        }

        for (const req of required) {
          if (availableItems.filter(item => item.type === req.type).length < req.amount) {
            crisisSuccess = false;
            break;
          }
        }

        if (crisisSuccess) {
          log.push(`แก้ไขวิกฤตสำเร็จ!`);

          let updatedColonyInventory = [...colonyInventory];
          let updatedSurvivors = [...survivors];

          for (const req of required) {
            let amountToRemove = req.amount;

            // First, remove from colony inventory
            const itemsInColony = updatedColonyInventory.filter(i => i.type === req.type);
            const toRemoveFromColony = itemsInColony.slice(0, amountToRemove);
            updatedColonyInventory = updatedColonyInventory.filter(i => !toRemoveFromColony.find(r => r.id === i.id));
            amountToRemove -= toRemoveFromColony.length;

            // Then, if abstract and still items to remove, check personal inventories
            if (amountToRemove > 0 && currentCrisis.crisisType === 'Abstract') {
              for (const survivor of updatedSurvivors) {
                if (amountToRemove === 0) break;
                const itemsInPersonal = survivor.personalInventory.filter(i => i.type === req.type);
                const toRemoveFromPersonal = itemsInPersonal.slice(0, amountToRemove);
                survivor.personalInventory = survivor.personalInventory.filter(i => !toRemoveFromPersonal.find(r => r.id === i.id));
                amountToRemove -= toRemoveFromPersonal.length;
              }
            }
          }
          set({ colonyInventory: updatedColonyInventory, survivors: updatedSurvivors });

        } else {
          log.push(`แก้ไขวิกฤตล้มเหลว!`);
          // Apply penalty
          switch (currentCrisis.penalty.type) {
            case 'LOSE_MORALE':
              set(state => ({ morale: state.morale - (currentCrisis.penalty.value as number || 1) }));
              log.push(`เสียขวัญกำลังใจ ${currentCrisis.penalty.value || 1} หน่วย`);
              break;
            // Add other penalty types here later
          }
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
    const survivor = get().survivors.find(s => s.id === survivorId);
    if (!survivor) return;

    let log = [`${survivor.name} เดินทางไปยัง ${locationsData.find(l => l.id === locationId)?.name}`];
    const exposureRoll = Math.floor(Math.random() * 100) + 1;

    if (exposureRoll <= 60) { // 60% Safe
      log.push('การเดินทางปลอดภัย');
    } else if (exposureRoll <= 80) { // 20% Add Waste
      log.push('เจอขยะเกลื่อนกลาดระหว่างทาง!');
      set(state => ({ waste: state.waste + 1 }));
    } else if (exposureRoll <= 95) { // 15% Spawn Zombie
      log.push('เสียงดังเกินไป ทำให้ซอมบี้ตามมา!');
      set(state => ({
        locations: state.locations.map(l => l.id === locationId ? { ...l, zombies: l.zombies + 1 } : l)
      }));
    } else { // 5% Take Wound
      log.push('ถูกซอมบี้ซุ่มโจมตีระหว่างทาง!');
      set(state => ({
        survivors: state.survivors.map(s => s.id === survivorId ? { ...s, hp: s.hp - 1 } : s)
      }));
    }

    set(state => ({
      survivors: state.survivors.map(s => s.id === survivorId ? { ...s, locationId } : s),
      actionLog: [...state.actionLog, ...log]
    }));
  },

  attack: (survivorId, diceValue) => {
    get().spendDice(diceValue);
    const survivor = get().survivors.find(s => s.id === survivorId);
    if (!survivor) return;

    const location = get().locations.find(l => l.id === survivor.locationId);
    if (!location || location.zombies === 0) return;

    let zombiesKilled = 1;
    // Marcus's Skill: Double Tap
    if (survivor.id === 'S001' && (diceValue === 5 || diceValue === 6)) {
      zombiesKilled = 2;
    }

    set(state => ({
      locations: state.locations.map(l =>
        l.id === survivor.locationId ? { ...l, zombies: Math.max(0, l.zombies - zombiesKilled) } : l
      ),
      actionLog: [...state.actionLog, `${survivor.name} โจมตีและสังหารซอมบี้ ${zombiesKilled} ตัว!`]
    }));
  },

  search: (survivorId, diceValue) => {
    get().spendDice(diceValue);
    const survivor = get().survivors.find(s => s.id === survivorId);
    if (!survivor) return;

    const location = get().locations.find(l => l.id === survivor.locationId);
    if (!location || location.searchDeck.length === 0) {
      set(state => ({ actionLog: [...state.actionLog, `${survivor.name} ค้นหาแต่ไม่พบอะไรเลย...`] }));
      return;
    }

    let itemsFound: Item[] = [];
    const deck = [...location.searchDeck];
    const foundItemId = deck.pop(); // Take one item from the deck

    if (foundItemId) {
      const item = createItemFromId(foundItemId);
      if (item) itemsFound.push(item);
    }

    // Lina's Skill: Expert Scavenger (50% chance for extra item)
    if (survivor.id === 'S002' && Math.random() < 0.5 && deck.length > 0) {
        const extraItemId = deck.pop();
        if (extraItemId) {
            const extraItem = createItemFromId(extraItemId);
            if (extraItem) itemsFound.push(extraItem);
        }
    }

    if (itemsFound.length > 0) {
      set(state => ({
        survivors: state.survivors.map(s =>
          s.id === survivorId ? { ...s, personalInventory: [...s.personalInventory, ...itemsFound] } : s
        ),
        locations: state.locations.map(l => l.id === location.id ? { ...l, searchDeck: deck } : l),
        waste: state.waste + 1,
        actionLog: [...state.actionLog, `${survivor.name} ค้นหาและพบ: ${itemsFound.map(i => i.name).join(', ')}`]
      }));
    } else {
       set(state => ({
           locations: state.locations.map(l => l.id === location.id ? { ...l, searchDeck: deck } : l),
           waste: state.waste + 1,
           actionLog: [...state.actionLog, `${survivor.name} ค้นหาแต่ไม่พบอะไรเลย...`]
        }));
    }
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
    const survivor = get().survivors.find(s => s.id === survivorId);
    if (!survivor || survivor.locationId !== 'L001' || survivor.personalInventory.length === 0) return;

    const itemsToDeposit = [...survivor.personalInventory];
    set(state => ({
      survivors: state.survivors.map(s =>
        s.id === survivorId ? { ...s, personalInventory: [] } : s
      ),
      colonyInventory: [...state.colonyInventory, ...itemsToDeposit],
      actionLog: [...state.actionLog, `${survivor.name} ฝากของเข้าคลัง: ${itemsToDeposit.map(i => i.name).join(', ')}`]
    }));
  }
}));

export default useGameStore;
