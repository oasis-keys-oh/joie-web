-- Hunt page had a hardcoded stork/Morocco tiebreaker rule and intro copy that displayed
-- on every trip regardless of destination. Add a per-trip optional field so curators can
-- author a real tiebreaker rule; falls back to generic copy when null.

alter table trips add column if not exists hunt_tiebreaker_rule text;

update trips
set hunt_tiebreaker_rule = 'Whoever spots the first stork in Morocco wins the tiebreaker.'
where id = 'b1000000-0000-0000-0000-000000000001';
