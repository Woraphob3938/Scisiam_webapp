import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig, isSupabaseConfigured } from "./config";
import type { Database } from "./database.types";

export { isSupabaseConfigured };

export function createClient() {
  const { url, publishableKey } = getSupabaseConfig();
  return createBrowserClient<Database>(url, publishableKey);
}
