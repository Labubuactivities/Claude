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
};

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

    return true;
}

export function emptyFilter(): FilterDefinition {
    return {
        origins: { include: [], exclude: [] },
        frequency: { min: 1, max: 20000 },
        abstraction: { min: 0, max: 1 },
        topics: { include: [], exclude: [] },
    };
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

    return { where: clauses.join(" and "), needsOriginsJoin };
}

function escapeSql(s: string): string {
    return s.replace(/'/g, "''");
}
