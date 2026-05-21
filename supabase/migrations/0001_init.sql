-- v0.1 init schema for the multilingual word app.
-- Content tables are read-mostly and language-agnostic from day 1.
-- User tables are RLS-protected on user_id = auth.uid().

create extension if not exists pg_trgm;
create extension if not exists unaccent;

-- =====================================================================
-- Language registry. Adding a language is a row + an OTA cache bust.
-- =====================================================================

create table languages (
    code text primary key,
    name_native text not null,
    name_english text not null,
    script text not null,                          -- 'Latin' | 'Arabic' | 'Devanagari' | ...
    rtl boolean not null default false,
    default_voice text,                            -- expo-speech voice identifier
    default_romanization_scheme text,              -- 'persian-dmg' | 'turkish-iso9' | null for Latin-script
    enabled boolean not null default false,
    sort_order int not null default 0,
    added_at timestamptz not null default now()
);

-- =====================================================================
-- Content tables.
-- =====================================================================

create table words (
    id bigserial primary key,
    language_code text not null references languages(code),
    lemma_native text not null,                    -- original script
    lemma_latin text not null,                     -- deterministic romanization (== lemma_native for Latin-script langs)
    pos text,
    ipa text,
    frequency_rank int,
    abstraction_score real,
    utility_score real,
    topic_tags text[] not null default '{}',
    source_version text not null,
    created_at timestamptz not null default now(),
    unique (language_code, lemma_native, pos)
);

create index words_lang_freq_idx on words (language_code, frequency_rank);
create index words_topic_tags_gin on words using gin (topic_tags);

-- Search-time materialized view. Lookups go through this, not LIKE on words.lemma_native.
create materialized view word_search_index as
select
    w.id as word_id,
    w.language_code,
    w.frequency_rank,
    unaccent(lower(w.lemma_native)) as normalized_native,
    unaccent(lower(w.lemma_latin)) as normalized_latin,
    coalesce(unaccent(lower(w.ipa)), '') as normalized_ipa
from words w;

create index word_search_native_trgm on word_search_index using gin (normalized_native gin_trgm_ops);
create index word_search_latin_trgm on word_search_index using gin (normalized_latin gin_trgm_ops);
create index word_search_ipa_trgm on word_search_index using gin (normalized_ipa gin_trgm_ops);

-- Etymology, only populated if M0 user research clears the filter.
create table word_etymology_origins (
    word_id bigint not null references words(id) on delete cascade,
    origin_family text not null,                   -- 'Iranian' | 'Arabic' | 'Turkic' | 'Mongolian' | 'French' | ...
    confidence real not null check (confidence between 0 and 1),
    evidence text,                                 -- short string: 'wiktionary-template:bor' | 'llm-classified' | 'manual'
    primary key (word_id, origin_family)
);

create index word_etymology_family_idx on word_etymology_origins (origin_family);

create table senses (
    id bigserial primary key,
    word_id bigint not null references words(id) on delete cascade,
    gloss_raw text not null,                       -- CC-BY-SA from Wiktionary
    gloss_clean_en text,                           -- LLM-rewritten (still CC-BY-SA derivative)
    register text,                                 -- 'formal' | 'colloquial' | 'literary' | ...
    sense_order int not null default 0
);

create index senses_word_idx on senses (word_id);

create table examples (
    id bigserial primary key,
    sense_id bigint not null references senses(id) on delete cascade,
    text text not null,
    translation_en text,
    source text not null,                          -- 'tatoeba' | 'wiktionary' | 'llm-generated:gemini-flash-2.5'
    audio_url text
);

create index examples_sense_idx on examples (sense_id);

create table word_relations (
    src_word_id bigint not null references words(id) on delete cascade,
    dst_word_id bigint not null references words(id) on delete cascade,
    relation_type text not null,                   -- 'synonym' | 'antonym' | 'derived_from' | 'etymon' | 'hyper' | 'hyponym' | 'related' | 'translation'
    weight real not null default 1.0,
    primary key (src_word_id, dst_word_id, relation_type)
);

create index word_relations_src_idx on word_relations (src_word_id, relation_type);

create table inflections (
    id bigserial primary key,
    word_id bigint not null references words(id) on delete cascade,
    form text not null,
    features jsonb not null default '{}'::jsonb
);

create index inflections_word_idx on inflections (word_id);

-- =====================================================================
-- User tables. RLS enabled below.
-- =====================================================================

