import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const ENCRYPTION_KEY_STORAGE = 'app_encryption_key';
const USER_DATA_STORAGE = 'user_data_encrypted';
const AUTH_TOKEN_STORAGE = 'auth_token';

const generateEncryptionKey = async (): Promise<string> => {
  const existingKey = await SecureStore.getItemAsync(ENCRYPTION_KEY_STORAGE);
  if (existingKey) return existingKey;
  
  const newKey = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${Date.now()}-${Math.random()}`
  );
  await SecureStore.setItemAsync(ENCRYPTION_KEY_STORAGE, newKey);
  return newKey;
};

const encryptData = async (data: string): Promise<string> => {
  const key = await generateEncryptionKey();
  const combined = `${key}:${data}`;
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    combined
  ) + ':' + Buffer.from(data).toString('base64');
};

const decryptData = async (encryptedData: string): Promise<string | null> => {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 2) return null;
    return Buffer.from(parts[1], 'base64').toString('utf-8');
  } catch {
    return null;
  }
};

const saveToSecureStore = async (key: string, value: string, encrypt: boolean = true) => {
  try {
    const dataToStore = encrypt ? await encryptData(value) : value;
    await SecureStore.setItemAsync(key, dataToStore);
  } catch (error) {
    console.warn(`Failed to save ${key} to SecureStore:`, error);
  }
};

const loadFromSecureStore = async (key: string, encrypted: boolean = true): Promise<string | null> => {
  try {
    const data = await SecureStore.getItemAsync(key);
    if (!data) return null;
    return encrypted ? await decryptData(data) : data;
  } catch (error) {
    console.warn(`Failed to load ${key} from SecureStore:`, error);
    return null;
  }
};

const deleteFromSecureStore = async (key: string) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.warn(`Failed to delete ${key} from SecureStore:`, error);
  }
};

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface Budget {
  category: string;
  limit: number;
  spent: number;
}

interface BillReminder {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  recurring: boolean;
  paid: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  transactions: Transaction[];
  budgets: Budget[];
  billReminders: BillReminder[];
  loading: boolean;
  error: string | null;

  setUser: (user: User | null) => Promise<void>;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setBudgets: (budgets: Budget[]) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (category: string, budget: Partial<Budget>) => void;
  deleteBudget: (category: string) => void;
  setBillReminders: (reminders: BillReminder[]) => void;
  addBillReminder: (reminder: BillReminder) => void;
  updateBillReminder: (id: string, reminder: Partial<BillReminder>) => void;
  deleteBillReminder: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => Promise<void>;
  reset: () => void;
  restoreSession: () => Promise<void>;
}

const initialState = {
  isAuthenticated: false,
  user: null,
  transactions: [],
  budgets: [],
  billReminders: [],
  loading: false,
  error: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: async (user) => {
        if (user) {
          await saveToSecureStore(USER_DATA_STORAGE, JSON.stringify(user), true);
        } else {
          await deleteFromSecureStore(USER_DATA_STORAGE);
        }
        set({ user, isAuthenticated: !!user });
      },

      setTransactions: (transactions) => set({ transactions }),

      addTransaction: (transaction) => {
        const { transactions, budgets } = get();
        const newTransactions = [...transactions, transaction];
        
        if (transaction.type === 'expense') {
          const updatedBudgets = budgets.map((budget) =>
            budget.category === transaction.category
              ? { ...budget, spent: budget.spent + transaction.amount }
              : budget
          );
          set({ transactions: newTransactions, budgets: updatedBudgets });
        } else {
          set({ transactions: newTransactions });
        }
      },

      updateTransaction: (id, updatedTransaction) => {
        const { transactions } = get();
        const newTransactions = transactions.map((t) =>
          t.id === id ? { ...t, ...updatedTransaction } : t
        );
        set({ transactions: newTransactions });
      },

      deleteTransaction: (id) => {
        const { transactions, budgets } = get();
        const transaction = transactions.find((t) => t.id === id);
        const newTransactions = transactions.filter((t) => t.id !== id);
        
        if (transaction && transaction.type === 'expense') {
          const updatedBudgets = budgets.map((budget) =>
            budget.category === transaction.category
              ? { ...budget, spent: Math.max(0, budget.spent - transaction.amount) }
              : budget
          );
          set({ transactions: newTransactions, budgets: updatedBudgets });
        } else {
          set({ transactions: newTransactions });
        }
      },

      setBudgets: (budgets) => set({ budgets }),

      addBudget: (budget) => {
        const { budgets } = get();
        set({ budgets: [...budgets, budget] });
      },

      updateBudget: (category, updatedBudget) => {
        const { budgets } = get();
        const newBudgets = budgets.map((b) =>
          b.category === category ? { ...b, ...updatedBudget } : b
        );
        set({ budgets: newBudgets });
      },

      deleteBudget: (category) => {
        const { budgets } = get();
        set({ budgets: budgets.filter((b) => b.category !== category) });
      },

      setBillReminders: (billReminders) => set({ billReminders }),

      addBillReminder: (reminder) => {
        const { billReminders } = get();
        set({ billReminders: [...billReminders, reminder] });
      },

      updateBillReminder: (id, updatedReminder) => {
        const { billReminders } = get();
        const newReminders = billReminders.map((r) =>
          r.id === id ? { ...r, ...updatedReminder } : r
        );
        set({ billReminders: newReminders });
      },

      deleteBillReminder: (id) => {
        const { billReminders } = get();
        set({ billReminders: billReminders.filter((r) => r.id !== id) });
      },

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      logout: async () => {
        await deleteFromSecureStore(AUTH_TOKEN_STORAGE);
        await deleteFromSecureStore(USER_DATA_STORAGE);
        await deleteFromSecureStore(ENCRYPTION_KEY_STORAGE);
        set(initialState);
      },

      reset: () => set(initialState),

      restoreSession: async () => {
        const token = await loadFromSecureStore(AUTH_TOKEN_STORAGE, false);
        const userData = await loadFromSecureStore(USER_DATA_STORAGE, true);
        if (token && userData) {
          try {
            const user = JSON.parse(userData);
            set({ user, isAuthenticated: true });
          } catch (error) {
            console.warn('Failed to parse user data:', error);
          }
        }
      },
    }),
    {
      name: 'gigguard-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        budgets: state.budgets,
        billReminders: state.billReminders,
      }),
    }
  )
);

export default useAppStore;
