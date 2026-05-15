import {
    applyFilter,
    emptyFilter,
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
        expect(where).toMatch(/frequency_rank between 1 and 20000/);
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
});
