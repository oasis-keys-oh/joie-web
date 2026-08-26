-- Nadia review 2026-08-26: hunt_challenges was missing columns that both the admin CMS
-- (challenge_type, transliteration) and the public Hunt page (category, location_hint,
-- is_grand_finale) assumed existed. Admin saves were actively failing. Reconciled onto one
-- real schema rather than adding everything either side invented:
--   - challenge_type, transliteration: real new columns (admin already has UI for both)
--   - requires_photo: real new column, backfilled via description-text heuristic
--   - category, is_grand_finale, location_hint: NOT added — derived from challenge_type/location
--     in the app layer instead, to avoid a second source of truth that can drift.

alter table hunt_challenges add column if not exists challenge_type text;
alter table hunt_challenges add column if not exists transliteration text;
alter table hunt_challenges add column if not exists requires_photo boolean not null default false;

-- Backfill: generic 'find' bucket for all existing rows, except the one identifiable grand finale
update hunt_challenges set challenge_type = 'find' where challenge_type is null;
update hunt_challenges set challenge_type = 'grand_finale' where title = 'Grand Finale Verse';

-- Backfill requires_photo from description text heuristic (reversible via admin CMS)
update hunt_challenges set requires_photo = true
where requires_photo = false and description ilike '%photo%';
