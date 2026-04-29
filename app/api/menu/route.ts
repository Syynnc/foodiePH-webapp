import { NextResponse } from "next/server";
import { restaurants, menuItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db";

const CUISINE_CONFIG: Record<string, { color: string; accent: string }> = {
  "Pizza & Italian":      { color: "#f5ede0", accent: "#c8783a" },
  "Asian & Sushi":        { color: "#edf2e8", accent: "#5a8a4a" },
  "Burgers & Fast Food":  { color: "#f5ebe8", accent: "#c8503a" },
  "Chicken & Filipino":   { color: "#edf5f0", accent: "#3a8a6a" },
};

export async function GET() {
  try {
    // Join menu_items → restaurants to get cuisine grouping + restaurant name
    const rows = await db
      .select({
        id:             menuItems.id,
        name:           menuItems.name,
        description:    menuItems.description,
        price:          menuItems.price,
        imageUrl:       menuItems.imageUrl,
        category:       menuItems.category,
        rating:         menuItems.rating,
        restaurantId:   menuItems.restaurantId,
        restaurantName: restaurants.name,
        cuisine:        restaurants.cuisine,
        isActive:       restaurants.isActive,
      })
      .from(menuItems)
      .innerJoin(restaurants, eq(menuItems.restaurantId, restaurants.id))
      .where(eq(restaurants.isActive, true));

    // Group by cuisine
    const grouped: Record<string, typeof rows> = {};
    for (const row of rows) {
      const cuisine = row.cuisine ?? "Other";
      if (!grouped[cuisine]) grouped[cuisine] = [];
      grouped[cuisine].push(row);
    }

    const result = Object.entries(grouped).map(([cuisine, items]) => ({
      cuisine,
      label:  `${items.length} items`,
      color:  CUISINE_CONFIG[cuisine]?.color  ?? "#f5f0e8",
      accent: CUISINE_CONFIG[cuisine]?.accent ?? "#c8783a",
      items,
    }));

    // Sort by a known order
    const order = ["Pizza & Italian", "Asian & Sushi", "Burgers & Fast Food", "Chicken & Filipino"];
    result.sort((a, b) => order.indexOf(a.cuisine) - order.indexOf(b.cuisine));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/menu]", err);
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}