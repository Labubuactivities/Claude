import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import "react-native-url-polyfill/auto";

const extra = (Constants.expoConfig?.extra ?? {}) as {
    supabaseUrl?: string;
    supabaseAnonKey?: string;
};

if (!extra.supabaseUrl || !extra.supabaseAnonKey) {
    console.warn(
        "Supabase URL/anon key missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your env.",
    );
}

export const supabase = createClient(extra.supabaseUrl ?? "", extra.supabaseAnonKey ?? "", {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
