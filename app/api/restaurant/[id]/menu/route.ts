import { NextResponse } from "next/server";
import { db } from "@/db";
import { menuItems } from "@/db/schema";
import { eq, sql, and, isNull } from "drizzle-orm";
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

// PATCH — bulk toggle availability for a category
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await assertRestaurantOwner(id);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { category, isAvailable } = await req.json() as { category: string; isAvailable: boolean };
    if (typeof isAvailable !== "boolean") return NextResponse.json({ error: "isAvailable required" }, { status: 400 });

    // "Uncategorized" sentinel maps to NULL in the DB
    const catFilter = category === "Uncategorized"
        ? and(eq(menuItems.restaurantId, id), isNull(menuItems.category))
        : and(eq(menuItems.restaurantId, id), eq(menuItems.category, category));

    await db.update(menuItems).set({ isAvailable }).where(catFilter);

    return NextResponse.json({ ok: true });
}
