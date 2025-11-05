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
  personalInventory: Item[]; // ไอเทมในช่องเก็บของส่วนตัว
}

export interface Location {
  id: string;
  name: string;
  zombieSlots: number;
  searchDeck: string[];
  zombies: number; // จำนวนซอมบี้ปัจจุบัน
  barricades: number; // จำนวนเครื่องกีดขวางปัจจุบัน
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
