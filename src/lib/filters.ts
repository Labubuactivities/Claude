import { z } from "zod";

export const FilterDefinitionSchema = z.object({
    origins: z.object({
        include: z.array(z.string()).default([]),
        exclude: z.array(z.string()).default([]),
    }),
    frequency: z.object({
        min: z.number().int().min(1),
        max: z.number().int().min(1),
    }),
    abstraction: z.object({
        min: z.number().min(0).max(1),
        max: z.number().min(0).max(1),
    }),
    topics: z.object({
        include: z.array(z.string()).default([]),
        exclude: z.array(z.string()).default([]),
    }),
    registers: z.object({
        include: z.array(z.string()).default([]),
        exclude: z.array(z.string()).default([]),
    }),
});

export type FilterDefinition = z.infer<typeof FilterDefinitionSchema>;

export type Word = {
    id: number;
    language_code: string;
    lemma_native: string;
    lemma_latin: string;
    frequency_rank: number | null;
    abstraction_score: number | null;
    topic_tags: string[];
    origins: string[];
    registers: string[];
};

export const REGISTERS = [
    "neutral",
    "formal",
    "colloquial",
    "literary",
    "archaic",
    "slang",
    "technical",
] as const;

export type Register = (typeof REGISTERS)[number];

export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2", "native-near"] as const;
export type Level = (typeof LEVELS)[number];

export function applyFilter(def: FilterDefinition, words: Word[]): Word[] {
    return words.filter((w) => matchesFilter(def, w));
}

export function matchesFilter(def: FilterDefinition, w: Word): boolean {
    if (w.frequency_rank !== null) {
        if (w.frequency_rank < def.frequency.min) return false;
        if (w.frequency_rank > def.frequency.max) return false;
    }

    if (w.abstraction_score !== null) {
        if (w.abstraction_score < def.abstraction.min) return false;
        if (w.abstraction_score > def.abstraction.max) return false;
    }

    if (def.origins.include.length > 0) {
        if (!w.origins.some((o) => def.origins.include.includes(o))) return false;
    }
    if (def.origins.exclude.length > 0) {
        if (w.origins.some((o) => def.origins.exclude.includes(o))) return false;
    }

    if (def.topics.include.length > 0) {
        if (!w.topic_tags.some((t) => def.topics.include.includes(t))) return false;
    }
    if (def.topics.exclude.length > 0) {
        if (w.topic_tags.some((t) => def.topics.exclude.includes(t))) return false;
    }

    if (def.registers.include.length > 0) {
        if (!w.registers.some((r) => def.registers.include.includes(r))) return false;
    }
    if (def.registers.exclude.length > 0) {
        if (w.registers.some((r) => def.registers.exclude.includes(r))) return false;
    }

    return true;
}

export function emptyFilter(): FilterDefinition {
    return {
        origins: { include: [], exclude: [] },
        frequency: { min: 1, max: 50000 },
        abstraction: { min: 0, max: 1 },
        topics: { include: [], exclude: [] },
        registers: { include: [], exclude: [] },
    };
}

// Suggest a starting filter based on a learner's self-reported level. Used
// during onboarding and as the default when "Reset to my level" is tapped in
// the composer.
export function filterForLevel(level: Level): FilterDefinition {
    const base = emptyFilter();
    switch (level) {
        case "A1":
            return { ...base, frequency: { min: 1, max: 1500 }, abstraction: { min: 0, max: 0.45 } };
        case "A2":
            return { ...base, frequency: { min: 1, max: 3000 }, abstraction: { min: 0, max: 0.6 } };
        case "B1":
            return { ...base, frequency: { min: 500, max: 8000 } };
        case "B2":
            return { ...base, frequency: { min: 2000, max: 15000 } };
        case "C1":
            return { ...base, frequency: { min: 5000, max: 30000 } };
        case "C2":
            return {
                ...base,
                frequency: { min: 10000, max: 50000 },
                registers: { include: ["literary", "formal"], exclude: [] },
            };
        case "native-near":
            return {
                ...base,
                frequency: { min: 15000, max: 50000 },
                registers: { include: ["literary", "archaic", "technical"], exclude: [] },
            };
    }
}

// Translate a FilterDefinition to a SQL WHERE clause fragment for the scheduler
// and any server-side query. Returns a Postgres-compatible expression that
// assumes `words w` is in scope, plus a left join to `word_etymology_origins eo`
// when origin filters are active.
export function filterToSql(def: FilterDefinition): {
    where: string;
    needsOriginsJoin: boolean;
} {
    const clauses: string[] = [];
    let needsOriginsJoin = false;

    clauses.push(`w.frequency_rank between ${def.frequency.min} and ${def.frequency.max}`);
    clauses.push(`w.abstraction_score between ${def.abstraction.min} and ${def.abstraction.max}`);

    if (def.origins.include.length > 0) {
        needsOriginsJoin = true;
        const list = def.origins.include.map((o) => `'${escapeSql(o)}'`).join(", ");
        clauses.push(`exists (select 1 from word_etymology_origins eoi where eoi.word_id = w.id and eoi.origin_family in (${list}))`);
    }
    if (def.origins.exclude.length > 0) {
        const list = def.origins.exclude.map((o) => `'${escapeSql(o)}'`).join(", ");
        clauses.push(`not exists (select 1 from word_etymology_origins eoe where eoe.word_id = w.id and eoe.origin_family in (${list}))`);
    }

    if (def.topics.include.length > 0) {
        const list = `array[${def.topics.include.map((t) => `'${escapeSql(t)}'`).join(", ")}]::text[]`;
        clauses.push(`w.topic_tags && ${list}`);
    }
    if (def.topics.exclude.length > 0) {
        const list = `array[${def.topics.exclude.map((t) => `'${escapeSql(t)}'`).join(", ")}]::text[]`;
        clauses.push(`not (w.topic_tags && ${list})`);
    }

    if (def.registers.include.length > 0) {
        const list = def.registers.include.map((r) => `'${escapeSql(r)}'`).join(", ");
        clauses.push(`exists (select 1 from senses si where si.word_id = w.id and si.register in (${list}))`);
    }
    if (def.registers.exclude.length > 0) {
        const list = def.registers.exclude.map((r) => `'${escapeSql(r)}'`).join(", ");
        clauses.push(`not exists (select 1 from senses se where se.word_id = w.id and se.register in (${list}))`);
    }

    return { where: clauses.join(" and "), needsOriginsJoin };
}

function escapeSql(s: string): string {
    return s.replace(/'/g, "''");
}
