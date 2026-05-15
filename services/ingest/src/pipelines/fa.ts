import type { LanguagePipelineConfig } from "./_types";

const config: LanguagePipelineConfig = {
    code: "fa",
    name_native: "فارسی",
    name_english: "Persian",
    script: "Arabic",
    rtl: true,
    needs_romanization: true,
    romanization_scheme: "persian-dmg",
    default_voice: "fa-IR",

    sources: {
        wiktextract_url: "https://kaikki.org/dictionary/Persian/kaikki.org-dictionary-Persian.jsonl.gz",
        tatoeba_lang: "pes",
        frequency_list_url: "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/fa/fa_full.txt",
    },

    origin_families: [
        "Iranian",
        "Arabic",
        "Turkic",
        "Mongolian",
        "French",
        "English",
        "Russian",
        "Greek",
        "Aramaic",
    ],

    notes: "Persian uses the Arabic script with extra letters (پ چ ژ گ). Diacritics are usually omitted in writing. Romanization uses the DMG scheme derived from IPA; preserve ezafe in inflections.",
};

export default config;
