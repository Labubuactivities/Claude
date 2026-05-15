import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";

import { usePref } from "@/prefs/use-pref";
import { resolveTheme, type Theme } from "./tokens";

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemScheme = useColorScheme();
    const themePref = usePref("theme");
    const accent = usePref("accent");
    const fontSize = usePref("fontSize");

    const theme = useMemo(
        () => resolveTheme(String(themePref), String(accent), String(fontSize), systemScheme ?? null),
        [themePref, accent, fontSize, systemScheme],
    );

    return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
    const t = useContext(ThemeContext);
    if (!t) throw new Error("useTheme must be used inside <ThemeProvider>");
    return t;
}
