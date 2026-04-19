-- Hunt submissions table
-- Persists challenge completions and grand finale verses across devices/sessions.
-- Keyed by (trip_id, challenge_id, traveler_key) — unique per person per challenge.

create table if not exists hunt_submissions (
  id              uuid primary key default gen_random_uuid(),
  trip_id         uuid not null references trips(id) on delete cascade,
  challenge_id    uuid not null references hunt_challenges(id) on delete cascade,
  traveler_key    text not null,   -- 'omar' | 'kristi' | 'todd' | 'erica'
  verse_text      text,            -- only populated for grand finale
  completed_at    timestamptz not null default now(),
  created_at      timestamptz not null default now(),

  -- One row per traveler per challenge per trip
  constraint hunt_submissions_unique unique (trip_id, challenge_id, traveler_key)
);

-- Index for fast leaderboard loads
create index if not exists hunt_submissions_trip_id_idx
  on hunt_submissions (trip_id);

-- Row Level Security — open read/write with anon key (private portal, no auth)
alter table hunt_submissions enable row level security;

create policy "hunt_submissions_read"
  on hunt_submissions for select
  using (true);

create policy "hunt_submissions_insert"
  on hunt_submissions for insert
  with check (true);

create policy "hunt_submissions_delete"
  on hunt_submissions for delete
  using (true);

create policy "hunt_submissions_update"
  on hunt_submissions for update
  using (true)
  with check (true);
