-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: traveler_profiles, trip_travelers, curator image slots, footer_image_url
-- Run in Supabase SQL editor (joie-prod)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add curator image slots to trip_days
--    hero_image_url already exists as slot 1.
--    Add slots 2–4 so curators can set a cycling pool of up to 4 images per day.
--    If any slot is filled, DayHeader uses curator images instead of the Unsplash pool.
--    footer_image_url overrides the featured photo in PhotoFooter.
ALTER TABLE trip_days ADD COLUMN IF NOT EXISTS hero_image_url_2  text;
ALTER TABLE trip_days ADD COLUMN IF NOT EXISTS hero_image_url_3  text;
ALTER TABLE trip_days ADD COLUMN IF NOT EXISTS hero_image_url_4  text;
ALTER TABLE trip_days ADD COLUMN IF NOT EXISTS footer_image_url  text;

-- 2. Create traveler_profiles table (reusable across trips)
CREATE TABLE IF NOT EXISTS traveler_profiles (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  traveler_key          text UNIQUE,           -- 'omar', 'kristi', 'todd', 'erica'
  name                  text NOT NULL,
  email                 text,
  phone                 text,
  -- Hospitality preferences (used for hotel preference emails)
  pillow_firmness       text,                  -- 'soft', 'medium', 'firm'
  coffee_order          text,                  -- e.g. 'black, no sugar'
  curtains_preference   text,                  -- 'open', 'closed', 'partial'
  dietary_notes         text,
  mobility_notes        text,
  anniversary_date      date,
  personality           text,                  -- editorial note for itinerary framing
  notes                 text,                  -- general curator notes
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- 3. Create trip_travelers junction table
CREATE TABLE IF NOT EXISTS trip_travelers (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id               uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  traveler_profile_id   uuid NOT NULL REFERENCES traveler_profiles(id) ON DELETE CASCADE,
  UNIQUE(trip_id, traveler_profile_id)
);

-- 4. Seed the 4 Andalusian Thread travelers (safe to run multiple times)
INSERT INTO traveler_profiles (traveler_key, name)
VALUES
  ('omar',   'Omar Hamid'),
  ('kristi', 'Kristi'),
  ('todd',   'Todd'),
  ('erica',  'Erica')
ON CONFLICT (traveler_key) DO NOTHING;

-- 5. Link all 4 travelers to the Andalusian Thread trip
INSERT INTO trip_travelers (trip_id, traveler_profile_id)
SELECT
  'b1000000-0000-0000-0000-000000000001'::uuid,
  id
FROM traveler_profiles
WHERE traveler_key IN ('omar', 'kristi', 'todd', 'erica')
ON CONFLICT DO NOTHING;
