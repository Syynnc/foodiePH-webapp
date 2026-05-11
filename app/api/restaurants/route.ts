import { NextResponse } from "next/server";
import { restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db";

export async function GET() {
  try {
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
      })
      .from(restaurants)
      .where(eq(restaurants.isActive, true))
      .orderBy(restaurants.name);

    return NextResponse.json(rows, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" },
    });
  } catch (err) {
    console.error("[GET /api/restaurants]", err);
    return NextResponse.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 }
    );
  }
}