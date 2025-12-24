import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Gig {
  id: string;
  name: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface GigState {
  gig: Gig | null;
  loading: boolean;
  error: string | null;
  fetchGig: () => Promise<void>;
  updateGig: (data: Partial<Gig>) => Promise<void>;
  clearGig: () => void;
}

export const useGigStore = create<GigState>()(
  persist(
    (set, get) => ({
      gig: null,
      loading: false,
      error: null,

      fetchGig: async () => {
        set({ loading: true, error: null });
        try {
          // Data is loaded from persisted storage automatically
          await new Promise(resolve => setTimeout(resolve, 100));
          set({ loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load gig',
            loading: false
          });
        }
      },

      updateGig: async (data: Partial<Gig>) => {
        set({ loading: true, error: null });
        try {
          const currentGig = get().gig;
          const updatedGig: Gig = {
            id: data.id ?? currentGig?.id ?? '1',
            name: data.name ?? currentGig?.name ?? '',
            email: data.email ?? currentGig?.email,
            createdAt: currentGig?.createdAt ?? new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set({ gig: updatedGig, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update gig',
            loading: false
          });
        }
      },

      clearGig: () => {
        set({ gig: null, loading: false, error: null });
      },
    }),
    {
      name: 'gig-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ gig: state.gig }),
    }
  )
);
