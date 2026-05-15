import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import "react-native-url-polyfill/auto";

const extra = (Constants.expoConfig?.extra ?? {}) as {
    supabaseUrl?: string;
    supabaseAnonKey?: string;
};

export const supabaseConfigured = Boolean(extra.supabaseUrl && extra.supabaseAnonKey);

if (!supabaseConfigured) {
    console.warn(
        "Supabase URL/anon key missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your env. Running in preview-only mode.",
    );
}

// Real client when configured; a placeholder client with a fake URL when not,
// so module-level `createClient` doesn't throw and the app can still boot
// in preview mode without a backend.
export const supabase: SupabaseClient = supabaseConfigured
    ? createClient(extra.supabaseUrl!, extra.supabaseAnonKey!, {
          auth: {
              storage: AsyncStorage,
              autoRefreshToken: true,
              persistSession: true,
              detectSessionInUrl: false,
          },
      })
    : createClient("https://placeholder.supabase.co", "placeholder-anon-key", {
          auth: {
              storage: AsyncStorage,
              autoRefreshToken: false,
              persistSession: false,
              detectSessionInUrl: false,
          },
      });
