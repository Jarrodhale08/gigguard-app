import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FREE_TIER_LIMITS, hasReachedLimit } from '../config/premiumFeatures';
import db from '../services/database.service';
import { supabase, getCurrentUserId } from '../services/supabase';

export interface Gig {
  id: string;
  title: string;
  platform: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'disputed';
  notes?: string;
  client_id?: string;
  user_id?: string;
  app_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  is_deductible: boolean;
  receipt_url?: string;
  notes?: string;
  user_id?: string;
  app_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  total_earned: number;
  gigs_count: number;
  user_id?: string;
  app_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Invoice {
  id: string;
  client_id: string;
  client_name: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  due_date: string;
  items: { description: string; amount: number }[];
  user_id?: string;
  app_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  type: 'taxes' | 'emergency' | 'custom';
  user_id?: string;
  app_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface FinanceState {
  // Data
  gigs: Gig[];
  expenses: Expense[];
  clients: Client[];
  invoices: Invoice[];
  savingsGoals: SavingsGoal[];

  // State
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  isAuthenticated: boolean;

  // Premium status
  isPremium: boolean;

  // Computed values
  totalIncome: number;
  totalExpenses: number;
  estimatedTaxes: number;

  // Sync actions
  syncFromServer: () => Promise<void>;
  syncToServer: () => Promise<void>;

  // Gig actions
  addGig: (gig: Omit<Gig, 'id' | 'user_id' | 'app_id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; requiresUpgrade: boolean }>;
  updateGig: (id: string, updates: Partial<Gig>) => Promise<void>;
  deleteGig: (id: string) => Promise<void>;
  loadGigs: () => Promise<void>;

  // Expense actions
  addExpense: (expense: Omit<Expense, 'id' | 'user_id' | 'app_id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; requiresUpgrade: boolean }>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Client actions
  addClient: (client: Omit<Client, 'id' | 'total_earned' | 'gigs_count' | 'user_id' | 'app_id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; requiresUpgrade: boolean }>;

  // Invoice actions
  createInvoice: (invoice: Omit<Invoice, 'id' | 'user_id' | 'app_id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; requiresUpgrade: boolean }>;

  // Savings actions
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'current_amount' | 'user_id' | 'app_id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; requiresUpgrade: boolean }>;
  contributeToSavings: (goalId: string, amount: number) => Promise<void>;

  // Tax calculations (premium)
  calculateQuarterlyTaxes: () => number | null;

  // Stats
  getThisMonthIncome: () => number;
  getThisMonthExpenses: () => number;
  getPendingInvoicesTotal: () => number;

  // Auth/Premium
  setPremium: (isPremium: boolean) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  checkAuthStatus: () => Promise<void>;
}

const SELF_EMPLOYMENT_TAX_RATE = 0.153; // 15.3%
const ESTIMATED_INCOME_TAX_RATE = 0.22; // Estimated federal bracket

const calculateTotals = (gigs: Gig[], expenses: Expense[]) => {
  const totalIncome = gigs
    .filter(g => g.status === 'completed')
    .reduce((sum, g) => sum + g.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const estimatedTaxes = (totalIncome - totalExpenses) * (SELF_EMPLOYMENT_TAX_RATE + ESTIMATED_INCOME_TAX_RATE);
  return { totalIncome, totalExpenses, estimatedTaxes };
};

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      gigs: [],
      expenses: [],
      clients: [],
      invoices: [],
      savingsGoals: [],
      isLoading: false,
      isSyncing: false,
      lastSyncedAt: null,
      isAuthenticated: false,
      isPremium: false,
      totalIncome: 0,
      totalExpenses: 0,
      estimatedTaxes: 0,

      checkAuthStatus: async () => {
        const userId = await getCurrentUserId();
        set({ isAuthenticated: !!userId });
      },

      syncFromServer: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        set({ isSyncing: true });
        try {
          const [gigs, expenses, clients, invoices, savingsGoals] = await Promise.all([
            db.fetchAll<Gig>('gigs', { orderBy: { column: 'created_at', ascending: false } }),
            db.fetchAll<Expense>('expenses', { orderBy: { column: 'date', ascending: false } }),
            db.fetchAll<Client>('clients', { orderBy: { column: 'name', ascending: true } }),
            db.fetchAll<Invoice>('invoices', { orderBy: { column: 'created_at', ascending: false } }),
            db.fetchAll<SavingsGoal>('savings_goals', { orderBy: { column: 'created_at', ascending: false } }),
          ]);

          const totals = calculateTotals(gigs, expenses);

          set({
            gigs,
            expenses,
            clients,
            invoices,
            savingsGoals,
            ...totals,
            lastSyncedAt: new Date().toISOString(),
            isSyncing: false,
          });
        } catch (error) {
          console.error('Sync from server failed:', error);
          set({ isSyncing: false });
        }
      },

      syncToServer: async () => {
        // Data is synced on each operation, this is for manual sync trigger
        await get().syncFromServer();
      },

      loadGigs: async () => {
        set({ isLoading: true });

        const userId = await getCurrentUserId();
        if (userId) {
          // User is authenticated, sync from server
          await get().syncFromServer();
        } else {
          // Local-only mode - just recalculate totals
          const { gigs, expenses } = get();
          const totals = calculateTotals(gigs, expenses);
          set({ ...totals });
        }

        set({ isLoading: false });
      },

      addGig: async (gig) => {
        const { gigs, isPremium } = get();

        if (hasReachedLimit('maxGigs', gigs.length, isPremium)) {
          return { success: false, requiresUpgrade: true };
        }

        const userId = await getCurrentUserId();

        if (userId) {
          // Sync to server
          try {
            const newGig = await db.create<Gig>('gigs', gig);
            const updatedGigs = [newGig, ...gigs];
            const totals = calculateTotals(updatedGigs, get().expenses);
            set({ gigs: updatedGigs, ...totals });
            return { success: true, requiresUpgrade: false };
          } catch (error) {
            console.error('Failed to create gig:', error);
            return { success: false, requiresUpgrade: false };
          }
        } else {
          // Local-only mode
          const newGig: Gig = {
            ...gig,
            id: Math.random().toString(36).substring(2, 15),
            created_at: new Date().toISOString(),
          };
          const updatedGigs = [newGig, ...gigs];
          const totals = calculateTotals(updatedGigs, get().expenses);
          set({ gigs: updatedGigs, ...totals });
          return { success: true, requiresUpgrade: false };
        }
      },

      updateGig: async (id, updates) => {
        const userId = await getCurrentUserId();

        if (userId) {
          try {
            const updatedGig = await db.update<Gig>('gigs', id, updates);
            const updatedGigs = get().gigs.map(g => g.id === id ? updatedGig : g);
            const totals = calculateTotals(updatedGigs, get().expenses);
            set({ gigs: updatedGigs, ...totals });
          } catch (error) {
            console.error('Failed to update gig:', error);
          }
        } else {
          const updatedGigs = get().gigs.map(g => g.id === id ? { ...g, ...updates } : g);
          const totals = calculateTotals(updatedGigs, get().expenses);
          set({ gigs: updatedGigs, ...totals });
        }
      },

      deleteGig: async (id) => {
        const userId = await getCurrentUserId();

        if (userId) {
          try {
            await db.remove('gigs', id);
          } catch (error) {
            console.error('Failed to delete gig:', error);
          }
        }

        const updatedGigs = get().gigs.filter(g => g.id !== id);
        const totals = calculateTotals(updatedGigs, get().expenses);
        set({ gigs: updatedGigs, ...totals });
      },

      addExpense: async (expense) => {
        const { expenses, isPremium } = get();
        const thisMonth = new Date().toISOString().slice(0, 7);
        const thisMonthExpenses = expenses.filter(e => e.date.startsWith(thisMonth));

        if (hasReachedLimit('maxExpenses', thisMonthExpenses.length, isPremium)) {
          return { success: false, requiresUpgrade: true };
        }

        const userId = await getCurrentUserId();

        if (userId) {
          try {
            const newExpense = await db.create<Expense>('expenses', expense);
            const updatedExpenses = [newExpense, ...expenses];
            const totals = calculateTotals(get().gigs, updatedExpenses);
            set({ expenses: updatedExpenses, ...totals });
            return { success: true, requiresUpgrade: false };
          } catch (error) {
            console.error('Failed to create expense:', error);
            return { success: false, requiresUpgrade: false };
          }
        } else {
          const newExpense: Expense = {
            ...expense,
            id: Math.random().toString(36).substring(2, 15),
            created_at: new Date().toISOString(),
          };
          const updatedExpenses = [newExpense, ...expenses];
          const totals = calculateTotals(get().gigs, updatedExpenses);
          set({ expenses: updatedExpenses, ...totals });
          return { success: true, requiresUpgrade: false };
        }
      },

      updateExpense: async (id, updates) => {
        const userId = await getCurrentUserId();

        if (userId) {
          try {
            const updatedExpense = await db.update<Expense>('expenses', id, updates);
            const updatedExpenses = get().expenses.map(e => e.id === id ? updatedExpense : e);
            const totals = calculateTotals(get().gigs, updatedExpenses);
            set({ expenses: updatedExpenses, ...totals });
          } catch (error) {
            console.error('Failed to update expense:', error);
          }
        } else {
          const updatedExpenses = get().expenses.map(e => e.id === id ? { ...e, ...updates } : e);
          const totals = calculateTotals(get().gigs, updatedExpenses);
          set({ expenses: updatedExpenses, ...totals });
        }
      },

      deleteExpense: async (id) => {
        const userId = await getCurrentUserId();

        if (userId) {
          try {
            await db.remove('expenses', id);
          } catch (error) {
            console.error('Failed to delete expense:', error);
          }
        }

        const updatedExpenses = get().expenses.filter(e => e.id !== id);
        const totals = calculateTotals(get().gigs, updatedExpenses);
        set({ expenses: updatedExpenses, ...totals });
      },

      addClient: async (client) => {
        const { clients, isPremium } = get();

        if (hasReachedLimit('maxClients', clients.length, isPremium)) {
          return { success: false, requiresUpgrade: true };
        }

        const userId = await getCurrentUserId();
        const newClientData = { ...client, total_earned: 0, gigs_count: 0 };

        if (userId) {
          try {
            const newClient = await db.create<Client>('clients', newClientData);
            set({ clients: [...clients, newClient] });
            return { success: true, requiresUpgrade: false };
          } catch (error) {
            console.error('Failed to create client:', error);
            return { success: false, requiresUpgrade: false };
          }
        } else {
          const newClient: Client = {
            ...newClientData,
            id: Math.random().toString(36).substring(2, 15),
            created_at: new Date().toISOString(),
          };
          set({ clients: [...clients, newClient] });
          return { success: true, requiresUpgrade: false };
        }
      },

      createInvoice: async (invoice) => {
        const { invoices, isPremium } = get();
        const thisMonth = new Date().toISOString().slice(0, 7);
        const thisMonthInvoices = invoices.filter(i => i.created_at?.startsWith(thisMonth));

        if (hasReachedLimit('maxInvoicesPerMonth', thisMonthInvoices.length, isPremium)) {
          return { success: false, requiresUpgrade: true };
        }

        const userId = await getCurrentUserId();

        if (userId) {
          try {
            const newInvoice = await db.create<Invoice>('invoices', invoice);
            set({ invoices: [newInvoice, ...invoices] });
            return { success: true, requiresUpgrade: false };
          } catch (error) {
            console.error('Failed to create invoice:', error);
            return { success: false, requiresUpgrade: false };
          }
        } else {
          const newInvoice: Invoice = {
            ...invoice,
            id: Math.random().toString(36).substring(2, 15),
            created_at: new Date().toISOString(),
          };
          set({ invoices: [newInvoice, ...invoices] });
          return { success: true, requiresUpgrade: false };
        }
      },

      addSavingsGoal: async (goal) => {
        const { savingsGoals, isPremium } = get();

        if (hasReachedLimit('maxSavingsGoals', savingsGoals.length, isPremium)) {
          return { success: false, requiresUpgrade: true };
        }

        const userId = await getCurrentUserId();
        const goalData = { ...goal, current_amount: 0 };

        if (userId) {
          try {
            const newGoal = await db.create<SavingsGoal>('savings_goals', goalData);
            set({ savingsGoals: [...savingsGoals, newGoal] });
            return { success: true, requiresUpgrade: false };
          } catch (error) {
            console.error('Failed to create savings goal:', error);
            return { success: false, requiresUpgrade: false };
          }
        } else {
          const newGoal: SavingsGoal = {
            ...goalData,
            id: Math.random().toString(36).substring(2, 15),
            created_at: new Date().toISOString(),
          };
          set({ savingsGoals: [...savingsGoals, newGoal] });
          return { success: true, requiresUpgrade: false };
        }
      },

      contributeToSavings: async (goalId, amount) => {
        const { savingsGoals } = get();
        const goal = savingsGoals.find(g => g.id === goalId);
        if (!goal) return;

        const newAmount = goal.current_amount + amount;
        const userId = await getCurrentUserId();

        if (userId) {
          try {
            await db.update<SavingsGoal>('savings_goals', goalId, { current_amount: newAmount });
          } catch (error) {
            console.error('Failed to update savings goal:', error);
          }
        }

        const updatedGoals = savingsGoals.map(g =>
          g.id === goalId ? { ...g, current_amount: newAmount } : g
        );
        set({ savingsGoals: updatedGoals });
      },

      calculateQuarterlyTaxes: () => {
        const { isPremium, totalIncome, totalExpenses } = get();

        if (!isPremium) {
          return null; // Premium feature
        }

        const netIncome = totalIncome - totalExpenses;
        const selfEmploymentTax = netIncome * SELF_EMPLOYMENT_TAX_RATE;
        const estimatedIncomeTax = netIncome * ESTIMATED_INCOME_TAX_RATE;

        return (selfEmploymentTax + estimatedIncomeTax) / 4; // Quarterly
      },

      getThisMonthIncome: () => {
        const { gigs } = get();
        const thisMonth = new Date().toISOString().slice(0, 7);
        return gigs
          .filter(g => g.date.startsWith(thisMonth) && g.status === 'completed')
          .reduce((sum, g) => sum + g.amount, 0);
      },

      getThisMonthExpenses: () => {
        const { expenses } = get();
        const thisMonth = new Date().toISOString().slice(0, 7);
        return expenses
          .filter(e => e.date.startsWith(thisMonth))
          .reduce((sum, e) => sum + e.amount, 0);
      },

      getPendingInvoicesTotal: () => {
        const { invoices } = get();
        return invoices
          .filter(i => i.status === 'sent' || i.status === 'overdue')
          .reduce((sum, i) => sum + i.amount, 0);
      },

      setPremium: (isPremium) => set({ isPremium }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
    }),
    {
      name: 'gigguard-finance-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist as local cache - server is source of truth
        gigs: state.gigs,
        expenses: state.expenses,
        clients: state.clients,
        invoices: state.invoices,
        savingsGoals: state.savingsGoals,
        lastSyncedAt: state.lastSyncedAt,
        isPremium: state.isPremium,
      }),
    }
  )
);
