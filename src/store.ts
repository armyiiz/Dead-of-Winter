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
  activeDebuffs: { type: string, duration: number }[];
  hasRerolledThisTurn: boolean;

  // Actions
  setupGame: () => void;
  nextPhase: () => void;
  spendDice: (diceValue: number) => void;
  selectSurvivor: (survivorId: string | null) => void;
  moveSurvivor: (survivorId: string, locationId: string, diceValue: number) => void;
  attack: (survivorId: string, diceValue: number) => void;
  search: (survivorId: string, diceValue: number) => void;
  buildBarricade: (survivorId: string, diceValue: number) => void;
  cleanWaste: (survivorId: string, diceValue: number) => void;
  depositItems: (survivorId: string) => void;
  useSkill: (survivorId: string, targetId?: string) => void; // targetId can be another survivor
  rerollDice: (diceValue: number) => void;
}

const useGameStore = create<GameState>((set, get) => ({
  // Initial State
  morale: 0, currentDay: 0, currentPhase: 'Crisis', mainObjective: null, currentCrisis: null,
  gameStatus: 'Playing', actionLog: [], waste: 0, colonyInventory: [],
  survivors: [], locations: [], crisisDeck: [], actionDice: [], selectedSurvivorId: null,
  activeDebuffs: [], hasRerolledThisTurn: false,

  setupGame: () => {
    const randomObjective = objectivesData[Math.floor(Math.random() * objectivesData.length)];
    const startingSurvivors = [...survivorsData].sort(() => 0.5 - Math.random()).slice(0, 3)
      .map(s => ({ ...s, hp: s.skill.name === "Frank" ? 4 : (s.skill.name === "Arthur" || s.skill.name === "Chloe" ? 2 : 3), locationId: 'L001', personalInventory: [], status: 'Healthy' as 'Healthy' | 'Infected' }));
    set({
      mainObjective: randomObjective,
      survivors: startingSurvivors,
      locations: locationsData.map(loc => ({ ...loc, zombies: 0, barricades: 0, isOverrun: false })),
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
      set({
        locations: updatedLocations,
        currentCrisis: nextCrisis,
        currentPhase: 'Player',
        actionDice: newDice,
        hasRerolledThisTurn: false, // Reset Chloe's skill usage
        actionLog: [...get().actionLog, `--- วันที่ ${get().currentDay}, เฟสวิกฤต ---`, `วิกฤต: ${nextCrisis?.title}`, `ทอยลูกเต๋าได้: ${newDice.join(', ')}`]
      });
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
            case 'SPAWN_ZOMBIE_AT_COMPOUND':
              set(state => ({
                locations: state.locations.map(l => l.id === 'L001' ? { ...l, zombies: l.zombies + (currentCrisis.penalty.value as number || 1) } : l)
              }));
              log.push(`ซอมบี้ ${currentCrisis.penalty.value || 1} ตัวบุกฐาน!`);
              break;
            case 'ALL_SURVIVORS_TAKE_WOUND':
              set(state => ({
                survivors: state.survivors.map(s => ({ ...s, hp: s.hp - (currentCrisis.penalty.value as number || 1) }))
              }));
              log.push(`ผู้รอดชีวิตทุกคนได้รับบาดแผล!`);
              break;
            case 'DESTROY_ALL_BARRICADES':
              set(state => ({
                locations: state.locations.map(l => l.id === 'L001' ? { ...l, barricades: 0 } : l)
              }));
              log.push('เครื่องกีดขวางทั้งหมดที่ฐานถูกทำลาย!');
              break;
            case 'DISCARD_ALL_FROM_COLONY':
              set(state => ({
                colonyInventory: state.colonyInventory.filter(i => i.type !== currentCrisis.penalty.value)
              }));
              log.push(`ไอเทมประเภท ${currentCrisis.penalty.value} ทั้งหมดถูกทิ้ง!`);
              break;
            case 'LOCATION_OVERRUN':
                set(state => ({
                    locations: state.locations.map(l => l.id === currentCrisis.penalty.value ? { ...l, isOverrun: true } : l)
                }));
                log.push(`สถานที่ ${locationsData.find(l => l.id === currentCrisis.penalty.value)?.name} ถูกยึดครอง!`);
                break;
            case 'GLOBAL_DEBUFF':
                set(state => ({
                    activeDebuffs: [...state.activeDebuffs, { type: currentCrisis.penalty.effect!, duration: currentCrisis.penalty.duration! }]
                }));
                log.push('เกิดผลกระทบด้านลบกับกลุ่ม!');
                break;
          }
        }
      }

      // 2. Consume Food
      const survivorsAtCompound = survivors.filter(s => s.locationId === 'L001');
      let foodNeeded = survivorsAtCompound.length;
      let foodInColony = colonyInventory.filter(i => i.type === 'FOOD');

      let updatedColonyInventory = [...colonyInventory];
      let updatedSurvivors = [...survivors];

      if (foodInColony.length >= foodNeeded) {
          const foodToConsume = foodInColony.slice(0, foodNeeded);
          updatedColonyInventory = updatedColonyInventory.filter(i => !foodToConsume.find(f => f.id === i.id));
          log.push(`ผู้รอดชีวิต ${foodNeeded} คนบริโภคอาหาร.`);
      } else {
          const foodDeficit = foodNeeded - foodInColony.length;
          updatedColonyInventory = updatedColonyInventory.filter(i => i.type !== 'FOOD');
          log.push(`อาหารไม่พอ! ผู้รอดชีวิต ${foodDeficit} คนอดอยาก.`);

          // Apply starvation wounds
          const survivorsToWound = updatedSurvivors.filter(s => s.locationId === 'L001').slice(0, foodDeficit);
          for (const survivor of survivorsToWound) {
              log.push(`${survivor.name} ได้รับบาดแผลจากการอดอาหาร!`);
              updatedSurvivors = updatedSurvivors.map(s => s.id === survivor.id ? { ...s, hp: s.hp - 1 } : s);
          }
      }
      set(state => ({ colonyInventory: updatedColonyInventory, survivors: updatedSurvivors }));

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
        let finalSurvivors = [...survivors];

        // Check for infected survivors
        const infectedSurvivors = finalSurvivors.filter(s => s.status === 'Infected');
        if (infectedSurvivors.length > 0) {
            for (const infected of infectedSurvivors) {
                log.push(`${infected.name} ทนพิษบาดแผลไม่ไหวและเสียชีวิตแล้ว...`);
            }
            finalSurvivors = finalSurvivors.map(s => s.status === 'Infected' ? { ...s, hp: 0 } : s);
        }

        // Check for dead survivors
        finalSurvivors = finalSurvivors.filter(s => s.hp > 0);
        if (finalSurvivors.length === 0) {
            newGameStatus = 'Lost';
            log.push('ผู้รอดชีวิตคนสุดท้ายได้ตายจากไปแล้ว...');
        }

        let currentMorale = get().morale;
        const arthurIsAlive = finalSurvivors.some(s => s.id === 'S005');
        if (arthurIsAlive && currentMorale <= 0) {
            currentMorale = 1;
            log.push('Arthur ปลุกใจทุกคน ขวัญกำลังใจไม่ลดต่ำกว่า 1!');
        }

        if (currentMorale <= 0) newGameStatus = 'Lost';

        // Check win conditions
        if (mainObjective) {
          const { type, resource, value, requirements, location_id } = mainObjective.winCondition;
          if (type === 'SURVIVE_DAYS' && currentDay >= value!) {
            newGameStatus = 'Won';
          } else if (type === 'HAVE_IN_STOCK' && colonyInventory.filter(i => i.type === resource).length >= value!) {
            newGameStatus = 'Won';
          } else if (type === 'HAVE_AT_LOCATION') {
            const loc = get().locations.find(l => l.id === location_id);
            if (loc && loc.barricades >= value!) newGameStatus = 'Won';
          } else if (type === 'LOCATION_SECURED') {
            const loc = get().locations.find(l => l.id === location_id);
            if (loc && loc.zombies === 0 && loc.barricades >= requirements!.find(r => r.item === 'BARRICADE')!.value!) {
              newGameStatus = 'Won';
            }
          }
        }

        if (newGameStatus !== 'Playing') {
            log.push(`ภารกิจสำเร็จ!`);
            log.push(`เกมจบแล้ว! ผล: ${newGameStatus.toUpperCase()}`);
            set({ gameStatus: newGameStatus, survivors: finalSurvivors, actionLog: [...get().actionLog, ...log] });
        } else {
            // Tick down debuffs
            const updatedDebuffs = get().activeDebuffs
                .map(d => ({ ...d, duration: d.duration - 1 }))
                .filter(d => d.duration > 0);

            set(state => ({
                currentDay: state.currentDay + 1,
                currentPhase: 'Crisis',
                survivors: finalSurvivors,
                activeDebuffs: updatedDebuffs,
                actionLog: [...state.actionLog, ...log]
            }));
        }
    }
  },

  selectSurvivor: (survivorId) => set({ selectedSurvivorId: survivorId }),

  moveSurvivor: (survivorId, locationId, diceValue) => {
    get().spendDice(diceValue);
    const survivor = get().survivors.find(s => s.id === survivorId);
    if (!survivor) return;

    let log = [`${survivor.name} เดินทางไปยัง ${locationsData.find(l => l.id === locationId)?.name}`];

    let updatedSurvivors = [...get().survivors];
    let updatedLocations = [...get().locations];

    // Marco's Skill: Fleet-Footed
    if (survivor.id === 'S006') {
      log.push('Marco เดินทางอย่างรวดเร็วและปลอดภัย!');
    } else {
      const exposureRoll = Math.floor(Math.random() * 100) + 1;
      if (exposureRoll <= 60) { // 60% Safe
        log.push('การเดินทางปลอดภัย');
      } else if (exposureRoll <= 80) { // 20% Noise/Zombie
        log.push('เสียงดังเกินไป ดึงดูดซอมบี้มา!');
        updatedLocations = updatedLocations.map(l =>
          l.id === locationId ? { ...l, zombies: l.zombies + 1 } : l
        );
      } else if (exposureRoll <= 95) { // 15% Wound
        log.push(`${survivor.name} ได้รับบาดเจ็บระหว่างทาง!`);
        updatedSurvivors = updatedSurvivors.map(s =>
          s.id === survivorId ? { ...s, hp: s.hp - 1 } : s
        );
      } else { // 5% Bitten
        log.push(`หายนะ! ${survivor.name} ถูกกัดและติดเชื้อ!`);
        updatedSurvivors = updatedSurvivors.map(s =>
          s.id === survivorId ? { ...s, status: 'Infected' } : s
        );
      }
    }

    // Update survivor's location
    updatedSurvivors = updatedSurvivors.map(s =>
      s.id === survivorId ? { ...s, locationId } : s
    );

    set(state => ({
      survivors: updatedSurvivors,
      locations: updatedLocations,
      actionLog: [...state.actionLog, ...log]
    }));
  },

  attack: (survivorId, diceValue) => {
    const { activeDebuffs } = get();
    const isDebuffed = activeDebuffs.some(d => d.type === 'ATTACK_DIFFICULTY_UP');
    const requiredRoll = isDebuffed ? 4 : 3;

    if (diceValue < requiredRoll) {
      get().spendDice(diceValue);
      set(state => ({ actionLog: [...state.actionLog, 'ลูกเต๋าไม่พอสำหรับการโจมตี!'] }));
      return;
    }

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
    const survivor = get().survivors.find(s => s.id === survivorId);
    if (!survivor) return;

    let barricadesBuilt = 1;
    // David's Skill: Handyman
    if (survivor.id === 'S004') {
      barricadesBuilt = 2;
    }

    set(state => ({
      locations: state.locations.map(l =>
        l.id === survivor.locationId ? { ...l, barricades: l.barricades + barricadesBuilt } : l
      ),
      actionLog: [...state.actionLog, `${survivor.name} สร้างเครื่องกีดขวาง ${barricadesBuilt} ชิ้น`]
    }));
  },

  cleanWaste: (survivorId, diceValue) => {
    get().spendDice(diceValue);
    const survivor = get().survivors.find(s => s.id === survivorId);
    let wasteCleaned = 3;
    // Rosa's Skill: Efficient Cleaner
    if (survivor?.id === 'S007') {
      wasteCleaned = 5;
    }
    set(state => ({ waste: Math.max(0, state.waste - wasteCleaned) }));
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
  },

  useSkill: (survivorId, targetId) => {
    const survivor = get().survivors.find(s => s.id === survivorId);
    if (!survivor) return;

    switch (survivor.id) {
      case 'S003': // Elena: First Aid
        const target = get().survivors.find(s => s.id === targetId);
        if (target && target.hp < 3) { // Assuming max HP is 3 for simplicity
          set(state => ({
            survivors: state.survivors.map(s => s.id === targetId ? { ...s, hp: s.hp + 1 } : s),
            actionLog: [...state.actionLog, `${survivor.name} ใช้ปฐมพยาบาลรักษา ${target.name}`]
          }));
        }
        break;
      case 'S008': // Frank: Protect the Compound
        const compound = get().locations.find(l => l.id === 'L001');
        if (compound && compound.zombies > 0) {
          set(state => ({
            locations: state.locations.map(l => l.id === 'L001' ? { ...l, zombies: l.zombies - 1 } : l),
            actionLog: [...state.actionLog, `${survivor.name} ยิงซอมบี้ที่ฐานจากระยะไกล!`]
          }));
        }
        break;
      // Note: Marco, Chloe, and Arthur have passive or special-trigger skills handled elsewhere.
    }
  },

  rerollDice: (diceValue) => {
    const { actionDice, hasRerolledThisTurn } = get();
    if (hasRerolledThisTurn) {
      set(state => ({ actionLog: [...state.actionLog, 'Chloe ใช้สกิลไปแล้วในเทิร์นนี้'] }));
      return;
    }
    const diceIndex = actionDice.indexOf(diceValue);
    if (diceIndex > -1) {
      const newDiceValue = Math.floor(Math.random() * 6) + 1;
      const newActionDice = [...actionDice];
      newActionDice.splice(diceIndex, 1, newDiceValue);
      set({
        actionDice: newActionDice,
        hasRerolledThisTurn: true,
        actionLog: [...get().actionLog, `Chloe ใช้สกิล Lucky Break! ทอยลูกเต๋า ${diceValue} ใหม่ ได้ผลเป็น ${newDiceValue}`]
      });
    }
  },
}));

export default useGameStore;
