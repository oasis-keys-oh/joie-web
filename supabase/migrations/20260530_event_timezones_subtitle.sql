-- Oukala Journey — event/day timezones, subtitle, and day geocoding
-- 2026-05-30
--
-- events:
--   • time_end   — already added in 20260528; ensured here for idempotency
--   • subtitle   — short secondary line (e.g. "DEN → CMN", "26 Rue Sidi Fateh")
--   • timezone     — IANA timezone the event's START time is expressed in (e.g. "Africa/Casablanca").
--                    Events without their own value inherit the parent day's timezone for display.
--   • timezone_end — IANA timezone the event's END time is expressed in. For flights/transfers this
--                    can differ from `timezone` (crossing zones); for all other event types it mirrors
--                    `timezone` (or is NULL).
--
-- trip_days:
--   • timezone     — IANA timezone for this day's destination. Events inherit this when unset.
--   • location_lat — destination latitude  (future geocoding / map work; nullable)
--   • location_lng — destination longitude (future geocoding / map work; nullable)
--
-- No tables are created, so no new GRANT block is required: column additions
-- inherit the existing table-level grants on public.events / public.trip_days
-- (see CODING_RULES.md §12 — grants are table-scoped, not column-scoped).

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS time_end TEXT,
  ADD COLUMN IF NOT EXISTS subtitle TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT,
  ADD COLUMN IF NOT EXISTS timezone_end TEXT;

ALTER TABLE public.trip_days
  ADD COLUMN IF NOT EXISTS timezone     TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION;

COMMENT ON COLUMN public.events.subtitle    IS 'Short secondary line for the event, e.g. "DEN → CMN" or a street address.';
COMMENT ON COLUMN public.events.timezone     IS 'IANA timezone the event START time is expressed in. Falls back to trip_days.timezone when null.';
COMMENT ON COLUMN public.events.timezone_end IS 'IANA timezone the event END time is expressed in. May differ from timezone for flights/transfers; mirrors timezone (or NULL) otherwise.';
COMMENT ON COLUMN public.trip_days.timezone IS 'IANA timezone for this day''s destination. Events inherit this as their display timezone when they have none.';
COMMENT ON COLUMN public.trip_days.location_lat IS 'Destination latitude for future geocoding / map work.';
COMMENT ON COLUMN public.trip_days.location_lng IS 'Destination longitude for future geocoding / map work.';
