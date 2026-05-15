import { useQuery } from "@tanstack/react-query";

import { supabase } from "./supabase";

export type Language = {
    code: string;
    name_native: string;
    name_english: string;
    script: string;
    rtl: boolean;
    default_voice: string | null;
    default_romanization_scheme: string | null;
    enabled: boolean;
    sort_order: number;
};

export function useLanguages() {
    return useQuery({
        queryKey: ["languages"],
        queryFn: async (): Promise<Language[]> => {
            const { data, error } = await supabase
                .from("languages")
                .select("*")
                .eq("enabled", true)
                .order("sort_order", { ascending: true });
            if (error) throw error;
            return data ?? [];
        },
        staleTime: 1000 * 60 * 60,
    });
}

export function isNonLatinScript(script: string): boolean {
    return script !== "Latin";
}
