import { useEffect } from "react";
import { create } from "zustand";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { defaultPrefs, PREFS_BY_KEY, type PrefDef } from "./manifest";

type PrefValue = string | boolean | number;

type PrefsState = {
    global: Record<string, PrefValue>;
    perLanguage: Record<string, Record<string, PrefValue>>;
    hydrated: boolean;
    hydrate: (userId: string | null) => Promise<void>;
    setGlobal: (key: string, value: PrefValue) => Promise<void>;
    setForLanguage: (lang: string, key: string, value: PrefValue) => Promise<void>;
    clearLanguageOverride: (lang: string, key: string) => Promise<void>;
};

export const usePrefsStore = create<PrefsState>((set, get) => ({
    global: defaultPrefs(),
    perLanguage: {},
    hydrated: false,

    hydrate: async (userId) => {
        if (!userId) {
            set({ global: defaultPrefs(), perLanguage: {}, hydrated: true });
            return;
        }
        const [prefsRes, subsRes] = await Promise.all([
            supabase.from("user_prefs").select("prefs").eq("user_id", userId).maybeSingle(),
            supabase
                .from("user_language_subs")
                .select("language_code, language_prefs_override")
                .eq("user_id", userId),
        ]);
        const globalFromDb = (prefsRes.data?.prefs as Record<string, PrefValue> | undefined) ?? {};
        const perLanguage: Record<string, Record<string, PrefValue>> = {};
        for (const row of subsRes.data ?? []) {
            perLanguage[row.language_code] = (row.language_prefs_override ?? {}) as Record<string, PrefValue>;
        }
        set({
            global: { ...defaultPrefs(), ...globalFromDb },
            perLanguage,
            hydrated: true,
        });
    },

    setGlobal: async (key, value) => {
        const next = { ...get().global, [key]: value };
        set({ global: next });
        const userId = useAuth.getState().session?.user.id;
        if (!userId) return;
        await supabase
            .from("user_prefs")
            .upsert({ user_id: userId, prefs: next, updated_at: new Date().toISOString() });
    },

    setForLanguage: async (lang, key, value) => {
        const current = get().perLanguage[lang] ?? {};
        const nextLang = { ...current, [key]: value };
        const nextAll = { ...get().perLanguage, [lang]: nextLang };
        set({ perLanguage: nextAll });
        const userId = useAuth.getState().session?.user.id;
        if (!userId) return;
        await supabase
            .from("user_language_subs")
            .update({ language_prefs_override: nextLang })
            .eq("user_id", userId)
            .eq("language_code", lang);
    },

    clearLanguageOverride: async (lang, key) => {
        const current = get().perLanguage[lang];
        if (!current || !(key in current)) return;
        const { [key]: _removed, ...rest } = current;
        const nextAll = { ...get().perLanguage, [lang]: rest };
        set({ perLanguage: nextAll });
        const userId = useAuth.getState().session?.user.id;
        if (!userId) return;
        await supabase
            .from("user_language_subs")
            .update({ language_prefs_override: rest })
            .eq("user_id", userId)
            .eq("language_code", lang);
    },
}));

export function usePref(key: string, language?: string): PrefValue {
    const def: PrefDef | undefined = PREFS_BY_KEY[key];
    const global = usePrefsStore((s) => s.global);
    const perLanguage = usePrefsStore((s) => s.perLanguage);

    if (!def) return "";

    if (language && def.perLanguage) {
        const override = perLanguage[language]?.[key];
        if (override !== undefined) return override;
    }
    return global[key] ?? def.default;
}

export function useHydratePrefs() {
    const session = useAuth((s) => s.session);
    const hydrate = usePrefsStore((s) => s.hydrate);
    useEffect(() => {
        hydrate(session?.user.id ?? null);
    }, [session?.user.id, hydrate]);
}
