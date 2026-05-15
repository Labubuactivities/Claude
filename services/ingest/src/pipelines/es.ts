import type { LanguagePipelineConfig } from "./_types";

const config: LanguagePipelineConfig = {
    code: "es",
    name_native: "Español",
    name_english: "Spanish",
    script: "Latin",
    rtl: false,
    needs_romanization: false,
    romanization_scheme: null,
    default_voice: "es-ES",

    sources: {
        wiktextract_url: "https://kaikki.org/dictionary/Spanish/kaikki.org-dictionary-Spanish.jsonl.gz",
        tatoeba_lang: "spa",
        frequency_list_url: "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/es/es_full.txt",
    },

    origin_families: [
        "Latin",
        "Greek",
        "Arabic",
        "English",
        "French",
        "Germanic",
        "Nahuatl",
        "Quechua",
        "Catalan",
        "Portuguese",
    ],

    notes: "Spanish uses Latin with ñ and accented vowels. Etymology is mostly Latin via Vulgar Latin, with a notable Arabic stratum (al- prefix) and indigenous-American loans (Nahuatl, Quechua) — the latter make Spanish a good case for surfacing non-European origins in the filter UI.",
};

export default config;
