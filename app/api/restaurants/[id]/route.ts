import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { restaurants, menuItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const [restaurant] = await db
            .select()
            .from(restaurants)
            .where(and(eq(restaurants.id, id), eq(restaurants.isActive, true)))
            .limit(1);

        if (!restaurant) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
        }

        const items = await db
            .select()
            .from(menuItems)
            .where(
                and(
                    eq(menuItems.restaurantId, id),
                    eq(menuItems.isAvailable, true)
                )
            )
            .orderBy(menuItems.category, menuItems.name);

        // Group items by category
        const grouped: Record<string, typeof items> = {};
        for (const item of items) {
            const cat = item.category ?? "Other";
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(item);
        }

        const menu = Object.entries(grouped).map(([category, items]) => ({
            category,
            items,
        }));

        return NextResponse.json({ restaurant, menu });
    } catch (err) {
        console.error("[GET /api/restaurants/[id]]", err);
        return NextResponse.json({ error: "Failed to fetch restaurant" }, { status: 500 });
    }
}