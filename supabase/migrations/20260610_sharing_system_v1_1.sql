-- Sharing System v1.1 — Fix identity constraint + add full_access (June 2026)

-- 1. Drop the overly strict identity constraint.
--    The form says "No account needed" — anonymous followers (no email, no user_id) are valid.
ALTER TABLE trip_followers DROP CONSTRAINT IF EXISTS trip_followers_identity;

-- 2. Add full_access flag: when true, the follower sees the full traveler itinerary
--    instead of the curated live-feed view.
ALTER TABLE trip_followers
  ADD COLUMN IF NOT EXISTS full_access boolean NOT NULL DEFAULT false;
