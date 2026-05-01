import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { profiles, restaurants, menuItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function assertOwner() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const [p] = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.id, user.id)).limit(1);
    if (!p || (p.role !== "restaurant" && p.role !== "admin")) return null;
    return user;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await assertOwner();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id } = await params;

    // Ensure the item belongs to owner's restaurant
    const [rest] = await db.select({ id: restaurants.id }).from(restaurants).where(eq(restaurants.ownerId, user.id)).limit(1);
    if (!rest) return NextResponse.json({ error: "No restaurant linked" }, { status: 404 });

    const body = await req.json();
    const { name, description, price, imageUrl, category, isAvailable } = body as Record<string, string | boolean>;

    if (!name || !price) return NextResponse.json({ error: "name and price are required" }, { status: 400 });

    const [updated] = await db.update(menuItems).set({
        name: String(name).trim(),
        description: description ? String(description) : null,
        price: parseInt(String(price)),
        imageUrl: imageUrl ? String(imageUrl) : null,
        category: category ? String(category) : null,
        isAvailable: isAvailable !== false && isAvailable !== "false",
    }).where(and(eq(menuItems.id, id), eq(menuItems.restaurantId, rest.id))).returning();

    if (!updated) return NextResponse.json({ error: "Not found or not yours" }, { status: 404 });
    return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await assertOwner();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id } = await params;

    const [rest] = await db.select({ id: restaurants.id }).from(restaurants).where(eq(restaurants.ownerId, user.id)).limit(1);
    if (!rest) return NextResponse.json({ error: "No restaurant linked" }, { status: 404 });

    const [deleted] = await db
        .delete(menuItems)
        .where(and(eq(menuItems.id, id), eq(menuItems.restaurantId, rest.id)))
        .returning({ id: menuItems.id });

    if (!deleted) return NextResponse.json({ error: "Not found or not yours" }, { status: 404 });
    return NextResponse.json({ ok: true });
}
