import { create } from 'zustand';
import type { Asset, Receivable, License } from '../types/inventory';
import {
  getAssets,
  addAsset,
  updateAsset,
  deleteAsset,
} from '../services/assetService';
import {
  getReceivables,
  addReceivable,
  updateReceivable,
  deleteReceivable,
} from '../services/receivableService';
import {
  getLicenses,
  addLicense,
  updateLicense,
  deleteLicense,
} from '../services/licenseService';

interface AppState {
  assets: Asset[];
  receivables: Receivable[];
  licenses: License[];
  loading: boolean;
  error: string | null;
  fetchAllData: () => Promise<void>;
  addAsset: (asset: Omit<Asset, 'id'>, user: string) => Promise<void>;
  updateAsset: (id: string, asset: Partial<Asset>, user: string) => Promise<void>;
  deleteAsset: (id: string, user: string) => Promise<void>;
  addReceivable: (receivable: Omit<Receivable, 'id'>, user: string) => Promise<void>;
  updateReceivable: (id: string, receivable: Partial<Receivable>, user: string) => Promise<void>;
  deleteReceivable: (id: string, user: string) => Promise<void>;
  addLicense: (license: Omit<License, 'id'>, user: string) => Promise<void>;
  updateLicense: (id: string, license: Partial<License>, user: string) => Promise<void>;
  deleteLicense: (id: string, user: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  assets: [],
  receivables: [],
  licenses: [],
  loading: false,
  error: null,
  fetchAllData: async () => {
    set({ loading: true, error: null });
    try {
      const [assets, receivables, licenses] = await Promise.all([
        getAssets(),
        getReceivables(),
        getLicenses(),
      ]);
      set({ assets, receivables, licenses, loading: false });
    } catch (error) {
      set({ error: 'Error fetching data', loading: false });
    }
  },
  addAsset: async (asset, user) => {
    const newAsset = await addAsset(asset, user);
    set((state) => ({ assets: [...state.assets, newAsset] }));
  },
  updateAsset: async (id, asset, user) => {
    await updateAsset(id, asset, user);
    set((state) => ({
      assets: state.assets.map((a) => (a.id === id ? { ...a, ...asset } : a)),
    }));
  },
  deleteAsset: async (id, user) => {
    await deleteAsset(id, user);
    set((state) => ({ assets: state.assets.filter((a) => a.id !== id) }));
  },
  addReceivable: async (receivable, user) => {
    const newReceivable = await addReceivable(receivable, user);
    set((state) => ({ receivables: [...state.receivables, newReceivable] }));
  },
  updateReceivable: async (id, receivable, user) => {
    await updateReceivable(id, receivable, user);
    set((state) => ({
      receivables: state.receivables.map((r) =>
        r.id === id ? { ...r, ...receivable } : r
      ),
    }));
  },
  deleteReceivable: async (id, user) => {
    await deleteReceivable(id, user);
    set((state) => ({
      receivables: state.receivables.filter((r) => r.id !== id),
    }));
  },
  addLicense: async (license, user) => {
    const newLicense = await addLicense(license, user);
    set((state) => ({ licenses: [...state.licenses, newLicense] }));
  },
  updateLicense: async (id, license, user) => {
    await updateLicense(id, license, user);
    set((state) => ({
      licenses: state.licenses.map((l) => (l.id === id ? { ...l, ...license } : l)),
    }));
  },
  deleteLicense: async (id, user) => {
    await deleteLicense(id, user);
    set((state) => ({ licenses: state.licenses.filter((l) => l.id !== id) }));
  },
}));
