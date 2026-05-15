import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";

import { supabase } from "./supabase";
import { identify, reset, track } from "./analytics";

type AuthState = {
    session: Session | null;
    loading: boolean;
    initialize: () => Promise<void>;
    signInWithEmail: (email: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
    session: null,
    loading: true,

    initialize: async () => {
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
        const { error } = await supabase.auth.signInWithOtp({ email });
        return { error: error?.message ?? null };
    },

    signOut: async () => {
        await supabase.auth.signOut();
    },
}));
