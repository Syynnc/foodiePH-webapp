import { NextResponse } from "next/server";
import { db } from "@/db";
import { menuItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { assertRestaurantOwner } from "@/lib/auth";
import { sanitize } from "@/lib/sanitize";

type Ctx = { params: Promise<{ id: string; itemId: string }> };

export async function PUT(req: Request, { params }: Ctx) {
    const { id, itemId } = await params;
    const user = await assertRestaurantOwner(id);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await req.json();
    const { name, description, price, imageUrl, category, isAvailable } = body as Record<string, string | boolean>;

    if (!name || !price) return NextResponse.json({ error: "name and price are required" }, { status: 400 });

    const [updated] = await db.update(menuItems).set({
        name: sanitize(String(name)),
        description: sanitize(String(description)) || null,
        price: parseInt(String(price)),
        imageUrl: String(imageUrl).trim() || null,
        category: sanitize(String(category)) || null,
        isAvailable: isAvailable !== false && isAvailable !== "false",
    }).where(and(eq(menuItems.id, itemId), eq(menuItems.restaurantId, id))).returning();

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
}

export async function PATCH(req: Request, { params }: Ctx) {
    const { id, itemId } = await params;
    const user = await assertRestaurantOwner(id);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { isAvailable } = await req.json() as { isAvailable: boolean };

    const [updated] = await db.update(menuItems)
        .set({ isAvailable })
        .where(and(eq(menuItems.id, itemId), eq(menuItems.restaurantId, id)))
        .returning();

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
    const { id, itemId } = await params;
    const user = await assertRestaurantOwner(id);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const [deleted] = await db.delete(menuItems)
        .where(and(eq(menuItems.id, itemId), eq(menuItems.restaurantId, id)))
        .returning({ id: menuItems.id });

    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
}
