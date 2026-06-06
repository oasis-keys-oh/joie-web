-- Sharing System v1 — Canonical Alignment (June 2026)
-- Canonical doc: joie-sharing-canonical.md

-- 1. trip_days: editorial publishing flags (curator-controlled story layer)
ALTER TABLE trip_days
  ADD COLUMN IF NOT EXISTS follower_published boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS follower_published_at timestamptz;

-- 2. media: separate photo visibility flag for follower feed
--    approved=true alone does NOT make a photo follower-visible — separate decision
ALTER TABLE media
  ADD COLUMN IF NOT EXISTS follower_visible boolean DEFAULT false;

-- 3. trip_followers: fix status default from 'subscribed' to 'active'
--    Canonical values: active | unsubscribed | removed
ALTER TABLE trip_followers
  ALTER COLUMN status SET DEFAULT 'active';

-- Migrate any existing 'subscribed' rows to canonical 'active'
UPDATE trip_followers SET status = 'active' WHERE status = 'subscribed';

-- Add check constraint for canonical status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'trip_followers_status_check'
    AND conrelid = 'trip_followers'::regclass
  ) THEN
    ALTER TABLE trip_followers
      ADD CONSTRAINT trip_followers_status_check
      CHECK (status IN ('active', 'unsubscribed', 'removed'));
  END IF;
END$$;
