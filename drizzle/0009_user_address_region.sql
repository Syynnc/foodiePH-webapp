-- Add address and region to user profiles
-- address — free-text delivery address the user enters at sign-up
-- region  — Philippine region auto-detected from the address (same values as drivers/restaurants)

ALTER TABLE "profiles"
  ADD COLUMN IF NOT EXISTS "address" text;
--> statement-breakpoint

ALTER TABLE "profiles"
  ADD COLUMN IF NOT EXISTS "region" text;
