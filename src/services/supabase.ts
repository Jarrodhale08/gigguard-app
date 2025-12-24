import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// App ID for multi-tenant isolation
export const APP_ID = process.env.EXPO_PUBLIC_APP_ID || 'gigguard';

// Custom storage adapter using SecureStore for auth tokens
const SecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('SecureStore setItem error:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
    }
  },
};

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Initialize app context for the current user
 * Creates/updates user_app_context to track which apps a user has accessed
 */
export async function initializeAppContext(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Upsert user_app_context
    await supabase.from('user_app_context').upsert(
      {
        user_id: user.id,
        app_id: APP_ID,
        last_accessed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,app_id' }
    );

    // Ensure profile exists
    await supabase.from('profiles').upsert(
      {
        id: user.id,
        email: user.email,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  } catch (error) {
    console.error('Failed to initialize app context:', error);
  }
}

/**
 * Get app-specific storage bucket name
 */
export function getAppBucket(bucketType: 'avatars' | 'receipts' | 'uploads'): string {
  return `${APP_ID}-${bucketType}`;
}

/**
 * Get current authenticated user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

export default supabase;
