import { supabase, APP_ID, getCurrentUserId } from './supabase';

// Tables that are shared across all apps (no app_id filtering)
const SHARED_TABLES = ['profiles', 'app_registry', 'user_app_context'];

interface QueryOptions {
  skipAppFilter?: boolean;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
}

/**
 * Fetch all records from a table with automatic app_id filtering
 */
export async function fetchAll<T>(
  table: string,
  options: QueryOptions = {}
): Promise<T[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  let query = supabase.from(table).select('*').eq('user_id', userId);

  // Auto-filter by app_id unless it's a shared table
  if (APP_ID && !options.skipAppFilter && !SHARED_TABLES.includes(table)) {
    query = query.eq('app_id', APP_ID);
  }

  if (options.orderBy) {
    query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true });
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Fetch a single record by ID
 */
export async function fetchById<T>(
  table: string,
  id: string,
  options: QueryOptions = {}
): Promise<T | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  let query = supabase.from(table).select('*').eq('id', id).eq('user_id', userId);

  if (APP_ID && !options.skipAppFilter && !SHARED_TABLES.includes(table)) {
    query = query.eq('app_id', APP_ID);
  }

  const { data, error } = await query.single();
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

/**
 * Create a new record with automatic app_id and user_id
 */
export async function create<T>(
  table: string,
  record: Partial<T>,
  options: QueryOptions = {}
): Promise<T> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  // Auto-add user_id and app_id
  const recordWithIds: Record<string, unknown> = {
    ...record,
    user_id: userId,
  };

  // Add app_id unless it's a shared table
  if (APP_ID && !options.skipAppFilter && !SHARED_TABLES.includes(table)) {
    recordWithIds.app_id = APP_ID;
  }

  const { data, error } = await supabase
    .from(table)
    .insert(recordWithIds)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing record
 */
export async function update<T>(
  table: string,
  id: string,
  updates: Partial<T>,
  options: QueryOptions = {}
): Promise<T> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  let query = supabase
    .from(table)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId);

  if (APP_ID && !options.skipAppFilter && !SHARED_TABLES.includes(table)) {
    query = query.eq('app_id', APP_ID);
  }

  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
}

/**
 * Delete a record
 */
export async function remove(
  table: string,
  id: string,
  options: QueryOptions = {}
): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  let query = supabase
    .from(table)
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (APP_ID && !options.skipAppFilter && !SHARED_TABLES.includes(table)) {
    query = query.eq('app_id', APP_ID);
  }

  const { error } = await query;
  if (error) throw error;
}

/**
 * Upsert a record (insert or update)
 */
export async function upsert<T>(
  table: string,
  record: Partial<T> & { id?: string },
  options: QueryOptions & { onConflict?: string } = {}
): Promise<T> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const recordWithIds: Record<string, unknown> = {
    ...record,
    user_id: userId,
    updated_at: new Date().toISOString(),
  };

  if (APP_ID && !options.skipAppFilter && !SHARED_TABLES.includes(table)) {
    recordWithIds.app_id = APP_ID;
  }

  const { data, error } = await supabase
    .from(table)
    .upsert(recordWithIds, { onConflict: options.onConflict })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Batch create multiple records
 */
export async function batchCreate<T>(
  table: string,
  records: Partial<T>[],
  options: QueryOptions = {}
): Promise<T[]> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const recordsWithIds = records.map(record => {
    const r: Record<string, unknown> = { ...record, user_id: userId };
    if (APP_ID && !options.skipAppFilter && !SHARED_TABLES.includes(table)) {
      r.app_id = APP_ID;
    }
    return r;
  });

  const { data, error } = await supabase
    .from(table)
    .insert(recordsWithIds)
    .select();

  if (error) throw error;
  return data || [];
}

export default {
  fetchAll,
  fetchById,
  create,
  update,
  remove,
  upsert,
  batchCreate,
};
