import { createBrowserClient } from '@supabase/ssr';

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createBrowserSupabaseClient() {
  // Only initialize in browser, not during SSR
  if (typeof window === 'undefined') {
    return null as any;
  }

  if (supabaseClient) {
    return supabaseClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn('Supabase environment variables not set');
    return null as any;
  }

  supabaseClient = createBrowserClient(url, key);
  return supabaseClient;
}
