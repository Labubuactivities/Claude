export type ThemeName = "light" | "dark" | "sepia" | "high-contrast";

export type Theme = {
    name: ThemeName;
    colors: {
        bg: string;
        bgElevated: string;
        surface: string;
        border: string;
        textPrimary: string;
        textSecondary: string;
        textMuted: string;
        accent: string;
        accentOn: string;
        danger: string;
        success: string;
    };
    radii: { sm: number; md: number; lg: number; xl: number };
    spacing: (n: number) => number;
    fontScale: number;
};

export type AccentName = "indigo" | "emerald" | "amber" | "rose" | "slate";

const ACCENTS: Record<AccentName, string> = {
    indigo: "#6366f1",
    emerald: "#10b981",
    amber: "#f59e0b",
    rose: "#f43f5e",
    slate: "#64748b",
};

export type FontSizeName = "sm" | "md" | "lg" | "xl";
const FONT_SCALES: Record<FontSizeName, number> = {
    sm: 0.9,
    md: 1.0,
    lg: 1.15,
    xl: 1.3,
};

function makeTheme(name: ThemeName, accent: AccentName, fontSize: FontSizeName): Theme {
    const accentColor = ACCENTS[accent];
    const fontScale = FONT_SCALES[fontSize];
    const radii = { sm: 6, md: 10, lg: 14, xl: 20 };
    const spacing = (n: number) => n * 4;

    if (name === "dark") {
        return {
            name,
            colors: {
                bg: "#0b0d12",
                bgElevated: "#13161d",
                surface: "#1a1e27",
                border: "#262b36",
                textPrimary: "#e7e9ee",
                textSecondary: "#a8adb8",
                textMuted: "#6b7180",
                accent: accentColor,
                accentOn: "#ffffff",
                danger: "#f43f5e",
                success: "#10b981",
            },
            radii,
            spacing,
            fontScale,
        };
    }

    if (name === "sepia") {
        return {
            name,
            colors: {
                bg: "#f5ecd9",
                bgElevated: "#efe3c4",
                surface: "#ebdcb7",
                border: "#d9c79b",
                textPrimary: "#3a2e1c",
                textSecondary: "#6b5839",
                textMuted: "#8b7754",
                accent: accentColor,
                accentOn: "#ffffff",
                danger: "#b91c1c",
                success: "#15803d",
            },
            radii,
            spacing,
            fontScale,
        };
    }

    if (name === "high-contrast") {
        return {
            name,
            colors: {
                bg: "#000000",
                bgElevated: "#0a0a0a",
                surface: "#141414",
                border: "#ffffff",
                textPrimary: "#ffffff",
                textSecondary: "#ffffff",
                textMuted: "#cccccc",
                accent: "#ffff00",
                accentOn: "#000000",
                danger: "#ff5555",
                success: "#55ff55",
            },
            radii,
            spacing,
            fontScale: Math.max(fontScale, 1.0),
        };
    }

    return {
        name: "light",
        colors: {
            bg: "#ffffff",
            bgElevated: "#f7f8fa",
            surface: "#eef0f4",
            border: "#dbdfe6",
            textPrimary: "#0b0d12",
            textSecondary: "#3f4654",
            textMuted: "#6b7180",
            accent: accentColor,
            accentOn: "#ffffff",
            danger: "#dc2626",
            success: "#059669",
        },
        radii,
        spacing,
        fontScale,
    };
}

export function resolveTheme(
    themePref: string,
    accent: string,
    fontSize: string,
    systemScheme: "light" | "dark" | null,
): Theme {
    const resolvedName: ThemeName =
        themePref === "system"
            ? systemScheme === "dark"
                ? "dark"
                : "light"
            : (themePref as ThemeName);

    const safeAccent = (Object.keys(ACCENTS) as AccentName[]).includes(accent as AccentName)
        ? (accent as AccentName)
        : "indigo";

    const safeFontSize = (Object.keys(FONT_SCALES) as FontSizeName[]).includes(fontSize as FontSizeName)
        ? (fontSize as FontSizeName)
        : "md";

    return makeTheme(resolvedName, safeAccent, safeFontSize);
}
