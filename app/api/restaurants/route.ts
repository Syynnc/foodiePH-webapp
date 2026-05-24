import { NextResponse } from "next/server";
import { restaurants, profiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const regionParam = searchParams.get("region"); // explicit override from UI
    const bypass = searchParams.get("all") === "1"; // ?all=1 skips region filtering

    let regionFilter: string | null = regionParam;

    // If no explicit ?region= was passed and the caller didn't opt out with ?all=1,
    // try to detect the logged-in user's region from their profile as a fallback.
    // Note: the dashboard always passes ?region= explicitly, so this path is mainly
    // for the public /restaurants browse page when the user is signed in.
    if (!regionFilter && !bypass) {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const [profile] = await db
            .select({ region: profiles.region })
            .from(profiles)
            .where(eq(profiles.id, user.id))
            .limit(1);
          regionFilter = profile?.region ?? null;
        }
      } catch {
        // If auth lookup fails for any reason, fall through and show all restaurants
      }
    }

    // Build conditions
    const conditions = [eq(restaurants.isActive, true)];
    if (regionFilter) {
      conditions.push(eq(restaurants.region, regionFilter));
    }

    const rows = await db
      .select({
        id: restaurants.id,
        name: restaurants.name,
        cuisine: restaurants.cuisine,
        imageUrl: restaurants.imageUrl,
        rating: restaurants.rating,
        minOrder: restaurants.minOrder,
        deliveryTime: restaurants.deliveryTime,
        isActive: restaurants.isActive,
        region: restaurants.region,
      })
      .from(restaurants)
      .where(and(...conditions))
      .orderBy(restaurants.name);

    return NextResponse.json(rows, {
      // Don't cache region-filtered responses per-user; only cache the full list
      headers: regionFilter
        ? { "Cache-Control": "private, no-store" }
        : { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" },
    });
  } catch (err) {
    console.error("[GET /api/restaurants]", err);
    return NextResponse.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 }
    );
  }
}
