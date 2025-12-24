import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL environment variable is required');
}

interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
}

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: 'weekly' | 'monthly';
}

interface Report {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  byCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  recurring: boolean;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        try {
          const token = await SecureStore.getItemAsync('auth_token');
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.warn('Failed to get auth token:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          try {
            await SecureStore.deleteItemAsync('auth_token');
          } catch (deleteError) {
            console.warn('Failed to delete auth token:', deleteError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const message = axiosError.response?.data?.message || axiosError.message || 'An unknown error occurred';
      throw new Error(message);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred');
  }

  async getAll<T>(endpoint: string): Promise<T[]> {
    try {
      const response = await this.client.get<T[]>(endpoint);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getById<T>(endpoint: string, id: string): Promise<T> {
    try {
      const cleanId = id.trim().slice(0, 100);
      const response = await this.client.get<T>(`${endpoint}/${cleanId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async create<T>(endpoint: string, data: Partial<T>): Promise<T> {
    try {
      const response = await this.client.post<T>(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async update<T>(endpoint: string, id: string, data: Partial<T>): Promise<T> {
    try {
      const cleanId = id.trim().slice(0, 100);
      const response = await this.client.put<T>(`${endpoint}/${cleanId}`, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(endpoint: string, id: string): Promise<void> {
    try {
      const cleanId = id.trim().slice(0, 100);
      await this.client.delete(`${endpoint}/${cleanId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const cleanEmail = email.trim().toLowerCase().slice(0, 255);
      const response = await this.client.post<AuthResponse>('/auth/login', {
        email: cleanEmail,
        password,
      });
      
      if (response.data.token) {
        await SecureStore.setItemAsync('auth_token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      try {
        await SecureStore.deleteItemAsync('auth_token');
      } catch (deleteError) {
        console.warn('Failed to delete auth token:', deleteError);
      }
    }
  }

  async getTransactions(params?: { startDate?: string; endDate?: string; type?: 'income' | 'expense' }): Promise<Transaction[]> {
    try {
      const response = await this.client.get<Transaction[]>('/transactions', { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createTransaction(data: Omit<Transaction, 'id'>): Promise<Transaction> {
    try {
      const sanitizedData = {
        ...data,
        description: data.description.trim().slice(0, 500),
        category: data.category.trim().slice(0, 100),
      };
      return await this.create<Transaction>('/transactions', sanitizedData);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction> {
    try {
      const sanitizedData: Partial<Transaction> = { ...data };
      if (data.description) {
        sanitizedData.description = data.description.trim().slice(0, 500);
      }
      if (data.category) {
        sanitizedData.category = data.category.trim().slice(0, 100);
      }
      return await this.update<Transaction>('/transactions', id, sanitizedData);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    try {
      await this.delete('/transactions', id);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getBudgets(): Promise<Budget[]> {
    try {
      return await this.getAll<Budget>('/budgets');
    } catch (error) {
      this.handleError(error);
    }
  }

  async createBudget(data: Omit<Budget, 'id' | 'spent'>): Promise<Budget> {
    try {
      const sanitizedData = {
        ...data,
        category: data.category.trim().slice(0, 100),
      };
      return await this.create<Budget>('/budgets', sanitizedData);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateBudget(id: string, data: Partial<Budget>): Promise<Budget> {
    try {
      const sanitizedData: Partial<Budget> = { ...data };
      if (data.category) {
        sanitizedData.category = data.category.trim().slice(0, 100);
      }
      return await this.update<Budget>('/budgets', id, sanitizedData);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteBudget(id: string): Promise<void> {
    try {
      await this.delete('/budgets', id);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getReports(period: string): Promise<Report> {
    try {
      const cleanPeriod = period.trim().slice(0, 50);
      const response = await this.client.get<Report>('/reports', {
        params: { period: cleanPeriod },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getBills(): Promise<Bill[]> {
    try {
      return await this.getAll<Bill>('/bills');
    } catch (error) {
      this.handleError(error);
    }
  }

  async createBill(data: Omit<Bill, 'id'>): Promise<Bill> {
    try {
      const sanitizedData = {
        ...data,
        name: data.name.trim().slice(0, 200),
      };
      return await this.create<Bill>('/bills', sanitizedData);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateBill(id: string, data: Partial<Bill>): Promise<Bill> {
    try {
      const sanitizedData: Partial<Bill> = { ...data };
      if (data.name) {
        sanitizedData.name = data.name.trim().slice(0, 200);
      }
      return await this.update<Bill>('/bills', id, sanitizedData);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteBill(id: string): Promise<void> {
    try {
      await this.delete('/bills', id);
    } catch (error) {
      this.handleError(error);
    }
  }

  async markBillAsPaid(id: string): Promise<Bill> {
    try {
      const cleanId = id.trim().slice(0, 100);
      const response = await this.client.patch<Bill>(`/bills/${cleanId}/pay`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}

const apiService = new ApiService();
export default apiService;
