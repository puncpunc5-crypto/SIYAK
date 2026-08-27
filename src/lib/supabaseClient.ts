import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'supabase_url_v1';
const STORAGE_KEY_KEY = 'supabase_anon_key_v1';

export function getStoredSupabaseConfig() {
  const url = localStorage.getItem(STORAGE_URL_KEY) || '';
  const key = localStorage.getItem(STORAGE_KEY_KEY) || '';
  return { url, key };
}

export function saveSupabaseConfig(url: string, key: string) {
  localStorage.setItem(STORAGE_URL_KEY, url.trim());
  localStorage.setItem(STORAGE_KEY_KEY, key.trim());
  cachedClient = null; // force reload client
}

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getStoredSupabaseConfig();
  if (!url || !key) {
    return null;
  }
  if (!cachedClient || cachedUrl !== url || cachedKey !== key) {
    try {
      cachedClient = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      cachedUrl = url;
      cachedKey = key;
    } catch (e) {
      console.error('Failed to initialize Supabase client', e);
      return null;
    }
  }
  return cachedClient;
}
