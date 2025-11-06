export interface Survivor {
  id: string;
  name: string;
  hp: number;
  skill: {
    name:string;
    description: string;
  };
  status: 'Healthy' | 'Infected';
  locationId: string; // ID ของสถานที่ที่ผู้รอดชีวิตอยู่
  previousLocationId?: string; // For MOVE_TO_PREVIOUS_LOCATION
  personalInventory: Item[]; // ไอเทมในช่องเก็บของส่วนตัว
  buffs: string[];
  debuffs: string[];
}

export interface Location {
  id: string;
  name: string;
  zombieSlots: number;
  searchDeck: string[];
  zombies: number; // จำนวนซอมบี้ปัจจุบัน
  barricades: number; // จำนวนเครื่องกีดขวางปัจจุบัน
  isOverrun: boolean; // สถานที่ถูก overrun หรือไม่
  specialRule?: string;
}

export interface Item {
  id: string;
  name: string;
  type: 'FOOD' | 'MEDICINE' | 'FUEL' | 'JUNK' | 'WEAPON' | 'BARRICADE';
  usable: boolean;
  description: string;
  effect?: {
    action: string;
    value: number;
    target?: string;
    description?: string;
  };
  specialRule?: string;
}

export interface Crisis {
  id: string;
  title: string;
  story: string;
  requirements: { type: string; amount: number }[];
  penalty: {
    type: string;
    value?: any;
    effects?: { type: string; value: any }[];
    effect?: string;
    duration?: number;
  };
  crisisType: 'Physical' | 'Abstract';
}

export interface MainObjective {
  id: string;
  title: string;
  description: string;
  winCondition: {
    type: string;
    value?: number;
    resource?: string;
    requirements?: { type?: string; value?: number; item?: string }[];
    location_id?: string;
    item?: string;
  };
}

export interface CrossroadAction {
  type: string;
  item_type?: string;
  amount?: number;
  item_id?: string;
  location_id?: string;
  value?: any;
  effect?: string;
  cost?: any;
  survivor_id?: string;
  risk_rolls?: number;
  effects?: CrossroadAction[];
  no_morale_loss?: boolean;
  cost_type?: string;
  cost_amount?: number;
  reward_type?: string;
  reward_amount?: number;
  dice_rolls?: number;
  success_effect?: CrossroadAction;
  success_chance?: number;
  success?: CrossroadAction;
  failure?: CrossroadAction;
  rolls?: number;
  reward?: CrossroadAction;
  survivor_ids?: string[];
  types?: string[];
  buff_effect?: string;
  duration?: number;
}

export interface CrossroadRequires {
  type: string;
  value?: string;
  id?: string;
}

export interface CrossroadChoice {
  text: string;
  requires?: CrossroadRequires;
  action: CrossroadAction;
  log: string;
}

export interface CrossroadTrigger {
  type: string;
  value?: string;
  phase?: string;
  condition?: string;
  survivor_id?: string;
  action?: string;
  effect?: string;
}

export interface Crossroad {
  id: string;
  title: string;
  trigger: CrossroadTrigger;
  setup: string;
  choices: CrossroadChoice[];
}
