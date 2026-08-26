-- Per-trip, per-country travel info (currency, tipping, connectivity, health/safety, embassy).
-- Fixes: Money & Connectivity / Health & Safety tabs on the Prep page were 100% hardcoded to
-- Morocco/France (Andalusian Thread) regardless of which trip was being viewed. This table gives
-- every trip its own real backing data instead. Also backfilled location_lat/location_lng on
-- trip_days for both existing trips (Andalusian Thread + Salish Vow/Mosby) — those columns already
-- existed but were unpopulated, which is why the map/route sidebar had been hardcoded too.
create table if not exists trip_travel_info (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  country_name text not null,
  currency_code text,              -- e.g. 'CAD', 'MAD', 'EUR'
  currency_name text,              -- e.g. 'Canadian Dollar'
  currency_symbol text,            -- e.g. '$', 'DH'
  fallback_rate_to_usd numeric,    -- used only if the live exchange-rate API call fails
  exchange_note text,              -- e.g. "ATMs are reliable, avoid airport counters"
  tipping_notes jsonb default '[]'::jsonb,      -- [{service, local_note}]
  connectivity_notes jsonb default '[]'::jsonb, -- [{title, note}]
  vaccination_notes jsonb default '[]'::jsonb,  -- [{label, note}]
  food_water_notes jsonb default '[]'::jsonb,   -- [{label, note}]
  sun_safety_note text,
  embassy_name text,
  embassy_url text,
  advisory_url text,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table trip_travel_info enable row level security;

create policy public_read_trip_travel_info
  on trip_travel_info for select
  to anon
  using (true);

create policy authenticated_read_trip_travel_info
  on trip_travel_info for select
  to authenticated
  using (true);

create policy authenticated_write_trip_travel_info
  on trip_travel_info for all
  to authenticated
  using (true)
  with check (true);

create index if not exists idx_trip_travel_info_trip_id on trip_travel_info(trip_id);

-- Backfill: Andalusian Thread day coordinates (representative point per day's primary location)
update trip_days set location_lat=35.7595, location_lng=-5.8340 where trip_id='b1000000-0000-0000-0000-000000000001' and day_number=1; -- Tangier
update trip_days set location_lat=35.5450, location_lng=-5.3684 where trip_id='b1000000-0000-0000-0000-000000000001' and day_number=2; -- Tamuda Bay
update trip_days set location_lat=34.0209, location_lng=-6.8416 where trip_id='b1000000-0000-0000-0000-000000000001' and day_number in (3,4,5); -- Rabat
update trip_days set location_lat=45.7640, location_lng=4.8357  where trip_id='b1000000-0000-0000-0000-000000000001' and day_number=6; -- Lyon
update trip_days set location_lat=47.1197, location_lng=4.6667  where trip_id='b1000000-0000-0000-0000-000000000001' and day_number in (7,8,9); -- Burgundy (Beaune area)
update trip_days set location_lat=47.5860, location_lng=1.3360  where trip_id='b1000000-0000-0000-0000-000000000001' and day_number in (10,11,12,13); -- Loire Valley (Blois area)
update trip_days set location_lat=48.8566, location_lng=2.3522  where trip_id='b1000000-0000-0000-0000-000000000001' and day_number in (14,15); -- Paris

-- Backfill: Salish Vow (Vancouver) day coordinates
update trip_days set location_lat=49.2827, location_lng=-123.1207 where trip_id='af806c16-5f44-43fe-a516-122b53fc0626' and day_number in (1,2,4,5,6); -- Vancouver
update trip_days set location_lat=49.7016, location_lng=-123.1558 where trip_id='af806c16-5f44-43fe-a516-122b53fc0626' and day_number=3; -- Squamish

-- Backfill: trip_travel_info rows
insert into trip_travel_info (trip_id, country_name, currency_code, currency_name, currency_symbol, fallback_rate_to_usd, exchange_note, tipping_notes, connectivity_notes, vaccination_notes, food_water_notes, sun_safety_note, embassy_name, embassy_url, advisory_url, sort_order)
values
('b1000000-0000-0000-0000-000000000001', 'Morocco', 'MAD', 'Moroccan Dirham', 'DH', 10.05,
 'ATMs in Casablanca and Rabat medinas are reliable. Avoid airport exchange counters. Never exchange money on the street — it is illegal and the rates are fake. Dirhams cannot be exported — spend or exchange before leaving.',
 '[{"service":"Restaurant","local_note":"10–15 MAD / person"},{"service":"Private Driver / Guide","local_note":"50–100 MAD / day"},{"service":"Hotel Housekeeping","local_note":"10–20 MAD / night"},{"service":"Riad / Guesthouse Staff","local_note":"20–40 MAD / stay"},{"service":"Taxi","local_note":"Round up to nearest 5 MAD"},{"service":"Hammam / Spa","local_note":"20–40 MAD"}]'::jsonb,
 '[{"title":"T-Mobile Magenta / Google Fi","note":"Both work in Morocco and France with no extra fees. Speeds are acceptable in cities."},{"title":"Local SIM — Morocco","note":"Maroc Telecom SIMs available at the airport. A 30-day 20GB data plan costs ~$12. Useful if staying longer."},{"title":"WhatsApp","note":"The default messaging app in Morocco — even for hotel concierge. Make sure everyone in the group has it."},{"title":"Download Offline Maps","note":"Download Morocco and France maps in Google Maps or Maps.me before you leave. Medinas can be confusing without data."}]'::jsonb,
 '[{"label":"Hepatitis A & B","note":"Recommended for Morocco if not already vaccinated. Check with your doctor 4–6 weeks before travel."}]'::jsonb,
 '[{"label":"Tap water","note":"Do not drink tap water in Morocco. Bottled water is cheap and universally available."}]'::jsonb,
 'June UV index in Rabat is 9–10 (very high). Reapply every 2 hours outdoors. Morocco in June is warm — 80°F+. Drink 3+ liters per day when active.',
 'U.S. Embassy Rabat', 'https://ma.usembassy.gov',
 'https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/Morocco.html', 1),
('b1000000-0000-0000-0000-000000000001', 'France', 'EUR', 'Euro', '€', 0.92,
 'Widely accepted cards; carry some cash for small vendors and markets.',
 '[{"service":"Restaurant","local_note":"Round up, tip not required"},{"service":"Private Driver / Guide","local_note":"€10–15 / day"},{"service":"Hotel Housekeeping","local_note":"€2–5 / night"},{"service":"Taxi","local_note":"Round up or small tip"},{"service":"Hammam / Spa","local_note":"€5–15"}]'::jsonb,
 '[{"title":"T-Mobile Magenta / Google Fi","note":"Both work in Morocco and France with no extra fees. Speeds are acceptable in cities."},{"title":"Download Offline Maps","note":"Download Morocco and France maps in Google Maps or Maps.me before you leave."}]'::jsonb,
 '[]'::jsonb,
 '[]'::jsonb,
 'Burgundy evenings in June can be 55°F — plan for layering.',
 'U.S. Embassy Paris', 'https://fr.usembassy.gov',
 'https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/France.html', 2);

insert into trip_travel_info (trip_id, country_name, currency_code, currency_name, currency_symbol, fallback_rate_to_usd, exchange_note, tipping_notes, connectivity_notes, vaccination_notes, food_water_notes, sun_safety_note, embassy_name, embassy_url, advisory_url, sort_order)
values
('af806c16-5f44-43fe-a516-122b53fc0626', 'Canada', 'CAD', 'Canadian Dollar', '$', 1.38,
 'Cards are accepted almost everywhere in Vancouver — cash is rarely needed. Tap-to-pay is standard.',
 '[{"service":"Restaurant","local_note":"18–20% is standard (often prompted on the card terminal)"},{"service":"Private Driver / Guide","local_note":"CAD $20–40 / day"},{"service":"Hotel Housekeeping","local_note":"CAD $2–5 / night"},{"service":"Taxi / Rideshare","local_note":"10–15%, often built into the app"},{"service":"Spa","local_note":"15–20%"}]'::jsonb,
 '[{"title":"T-Mobile Magenta / Google Fi","note":"Both include Canada in standard roaming at no extra fee. Speeds are solid in Vancouver."},{"title":"Local SIM — Canada","note":"Rogers/Telus/Bell prepaid SIMs available at YVR if you want a local number."},{"title":"Download Offline Maps","note":"Cell coverage is strong in Vancouver and along the Sea to Sky Highway, but download offline maps for Squamish/Shannon Falls just in case."}]'::jsonb,
 '[]'::jsonb,
 '[{"label":"Tap water","note":"Tap water is safe to drink throughout Vancouver and Squamish."}]'::jsonb,
 'September UV index in Vancouver is moderate (4–6). Bring a light layer for the whale-watching boat — it is cooler on the water.',
 'U.S. Consulate General Vancouver', 'https://ca.usembassy.gov/embassy-consulates/vancouver/',
 'https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/Canada.html', 1);

-- Curator-editable short label for the route-map sidebar (e.g. "Rabat", "Burgundy").
-- Falls back to `location` in the app if null. Needed because `location` is often a
-- freeform "A → B" transit description, not a clean map label.
alter table trip_days add column if not exists map_stop_label text;

update trip_days set map_stop_label = 'Tangier' where trip_id='b1000000-0000-0000-0000-000000000001' and day_number=1;
update trip_days set map_stop_label = 'Tamuda Bay' where trip_id='b1000000-0000-0000-0000-000000000001' and day_number=2;
update trip_days set map_stop_label = 'Rabat' where trip_id='b1000000-0000-0000-0000-000000000001' and day_number in (3,4,5);
update trip_days set map_stop_label = 'Lyon' where trip_id='b1000000-0000-0000-0000-000000000001' and day_number=6;
update trip_days set map_stop_label = 'Burgundy' where trip_id='b1000000-0000-0000-0000-000000000001' and day_number in (7,8,9);
update trip_days set map_stop_label = 'Loire Valley' where trip_id='b1000000-0000-0000-0000-000000000001' and day_number in (10,11,12,13);
update trip_days set map_stop_label = 'Paris' where trip_id='b1000000-0000-0000-0000-000000000001' and day_number in (14,15);

update trip_days set map_stop_label = 'Vancouver' where trip_id='af806c16-5f44-43fe-a516-122b53fc0626' and day_number in (1,2,4,5,6);
update trip_days set map_stop_label = 'Squamish' where trip_id='af806c16-5f44-43fe-a516-122b53fc0626' and day_number=3;
