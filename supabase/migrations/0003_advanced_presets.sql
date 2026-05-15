-- Adds the `registers` dimension to every existing filter definition and seeds
-- preset filters aimed at intermediate-to-advanced learners (B2/C1/C2).
-- Run after 0002_filter_presets.sql.

-- Back-fill the new dimension on every existing filter.
update user_filters
set definition = jsonb_set(
    definition,
    '{registers}',
    '{"include": [], "exclude": []}'::jsonb,
    true
)
where not (definition ? 'registers');

-- Long-tail filter: skip the words a B2+ learner already knows.
insert into user_filters (user_id, language_code, name, description, definition, is_preset)
select
    null,
    code,
    'Long-tail 5000+',
    'Vocabulary beyond the everyday — for upper-intermediate and advanced learners who want to push past the top 5000.',
    jsonb_build_object(
        'origins',     jsonb_build_object('include', '[]'::jsonb, 'exclude', '[]'::jsonb),
        'frequency',   jsonb_build_object('min', 5000, 'max', 50000),
        'abstraction', jsonb_build_object('min', 0.0, 'max', 1.0),
        'topics',      jsonb_build_object('include', '[]'::jsonb, 'exclude', '[]'::jsonb),
        'registers',   jsonb_build_object('include', '[]'::jsonb, 'exclude', '[]'::jsonb)
    ),
    true
from languages
where code in ('fa', 'tr', 'es');

-- Formal + literary register filter: advanced reading + writing.
insert into user_filters (user_id, language_code, name, description, definition, is_preset)
select
    null,
    code,
    'Formal & literary',
    'Words used in formal writing, literature, and elevated speech. Best for C1/C2 learners refining their style.',
    jsonb_build_object(
        'origins',     jsonb_build_object('include', '[]'::jsonb, 'exclude', '[]'::jsonb),
        'frequency',   jsonb_build_object('min', 1, 'max', 50000),
        'abstraction', jsonb_build_object('min', 0.0, 'max', 1.0),
        'topics',      jsonb_build_object('include', '[]'::jsonb, 'exclude', '[]'::jsonb),
        'registers',   jsonb_build_object('include', '["formal", "literary"]'::jsonb, 'exclude', '[]'::jsonb)
    ),
    true
from languages
where code in ('fa', 'tr', 'es');
