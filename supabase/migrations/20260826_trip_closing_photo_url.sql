-- Curator-editable override for the trip page's closing full-bleed photo (PhotoFooter).
-- Mirrors the existing hero_image_url / story_image_url pattern -- same TripTextField admin
-- control, same nullable-text-column shape, no RLS/grant changes needed (trips table's
-- existing policies already cover this). Falls back to the auto-derived Unsplash pool from
-- the trip's last day (region/location) when left blank -- no fabricated default.

alter table trips add column if not exists closing_photo_url text;
