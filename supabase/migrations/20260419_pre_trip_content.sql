-- Pre-trip content table
-- Daily drops before the trip departs. date_offset_days is negative
-- (e.g., -15 = 15 days before trip start).
--
-- To seed for The Andalusian Thread (June 9, 2026 start):
--   date_offset_days -15 = May 25
--   date_offset_days -14 = May 26
--   ...
--   date_offset_days -1  = June 8 (day before)
--
-- Types: 'history' | 'music' | 'phrase' | 'weather' | 'tip'

create table if not exists pre_trip_content (
  id                uuid primary key default gen_random_uuid(),
  trip_id           uuid not null references trips(id) on delete cascade,
  date_offset_days  integer not null,   -- negative: days before trip start
  type              text not null,      -- 'history' | 'music' | 'phrase' | 'weather' | 'tip'
  title             text,               -- optional headline
  content           text not null,      -- the drop content
  created_at        timestamptz not null default now()
);

create index if not exists pre_trip_content_trip_id_idx
  on pre_trip_content (trip_id, date_offset_days);

alter table pre_trip_content enable row level security;

create policy "pre_trip_content_read"
  on pre_trip_content for select
  using (true);

create policy "pre_trip_content_insert"
  on pre_trip_content for insert
  with check (true);

-- ──────────────────────────────────────────────────────────────────────────────
-- SEED DATA — The Andalusian Thread (trip_id = replace with actual UUID)
-- Run this after creating the table, substituting the correct trip_id.
-- ──────────────────────────────────────────────────────────────────────────────

-- Example seed (replace 'YOUR_TRIP_ID_HERE' with the actual UUID from the trips table):
--
-- insert into pre_trip_content (trip_id, date_offset_days, type, title, content) values
-- ('YOUR_TRIP_ID_HERE', -15, 'history',
--   'The Thread That Connects',
--   'Morocco and the Iberian Peninsula were one civilization for nearly 800 years. The Arabic word for Spain — Al-Andalus — gave Andalusia its name. When you cross into Morocco from Spain, you are not leaving Europe for Africa. You are completing a circle.'),
-- ('YOUR_TRIP_ID_HERE', -14, 'music',
--   'Andalusian Playlist',
--   'Before you arrive, spend a day with this music: Oum (Moroccan soul), Estrella Morente (Spanish flamenco), Ibrahim Maalouf (Lebanese jazz that found its way through Andalusia). Notice what they share.'),
-- ('YOUR_TRIP_ID_HERE', -13, 'phrase',
--   'Your First Phrase',
--   'As-salamu alaykum (السلام عليكم) — peace be upon you. The reply: Wa alaykum as-salam. You will say this more than any other phrase. Say it to shopkeepers, neighbors, and anyone who makes eye contact.'),
-- ('YOUR_TRIP_ID_HERE', -12, 'tip',
--   'On Arriving in Casablanca',
--   'The airport is 45 minutes from the city. Most of your trip is inland — Casablanca is a port, not a medina. Walk the Corniche on Day 1 to find your sea legs. You will be in the mountains within 48 hours.'),
-- ('YOUR_TRIP_ID_HERE', -11, 'history',
--   'The Medina as a Living Archive',
--   'A medina is not a tourist attraction — it is a working city. The oldest parts of Fez''s medina have been continuously inhabited for 1,200 years. The buildings around you predate the printing press, the Reformation, and the Renaissance.');
