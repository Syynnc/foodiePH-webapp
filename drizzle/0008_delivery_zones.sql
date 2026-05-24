-- Add delivery-zone / service-region columns
-- ─────────────────────────────────────────────────────────────────────────────
-- drivers.service_region  — the zone a driver is registered to operate in
-- driver_applications.service_region — submitted during application
-- restaurants.region      — the zone a restaurant is located in
-- orders.delivery_region  — auto-detected from the customer's delivery address
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE "drivers"
  ADD COLUMN IF NOT EXISTS "service_region" text;
--> statement-breakpoint

ALTER TABLE "driver_applications"
  ADD COLUMN IF NOT EXISTS "service_region" text;
--> statement-breakpoint

ALTER TABLE "restaurants"
  ADD COLUMN IF NOT EXISTS "region" text;
--> statement-breakpoint

ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "delivery_region" text;
