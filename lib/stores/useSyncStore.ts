import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

interface SyncStoreState {
  syncStatus: SyncStatus;
  user: User | null;
  isOnline: boolean;
  lastSyncedAt: Date | null;
  errorMessage: string | null;
  isAuthModalOpen: boolean;
  isInitialDataPulling: boolean;
  reconnectToast: string | null;

  setSyncStatus: (status: SyncStatus) => void;
  setUser: (user: User | null) => void;
  setIsOnline: (online: boolean) => void;
  setLastSyncedAt: (date: Date | null) => void;
  setErrorMessage: (msg: string | null) => void;
  setAuthModalOpen: (open: boolean) => void;
  setIsInitialDataPulling: (pulling: boolean) => void;
  setReconnectToast: (toast: string | null) => void;
}

export const useSyncStore = create<SyncStoreState>((set) => ({
  syncStatus: 'synced',
  user: null,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  lastSyncedAt: null,
  errorMessage: null,
  isAuthModalOpen: false,
  isInitialDataPulling: false,
  reconnectToast: null,

  setSyncStatus: (syncStatus) => set({ syncStatus }),
  setUser: (user) => set({ user }),
  setIsOnline: (isOnline) => set({ isOnline }),
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  setAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),
  setIsInitialDataPulling: (isInitialDataPulling) => set({ isInitialDataPulling }),
  setReconnectToast: (reconnectToast) => set({ reconnectToast }),
}));
