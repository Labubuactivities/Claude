-- Seed the three v0.1 launch languages and their preset filters.
-- Presets have user_id = null and is_preset = true.

insert into languages (code, name_native, name_english, script, rtl, default_voice, default_romanization_scheme, enabled, sort_order)
values
    ('fa', 'فارسی',  'Persian', 'Arabic', true,  'fa-IR', 'persian-dmg', true, 10),
    ('tr', 'Türkçe', 'Turkish', 'Latin',  false, 'tr-TR', null,          true, 20),
    ('es', 'Español','Spanish', 'Latin',  false, 'es-ES', null,          true, 30);

-- Universal preset across all languages: top-2000 frequency.
insert into user_filters (user_id, language_code, name, description, definition, is_preset)
select
    null,
    code,
    'Top 2000',
    'The 2000 most common words. A solid starter set for everyday vocabulary.',
    jsonb_build_object(
        'origins',     jsonb_build_object('include', '[]'::jsonb, 'exclude', '[]'::jsonb),
        'frequency',   jsonb_build_object('min', 1, 'max', 2000),
        'abstraction', jsonb_build_object('min', 0.0, 'max', 1.0),
        'topics',      jsonb_build_object('include', '[]'::jsonb, 'exclude', '[]'::jsonb)
    ),
    true
from languages
where code in ('fa', 'tr', 'es');

-- Persian: Iranian-rooted only.
insert into user_filters (user_id, language_code, name, description, definition, is_preset)
values (
    null,
    'fa',
    'Iranian-rooted Persian',
    'Persian words with native Iranian etymology — no Arabic, Turkic, or other loanwords.',
    jsonb_build_object(
        'origins',     jsonb_build_object('include', '["Iranian"]'::jsonb, 'exclude', '["Arabic", "Turkic", "Mongolian", "French", "English"]'::jsonb),
        'frequency',   jsonb_build_object('min', 1, 'max', 20000),
        'abstraction', jsonb_build_object('min', 0.0, 'max', 1.0),
        'topics',      jsonb_build_object('include', '[]'::jsonb, 'exclude', '[]'::jsonb)
    ),
    true
);

-- Turkish: Turkic-rooted only.
insert into user_filters (user_id, language_code, name, description, definition, is_preset)
values (
    null,
    'tr',
    'Turkic-rooted Turkish',
    'Turkish words with native Turkic etymology — no Arabic, Persian, or French loanwords.',
    jsonb_build_object(
        'origins',     jsonb_build_object('include', '["Turkic"]'::jsonb, 'exclude', '["Arabic", "Persian", "French", "Greek", "Italian"]'::jsonb),
        'frequency',   jsonb_build_object('min', 1, 'max', 20000),
        'abstraction', jsonb_build_object('min', 0.0, 'max', 1.0),
        'topics',      jsonb_build_object('include', '[]'::jsonb, 'exclude', '[]'::jsonb)
    ),
    true
);

-- Concrete-only filter for any language: low abstraction.
insert into user_filters (user_id, language_code, name, description, definition, is_preset)
select
    null,
    code,
    'Concrete only',
    'Tangible, everyday nouns and verbs. Great for visual learners.',
    jsonb_build_object(
        'origins',     jsonb_build_object('include', '[]'::jsonb, 'exclude', '[]'::jsonb),
        'frequency',   jsonb_build_object('min', 1, 'max', 10000),
        'abstraction', jsonb_build_object('min', 0.0, 'max', 0.4),
        'topics',      jsonb_build_object('include', '[]'::jsonb, 'exclude', '[]'::jsonb)
    ),
    true
from languages
where code in ('fa', 'tr', 'es');
