import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);

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

    return NextResponse.json(rows);
  } catch (err) {
    console.error("[GET /api/restaurants]", err);
    return NextResponse.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 }
    );
  }
}