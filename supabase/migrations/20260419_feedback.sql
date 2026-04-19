-- Feedback table
-- Per-day notes from travelers. Visible to curators (Omar, Kristi).
-- Status flow: new → reviewed → actioned

create table if not exists feedback (
  id              uuid primary key default gen_random_uuid(),
  trip_id         uuid not null references trips(id) on delete cascade,
  day_id          uuid not null references trip_days(id) on delete cascade,
  traveler_key    text not null,   -- 'omar' | 'kristi' | 'todd' | 'erica'
  comment         text not null,
  status          text not null default 'new',  -- 'new' | 'reviewed' | 'actioned'
  curator_note    text,            -- curator's internal response/note
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Index for fast day-level lookups
create index if not exists feedback_day_id_idx on feedback (day_id);
create index if not exists feedback_trip_id_idx on feedback (trip_id);

-- Row Level Security — open for private portal (no auth required)
alter table feedback enable row level security;

create policy "feedback_read"
  on feedback for select
  using (true);

create policy "feedback_insert"
  on feedback for insert
  with check (true);

create policy "feedback_update"
  on feedback for update
  using (true)
  with check (true);
