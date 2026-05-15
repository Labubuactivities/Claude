// Single source of truth for all user-togglable preferences. The settings
// screen, the usePref() hook, persistence, and sync all read from here.
// Adding a preference is one entry — no screen edits required.

export type PrefDef =
    | {
          key: string;
          kind: "enum";
          group: PrefGroup;
          label: string;
          help?: string;
          options: { value: string; label: string }[];
          default: string;
          perLanguage?: boolean;
      }
    | {
          key: string;
          kind: "boolean";
          group: PrefGroup;
          label: string;
          help?: string;
          default: boolean;
          perLanguage?: boolean;
      }
    | {
          key: string;
          kind: "number";
          group: PrefGroup;
          label: string;
          help?: string;
          min: number;
          max: number;
          step: number;
          default: number;
          perLanguage?: boolean;
      };

export type PrefGroup = "appearance" | "linguistic" | "behavior" | "notifications";

export const PREFS_MANIFEST: PrefDef[] = [
    // -------------------- Learning --------------------
    {
        key: "level",
        kind: "enum",
        group: "linguistic",
        label: "Your level",
        help: "Drives the default filter and which presets surface first. Adjust any time — the app serves everyone from absolute beginner to near-native.",
        options: [
            { value: "A1", label: "A1 — Beginner" },
            { value: "A2", label: "A2 — Elementary" },
            { value: "B1", label: "B1 — Intermediate" },
            { value: "B2", label: "B2 — Upper-intermediate" },
            { value: "C1", label: "C1 — Advanced" },
            { value: "C2", label: "C2 — Proficient" },
            { value: "native-near", label: "Native-near refinement" },
        ],
        default: "B1",
        perLanguage: true,
    },

    // -------------------- Appearance --------------------
    {
        key: "theme",
        kind: "enum",
        group: "appearance",
        label: "Theme",
        options: [
            { value: "system", label: "Match system" },
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "sepia", label: "Sepia" },
            { value: "high-contrast", label: "High contrast" },
        ],
        default: "system",
    },
    {
        key: "accent",
        kind: "enum",
        group: "appearance",
        label: "Accent color",
        options: [
            { value: "indigo", label: "Indigo" },
            { value: "emerald", label: "Emerald" },
            { value: "amber", label: "Amber" },
            { value: "rose", label: "Rose" },
            { value: "slate", label: "Slate" },
        ],
        default: "indigo",
    },
    {
        key: "fontSize",
        kind: "enum",
        group: "appearance",
        label: "Font size",
        options: [
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
            { value: "xl", label: "Extra large" },
        ],
        default: "md",
    },
    {
        key: "reduceMotion",
        kind: "boolean",
        group: "appearance",
        label: "Reduce motion",
        help: "Collapses animated transitions.",
        default: false,
    },

    // -------------------- Linguistic --------------------
    {
        key: "showLatin",
        kind: "boolean",
        group: "linguistic",
        label: "Show Latin romanization",
        help: "Display a romanized form under non-Latin scripts.",
        default: true,
        perLanguage: true,
    },
    {
        key: "showIPA",
        kind: "boolean",
        group: "linguistic",
        label: "Show phonetic (IPA)",
        help: "Display the IPA pronunciation under each word.",
        default: true,
        perLanguage: true,
    },
    {
        key: "showOriginBadges",
        kind: "boolean",
        group: "linguistic",
        label: "Show etymology origin badges",
        default: true,
        perLanguage: true,
    },
    {
        key: "notifScriptStyle",
        kind: "enum",
        group: "linguistic",
        label: "Notification script style",
        options: [
            { value: "native", label: "Native script only" },
            { value: "latin", label: "Latin only" },
            { value: "both", label: "Both stacked" },
        ],
        default: "both",
        perLanguage: true,
    },
    {
        key: "diacritics",
        kind: "enum",
        group: "linguistic",
        label: "Diacritics (Persian/Arabic)",
        options: [
            { value: "always", label: "Always show" },
            { value: "examples", label: "In example sentences only" },
            { value: "never", label: "Never show" },
        ],
        default: "examples",
        perLanguage: true,
    },

    // -------------------- Behavior --------------------
    {
        key: "browseSort",
        kind: "enum",
        group: "behavior",
        label: "Default browse sort",
        options: [
            { value: "frequency", label: "Frequency" },
            { value: "random", label: "Random" },
            { value: "abstraction", label: "Abstraction (concrete → abstract)" },
        ],
        default: "frequency",
    },
    {
        key: "autoPlayTTS",
        kind: "boolean",
        group: "behavior",
        label: "Auto-play pronunciation",
        help: "Play TTS when a word card opens.",
        default: false,
    },
    {
        key: "swipeDirection",
        kind: "enum",
        group: "behavior",
        label: "Card swipe direction",
        options: [
            { value: "auto", label: "Follow text direction" },
            { value: "ltr", label: "Left → right" },
            { value: "rtl", label: "Right → left" },
        ],
        default: "auto",
        perLanguage: true,
    },
];

export const PREFS_BY_KEY: Record<string, PrefDef> = Object.fromEntries(
    PREFS_MANIFEST.map((p) => [p.key, p]),
);

export function defaultPrefs(): Record<string, string | boolean | number> {
    return Object.fromEntries(PREFS_MANIFEST.map((p) => [p.key, p.default]));
}
