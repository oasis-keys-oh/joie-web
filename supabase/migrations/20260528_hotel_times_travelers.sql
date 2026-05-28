-- Add check-in/out times and traveler assignment to reference_items (hotels)
ALTER TABLE reference_items
  ADD COLUMN IF NOT EXISTS check_in_time   TEXT,
  ADD COLUMN IF NOT EXISTS check_out_time  TEXT,
  ADD COLUMN IF NOT EXISTS traveler_keys   TEXT[];
