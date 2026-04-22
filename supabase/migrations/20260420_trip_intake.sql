-- trip_intake table
-- Raw customer order form submissions + curator-enriched fields.
-- Status flow: submitted → in_review → brief_generated → active
-- Once a trip is fully built (brief accepted, DB populated), status → active
-- and a corresponding row is created in the trips table.

create table if not exists trip_intake (
  id                       uuid primary key default gen_random_uuid(),

  -- ── STATUS ──────────────────────────────────────────────────────────────
  status                   text not null default 'submitted',
  -- 'submitted' | 'in_review' | 'brief_generated' | 'active'

  -- ── FORM FIELDS (from order form) ───────────────────────────────────────
  -- Who
  primary_traveler_name    text,
  partner_name             text,
  additional_travelers     text,
  traveler_count           integer,
  contact_email            text,
  contact_phone            text,

  -- When & Where
  destinations             text,
  start_date               date,
  end_date                 date,
  trip_duration_days       integer,
  is_flexible_dates        boolean default false,

  -- Tier & Type
  tier                     text,    -- 'journey' | 'bespoke'
  trip_type                text,    -- 'cultural' | 'beach' | 'family' | 'adventure' | 'honeymoon' | 'anniversary' | 'multi-gen'

  -- Occasion
  special_occasion         text,
  is_surprise              boolean default false,
  surprise_notes           text,

  -- Preferences (from form)
  dietary_notes            text,
  mobility_notes           text,
  accommodation_style      text,
  pace_preference          text,
  interests                text,
  budget_signal            text,
  instagram_handle         text,

  -- How they found us
  referral_source          text,

  -- Form notes
  form_notes               text,

  -- ── CURATOR FIELDS (filled in /admin/intake/[id]) ───────────────────────
  -- Trip Identity
  trip_title               text,
  trip_subtitle            text,
  web_slug                 text,
  color_theme_primary      text,
  color_theme_accent       text,
  dedication               text,
  epigraph                 text,
  epigraph_translation     text,
  epigraph_transliteration text,
  trip_narrative_notes     text,

  -- Trip Flags
  has_phrases              boolean default true,
  has_ef                   boolean default false,
  has_thread_boxes         boolean default true,
  has_scavenger_hunt       boolean default false,
  has_cultural_etiquette   boolean default true,
  has_shopping_guide       boolean default false,

  -- Traveler Detail (curator-enriched, per traveler JSON)
  -- Array of: { name, role, personality, dietary, mobility, pillow, coffee, curtains, anniversary_date, instagram }
  traveler_profiles        jsonb,

  -- Credit Card / Benefits
  primary_credit_card      text,
  card_benefits_notes      text,

  -- Hotels (confirmed)
  -- Array of: { name, destination, check_in, check_out, confirmation, address, phone, website, tier_notes }
  hotels                   jsonb,

  -- Flights (confirmed)
  -- Array of: { traveler_names, origin, destination, flight_number, departure_datetime, arrival_datetime, airline, confirmation, class }
  flights                  jsonb,

  -- Restaurants (confirmed reservations)
  -- Array of: { name, destination, date, time, party_size, confirmation, address, phone, notes }
  restaurants              jsonb,

  -- Day-by-day skeleton
  -- Array of: { day_number, date, location, region, title, headline_activity, notes, pace, ef_day, has_reservation }
  days_outline             jsonb,

  -- Research flags
  -- Array of: { day_number, type: 'photo_spot'|'insider_tip'|'briefing_card'|'history'|'phrase', note }
  research_needed          jsonb,

  -- Curator notes (internal)
  curator_notes            text,
  phone_call_notes         text,

  -- ── METADATA ────────────────────────────────────────────────────────────
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  brief_generated_at       timestamptz,
  trip_id                  uuid references trips(id) on delete set null
);

create index if not exists trip_intake_status_idx on trip_intake (status);
create index if not exists trip_intake_created_at_idx on trip_intake (created_at desc);

alter table trip_intake enable row level security;

-- Admin-only: no public access
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'trip_intake' and policyname = 'trip_intake_admin_all'
  ) then
    create policy "trip_intake_admin_all"
      on trip_intake for all
      using (true)
      with check (true);
  end if;
end $$;

-- Auto-update updated_at
create or replace function update_trip_intake_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trip_intake_updated_at on trip_intake;
create trigger trip_intake_updated_at
  before update on trip_intake
  for each row execute function update_trip_intake_updated_at();
