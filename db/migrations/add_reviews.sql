-- Run this against your Supabase database to add the reviews table.
-- Supabase Dashboard → SQL Editor → paste and run.

CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- One review per order
CREATE UNIQUE INDEX IF NOT EXISTS reviews_order_id_key ON reviews(order_id);

-- Index for fast per-restaurant lookups
CREATE INDEX IF NOT EXISTS reviews_restaurant_id_idx ON reviews(restaurant_id);
