import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FREE_TIER_LIMITS, hasReachedLimit } from '../config/premiumFeatures';

export interface Gig {
  id: string;
  title: string;
  platform: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'disputed';
  notes?: string;
  clientId?: string;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  isDeductible: boolean;
  receiptUrl?: string;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  totalEarned: number;
  gigsCount: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
  items: { description: string; amount: number }[];
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  type: 'taxes' | 'emergency' | 'custom';
}

interface FinanceState {
  // Data
  gigs: Gig[];
  expenses: Expense[];
  clients: Client[];
  invoices: Invoice[];
  savingsGoals: SavingsGoal[];

  // Loading states
  isLoading: boolean;

  // Premium status (would be set by subscription store)
  isPremium: boolean;

  // Computed values
  totalIncome: number;
  totalExpenses: number;
  estimatedTaxes: number;

  // Gig actions
  addGig: (gig: Omit<Gig, 'id'>) => { success: boolean; requiresUpgrade: boolean };
  updateGig: (id: string, updates: Partial<Gig>) => void;
  deleteGig: (id: string) => void;
  loadGigs: () => Promise<void>;

  // Expense actions
  addExpense: (expense: Omit<Expense, 'id'>) => { success: boolean; requiresUpgrade: boolean };
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Client actions
  addClient: (client: Omit<Client, 'id' | 'totalEarned' | 'gigsCount'>) => { success: boolean; requiresUpgrade: boolean };

  // Invoice actions
  createInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => { success: boolean; requiresUpgrade: boolean };

  // Savings actions
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => { success: boolean; requiresUpgrade: boolean };
  contributeTosavings: (goalId: string, amount: number) => void;

  // Tax calculations (premium)
  calculateQuarterlyTaxes: () => number | null;

  // Stats
  getThisMonthIncome: () => number;
  getThisMonthExpenses: () => number;
  getPendingInvoicesTotal: () => number;

  // Premium check
  setPremium: (isPremium: boolean) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const SELF_EMPLOYMENT_TAX_RATE = 0.153; // 15.3%
const ESTIMATED_INCOME_TAX_RATE = 0.22; // Estimated federal bracket

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      gigs: [],
      expenses: [],
      clients: [],
      invoices: [],
      savingsGoals: [],
      isLoading: false,
      isPremium: false,
      totalIncome: 0,
      totalExpenses: 0,
      estimatedTaxes: 0,

      loadGigs: async () => {
        set({ isLoading: true });
        // Data is loaded from persisted storage automatically
        await new Promise(resolve => setTimeout(resolve, 100));

        // Recalculate totals
        const { gigs, expenses } = get();
        const totalIncome = gigs
          .filter(g => g.status === 'completed')
          .reduce((sum, g) => sum + g.amount, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

        set({
          isLoading: false,
          totalIncome,
          totalExpenses,
          estimatedTaxes: (totalIncome - totalExpenses) * (SELF_EMPLOYMENT_TAX_RATE + ESTIMATED_INCOME_TAX_RATE)
        });
      },

      addGig: (gig) => {
        const { gigs, isPremium } = get();

        if (hasReachedLimit('maxGigs', gigs.length, isPremium)) {
          return { success: false, requiresUpgrade: true };
        }

        const newGig: Gig = { ...gig, id: generateId() };
        const updatedGigs = [...gigs, newGig];
        const totalIncome = updatedGigs
          .filter(g => g.status === 'completed')
          .reduce((sum, g) => sum + g.amount, 0);

        set({ gigs: updatedGigs, totalIncome });
        return { success: true, requiresUpgrade: false };
      },

      updateGig: (id, updates) => {
        const { gigs } = get();
        const updatedGigs = gigs.map(g => g.id === id ? { ...g, ...updates } : g);
        const totalIncome = updatedGigs
          .filter(g => g.status === 'completed')
          .reduce((sum, g) => sum + g.amount, 0);

        set({ gigs: updatedGigs, totalIncome });
      },

      deleteGig: (id) => {
        const { gigs } = get();
        const updatedGigs = gigs.filter(g => g.id !== id);
        const totalIncome = updatedGigs
          .filter(g => g.status === 'completed')
          .reduce((sum, g) => sum + g.amount, 0);

        set({ gigs: updatedGigs, totalIncome });
      },

      addExpense: (expense) => {
        const { expenses, isPremium } = get();
        const thisMonth = new Date().toISOString().slice(0, 7);
        const thisMonthExpenses = expenses.filter(e => e.date.startsWith(thisMonth));

        if (hasReachedLimit('maxExpenses', thisMonthExpenses.length, isPremium)) {
          return { success: false, requiresUpgrade: true };
        }

        const newExpense: Expense = { ...expense, id: generateId() };
        const updatedExpenses = [...expenses, newExpense];
        const totalExpenses = updatedExpenses.reduce((sum, e) => sum + e.amount, 0);

        set({ expenses: updatedExpenses, totalExpenses });
        return { success: true, requiresUpgrade: false };
      },

      updateExpense: (id, updates) => {
        const { expenses } = get();
        const updatedExpenses = expenses.map(e => e.id === id ? { ...e, ...updates } : e);
        const totalExpenses = updatedExpenses.reduce((sum, e) => sum + e.amount, 0);

        set({ expenses: updatedExpenses, totalExpenses });
      },

      deleteExpense: (id) => {
        const { expenses } = get();
        const updatedExpenses = expenses.filter(e => e.id !== id);
        const totalExpenses = updatedExpenses.reduce((sum, e) => sum + e.amount, 0);

        set({ expenses: updatedExpenses, totalExpenses });
      },

      addClient: (client) => {
        const { clients, isPremium } = get();

        if (hasReachedLimit('maxClients', clients.length, isPremium)) {
          return { success: false, requiresUpgrade: true };
        }

        const newClient: Client = { ...client, id: generateId(), totalEarned: 0, gigsCount: 0 };
        set({ clients: [...clients, newClient] });
        return { success: true, requiresUpgrade: false };
      },

      createInvoice: (invoice) => {
        const { invoices, isPremium } = get();
        const thisMonth = new Date().toISOString().slice(0, 7);
        const thisMonthInvoices = invoices.filter(i => i.createdAt.startsWith(thisMonth));

        if (hasReachedLimit('maxInvoicesPerMonth', thisMonthInvoices.length, isPremium)) {
          return { success: false, requiresUpgrade: true };
        }

        const newInvoice: Invoice = {
          ...invoice,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set({ invoices: [...invoices, newInvoice] });
        return { success: true, requiresUpgrade: false };
      },

      addSavingsGoal: (goal) => {
        const { savingsGoals, isPremium } = get();

        if (hasReachedLimit('maxSavingsGoals', savingsGoals.length, isPremium)) {
          return { success: false, requiresUpgrade: true };
        }

        const newGoal: SavingsGoal = { ...goal, id: generateId(), currentAmount: 0 };
        set({ savingsGoals: [...savingsGoals, newGoal] });
        return { success: true, requiresUpgrade: false };
      },

      contributeTosavings: (goalId, amount) => {
        const { savingsGoals } = get();
        const updatedGoals = savingsGoals.map(g =>
          g.id === goalId
            ? { ...g, currentAmount: g.currentAmount + amount }
            : g
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
    }),
    {
      name: 'gigguard-finance-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        gigs: state.gigs,
        expenses: state.expenses,
        clients: state.clients,
        invoices: state.invoices,
        savingsGoals: state.savingsGoals,
      }),
    }
  )
);
