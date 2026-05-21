import {
    applyFilter,
    emptyFilter,
    filterForLevel,
    filterToSql,
    matchesFilter,
    type Word,
} from "../filters";

const persianBook: Word = {
    id: 1,
    language_code: "fa",
    lemma_native: "کتاب",
    lemma_latin: "ketâb",
    frequency_rank: 50,
    abstraction_score: 0.2,
    topic_tags: ["education"],
    origins: ["Arabic"],
    registers: ["neutral"],
};

const persianHouse: Word = {
    id: 2,
    language_code: "fa",
    lemma_native: "خانه",
    lemma_latin: "xâne",
    frequency_rank: 100,
    abstraction_score: 0.1,
    topic_tags: ["home"],
    origins: ["Iranian"],
    registers: ["neutral", "colloquial"],
};

const persianRareLiterary: Word = {
    id: 3,
    language_code: "fa",
    lemma_native: "ژرف‌نگری",
    lemma_latin: "žarf-negari",
    frequency_rank: 18000,
    abstraction_score: 0.85,
    topic_tags: ["thought"],
    origins: ["Iranian"],
    registers: ["literary"],
};

describe("applyFilter", () => {
    test("empty filter matches all words within default ranges", () => {
        const def = emptyFilter();
        expect(applyFilter(def, [persianBook, persianHouse])).toHaveLength(2);
    });

    test("excludes Arabic origin", () => {
        const def = emptyFilter();
        def.origins.exclude = ["Arabic"];
        const result = applyFilter(def, [persianBook, persianHouse]);
        expect(result.map((w) => w.id)).toEqual([2]);
    });

    test("includes Iranian origin only", () => {
        const def = emptyFilter();
        def.origins.include = ["Iranian"];
        const result = applyFilter(def, [persianBook, persianHouse]);
        expect(result.map((w) => w.id)).toEqual([2]);
    });

    test("frequency band filters", () => {
        const def = emptyFilter();
        def.frequency = { min: 1, max: 75 };
        expect(applyFilter(def, [persianBook, persianHouse]).map((w) => w.id)).toEqual([1]);
    });

    test("abstraction band filters", () => {
        const def = emptyFilter();
        def.abstraction = { min: 0, max: 0.15 };
        expect(applyFilter(def, [persianBook, persianHouse]).map((w) => w.id)).toEqual([2]);
    });

    test("topic exclude filters", () => {
        const def = emptyFilter();
        def.topics.exclude = ["education"];
        expect(applyFilter(def, [persianBook, persianHouse]).map((w) => w.id)).toEqual([2]);
    });

    test("register include narrows to literary advanced words", () => {
        const def = emptyFilter();
        def.registers.include = ["literary"];
        const result = applyFilter(def, [persianBook, persianHouse, persianRareLiterary]);
        expect(result.map((w) => w.id)).toEqual([3]);
    });

    test("register exclude drops colloquial entries", () => {
        const def = emptyFilter();
        def.registers.exclude = ["colloquial"];
        const result = applyFilter(def, [persianBook, persianHouse, persianRareLiterary]);
        expect(result.map((w) => w.id)).toEqual([1, 3]);
    });
});

describe("filterForLevel", () => {
    test("A1 keeps the band tight and concrete", () => {
        const def = filterForLevel("A1");
        expect(def.frequency.max).toBe(1500);
        expect(def.abstraction.max).toBeLessThanOrEqual(0.5);
    });

    test("C2 surfaces long-tail vocabulary and literary register", () => {
        const def = filterForLevel("C2");
        expect(def.frequency.min).toBeGreaterThanOrEqual(10000);
        expect(def.registers.include).toContain("literary");
    });

    test("matches the right words by level", () => {
        const a1 = filterForLevel("A1");
        const c1 = filterForLevel("C1");
        expect(matchesFilter(a1, persianHouse)).toBe(true);
        expect(matchesFilter(a1, persianRareLiterary)).toBe(false);
        expect(matchesFilter(c1, persianRareLiterary)).toBe(true);
    });
});

describe("matchesFilter", () => {
    test("origin include + exclude evaluated together", () => {
        const def = emptyFilter();
        def.origins.include = ["Iranian"];
        def.origins.exclude = ["Arabic"];
        expect(matchesFilter(def, persianHouse)).toBe(true);
        expect(matchesFilter(def, persianBook)).toBe(false);
    });
});

describe("filterToSql", () => {
    test("emits frequency + abstraction by default", () => {
        const { where, needsOriginsJoin } = filterToSql(emptyFilter());
        expect(where).toMatch(/frequency_rank between 1 and 50000/);
        expect(where).toMatch(/abstraction_score between 0 and 1/);
        expect(needsOriginsJoin).toBe(false);
    });

    test("flags origin include and emits exists subquery", () => {
        const def = emptyFilter();
        def.origins.include = ["Iranian"];
        def.origins.exclude = ["Arabic"];
        const { where, needsOriginsJoin } = filterToSql(def);
        expect(needsOriginsJoin).toBe(true);
        expect(where).toMatch(/exists \(select 1 from word_etymology_origins eoi.*'Iranian'/);
        expect(where).toMatch(/not exists \(select 1 from word_etymology_origins eoe.*'Arabic'/);
    });

    test("escapes single quotes in origin family names", () => {
        const def = emptyFilter();
        def.origins.include = ["O'Hara"];
        const { where } = filterToSql(def);
        expect(where).toContain("'O''Hara'");
    });

    test("register filters reference the senses table", () => {
        const def = emptyFilter();
        def.registers.include = ["literary", "formal"];
        def.registers.exclude = ["slang"];
        const { where } = filterToSql(def);
        expect(where).toMatch(/exists \(select 1 from senses si.*'literary'.*'formal'/);
        expect(where).toMatch(/not exists \(select 1 from senses se.*'slang'/);
    });
});
