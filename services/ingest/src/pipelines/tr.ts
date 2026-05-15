import type { LanguagePipelineConfig } from "./_types";

const config: LanguagePipelineConfig = {
    code: "tr",
    name_native: "Türkçe",
    name_english: "Turkish",
    script: "Latin",
    rtl: false,
    needs_romanization: false,
    romanization_scheme: null,
    default_voice: "tr-TR",

    sources: {
        wiktextract_url: "https://kaikki.org/dictionary/Turkish/kaikki.org-dictionary-Turkish.jsonl.gz",
        tatoeba_lang: "tur",
        frequency_list_url: "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/tr/tr_full.txt",
    },

    origin_families: [
        "Turkic",
        "Arabic",
        "Persian",
        "French",
        "Italian",
        "Greek",
        "Mongolian",
        "English",
        "Armenian",
    ],

    notes: "Turkish uses Latin with ç, ğ, ı, İ, ö, ş, ü. The dotted/dotless i pair (i/ı, İ/I) must be normalized carefully — naive lowercase breaks both. Etymology heavily layered: pre-1923 Ottoman vocabulary has large Arabic + Persian + French strata; post-reform Turkic-rooted Öztürkçe replacements are well documented in Wiktionary.",
};

export default config;
