import { NextResponse } from "next/server";
import { db } from "@/db";
import { menuItems } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { assertRestaurantOwner } from "@/lib/auth";
import { sanitize } from "@/lib/sanitize";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await assertRestaurantOwner(id);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const items = await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.restaurantId, id))
        .orderBy(sql`${menuItems.category} asc, ${menuItems.name} asc`);

    return NextResponse.json(items);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await assertRestaurantOwner(id);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await req.json();
    const { name, description, price, imageUrl, category, isAvailable } = body as Record<string, string>;

    if (!name?.trim() || !price) return NextResponse.json({ error: "name and price are required" }, { status: 400 });

    const [row] = await db.insert(menuItems).values({
        restaurantId: id,
        name: sanitize(name),
        description: sanitize(description) || null,
        price: parseInt(price),
        imageUrl: imageUrl?.trim() || null,
        category: sanitize(category) || null,
        isAvailable: isAvailable !== "false",
    }).returning();

    return NextResponse.json(row, { status: 201 });
}
