import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";

import { supabase, supabaseConfigured } from "./supabase";
import { identify, reset, track } from "./analytics";

type AuthState = {
    session: Session | null;
    previewMode: boolean;
    loading: boolean;
    initialize: () => Promise<void>;
    signInWithEmail: (email: string) => Promise<{ error: string | null }>;
    enterPreview: () => void;
    signOut: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
    session: null,
    previewMode: false,
    loading: true,

    initialize: async () => {
        if (!supabaseConfigured) {
            set({ session: null, loading: false });
            return;
        }
        const { data } = await supabase.auth.getSession();
        set({ session: data.session, loading: false });
        if (data.session?.user.id) {
            identify(data.session.user.id);
        }
        supabase.auth.onAuthStateChange((event, session) => {
            set({ session });
            if (event === "SIGNED_IN" && session?.user.id) {
                identify(session.user.id);
                track("auth_signed_in");
            }
            if (event === "SIGNED_OUT") {
                reset();
                track("auth_signed_out");
            }
        });
    },

    signInWithEmail: async (email: string) => {
        if (!supabaseConfigured) {
            return { error: "Supabase not configured. Tap 'Preview without signing in' instead." };
        }
        const { error } = await supabase.auth.signInWithOtp({ email });
        return { error: error?.message ?? null };
    },

    enterPreview: () => {
        set({ previewMode: true });
        track("preview_mode_entered");
    },

    signOut: async () => {
        set({ previewMode: false });
        await supabase.auth.signOut();
    },
}));
