import { create } from 'zustand';

export interface Farm {
  id: string;
  name: string;
  area_acres?: number;
  lat: number;
  lng: number;
  state?: string;
  district?: string;
  village?: string;
  soil_type?: string;
  irrigation_type?: string;
}

interface FarmState {
  farmsList: Farm[];
  activeFarm: Farm | null;
  setFarms: (farms: Farm[]) => void;
  setActiveFarm: (farm: Farm) => void;
  addFarm: (farm: Farm) => void;
}

export const useFarmStore = create<FarmState>((set) => ({
  farmsList: [],
  activeFarm: null,
  setFarms: (farms) => {
    // If setting farms and no active farm is selected, default to the first one
    set((state) => ({ 
      farmsList: farms,
      activeFarm: state.activeFarm || (farms.length > 0 ? farms[0] : null)
    }));
  },
  setActiveFarm: (farm) => set({ activeFarm: farm }),
  addFarm: (farm) => set((state) => ({ 
    farmsList: [...state.farmsList, farm],
    activeFarm: state.activeFarm || farm
  }))
}));
