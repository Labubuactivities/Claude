// Per-language pipeline configuration. The generic driver in run.ts reads
// one of these configs and produces a complete words/senses/examples set
// for that language. Adding a language is writing a new config — no code
// changes elsewhere.

export type Script =
    | "Latin"
    | "Arabic"
    | "Devanagari"
    | "Han"
    | "Hiragana"
    | "Katakana"
    | "Hangul"
    | "Cyrillic";

export type RomanizationScheme =
    | "persian-dmg"          // DMG transliteration for Persian
    | "arabic-bgn"
    | "hindi-iast"
    | "japanese-hepburn"
    | "korean-revised"
    | "russian-bgn"
    | "pinyin"
    | null;                  // null = Latin-script source, no romanization needed

export type LanguagePipelineConfig = {
    code: string;            // ISO 639-1 or BCP-47 tag, matches languages.code
    name_native: string;
    name_english: string;
    script: Script;
    rtl: boolean;
    needs_romanization: boolean;
    romanization_scheme: RomanizationScheme;
    default_voice: string;   // expo-speech identifier

    sources: {
        wiktextract_url: string;
        tatoeba_lang: string;
        frequency_list_url: string;
        loanword_references?: string[];
    };

    // Known origin families that this language's etymology might reference.
    // Used for seeding preset filters and as the LLM origin classifier's
    // closed set.
    origin_families: string[];

    // Quirks/notes for the spot-checker working through the runbook.
    notes?: string;
};
