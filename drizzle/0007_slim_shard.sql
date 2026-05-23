CREATE TABLE "driver_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"vehicle_type" text DEFAULT 'motorcycle',
	"plate_number" text,
	"license_number" text,
	"gov_id_url" text,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "restaurant_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"restaurant_name" text NOT NULL,
	"cuisine" text,
	"address" text,
	"phone" text,
	"description" text,
	"opening_hours" text,
	"min_order" integer,
	"delivery_time" text,
	"website" text,
	"facebook" text,
	"seating_capacity" integer,
	"permit_url" text,
	"logo_url" text,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "driver_applications" ADD CONSTRAINT "driver_applications_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_applications" ADD CONSTRAINT "restaurant_applications_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;