create table profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    display_name text,
    ui_language text not null default 'en',
    native_language text,
    timezone text not null default 'UTC',
    created_at timestamptz not null default now()
);

-- Single-blob preferences keyed by the PREFS_MANIFEST schema.
-- Reads fall back to manifest default when a key isn't present.
create table user_prefs (
    user_id uuid primary key references auth.users(id) on delete cascade,
    prefs jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);

create table user_filters (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,  -- null for built-in presets
    language_code text not null references languages(code),
    name text not null,
    description text,
    definition jsonb not null,
    is_preset boolean not null default false,
    is_default boolean not null default false,
    is_public boolean not null default false,
    forked_from_id uuid references user_filters(id) on delete set null,
    install_count int not null default 0,
    upvote_count int not null default 0,
    created_at timestamptz not null default now(),
    check (
        (is_preset and user_id is null) or
        (not is_preset and user_id is not null)
    )
);

create index user_filters_owner_idx on user_filters (user_id, language_code) where user_id is not null;
create index user_filters_public_idx on user_filters (language_code, is_public, upvote_count desc) where is_public;
create index user_filters_presets_idx on user_filters (language_code) where is_preset;

create table filter_upvotes (
    user_id uuid not null references auth.users(id) on delete cascade,
    filter_id uuid not null references user_filters(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (user_id, filter_id)
);

create table user_language_subs (
    user_id uuid not null references auth.users(id) on delete cascade,
    language_code text not null references languages(code),
    active boolean not null default true,
    notif_per_day int not null default 4 check (notif_per_day between 0 and 10),
    quiet_start time not null default '22:00',
    quiet_end time not null default '07:00',
    level_target text,
    active_filter_id uuid references user_filters(id) on delete set null,
    language_prefs_override jsonb not null default '{}'::jsonb,
    primary key (user_id, language_code)
);

create table saved_words (
    user_id uuid not null references auth.users(id) on delete cascade,
    word_id bigint not null references words(id) on delete cascade,
    saved_at timestamptz not null default now(),
    source text,                                   -- 'notification' | 'search' | 'carousel' | 'related'
    primary key (user_id, word_id)
);

create index saved_words_user_idx on saved_words (user_id, saved_at desc);

create table notifications (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    language_code text not null references languages(code),
    word_id bigint not null references words(id) on delete cascade,
    scheduled_for timestamptz not null,
    sent_at timestamptz,
    delivered boolean not null default false,
    opened boolean not null default false,
    click_word_id bigint references words(id) on delete set null,
    created_at timestamptz not null default now()
);

create index notifications_user_scheduled_idx on notifications (user_id, scheduled_for desc);
create index notifications_pending_idx on notifications (scheduled_for) where sent_at is null;

create table gamification (
    user_id uuid primary key references auth.users(id) on delete cascade,
    xp_total int not null default 0,
    streak_days int not null default 0,
    streak_last_day date,
    daily_goal_xp int not null default 20
);

create table xp_events (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    amount int not null,
    reason text not null,
    created_at timestamptz not null default now()
);

create index xp_events_user_idx on xp_events (user_id, created_at desc);

-- =====================================================================
-- Row Level Security.
-- =====================================================================

alter table profiles enable row level security;
alter table user_prefs enable row level security;
alter table user_filters enable row level security;
alter table filter_upvotes enable row level security;
alter table user_language_subs enable row level security;
alter table saved_words enable row level security;
alter table notifications enable row level security;
alter table gamification enable row level security;
alter table xp_events enable row level security;

create policy profiles_self on profiles
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy user_prefs_self on user_prefs
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Users can read their own filters + any public filter + presets; write only their own.
create policy user_filters_read on user_filters
    for select using (
        user_id = auth.uid()
        or is_preset
        or is_public
    );
create policy user_filters_write on user_filters
    for insert with check (user_id = auth.uid() and not is_preset);
create policy user_filters_update on user_filters
    for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy user_filters_delete on user_filters
    for delete using (user_id = auth.uid());

create policy filter_upvotes_self on filter_upvotes
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy user_language_subs_self on user_language_subs
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy saved_words_self on saved_words
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy notifications_self on notifications
    for select using (user_id = auth.uid());

create policy gamification_self on gamification
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy xp_events_self on xp_events
    for select using (user_id = auth.uid());

-- Content tables are world-readable, write only via service role.
grant select on languages, words, word_etymology_origins, senses, examples,
    word_relations, inflections, word_search_index to anon, authenticated;
