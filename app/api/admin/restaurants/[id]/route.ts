import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { profiles, restaurants, menuItems } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

async function assertAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const [p] = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.id, user.id)).limit(1);
    if (!p || p.role !== "admin") return null;
    return user;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await assertAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id } = await params;

    const [row] = await db
        .select({
            id: restaurants.id,
            name: restaurants.name,
            cuisine: restaurants.cuisine,
            description: restaurants.description,
            address: restaurants.address,
            phone: restaurants.phone,
            imageUrl: restaurants.imageUrl,
            rating: restaurants.rating,
            minOrder: restaurants.minOrder,
            deliveryTime: restaurants.deliveryTime,
            isActive: restaurants.isActive,
            createdAt: restaurants.createdAt,
            ownerId: restaurants.ownerId,
            ownerEmail: profiles.email,
            ownerName: profiles.fullName,
        })
        .from(restaurants)
        .leftJoin(profiles, eq(restaurants.ownerId, profiles.id))
        .where(eq(restaurants.id, id))
        .limit(1);

    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const items = await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.restaurantId, id))
        .orderBy(sql`${menuItems.category} asc, ${menuItems.name} asc`);

    return NextResponse.json({ ...row, menuItems: items });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await assertAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const { name, cuisine, description, address, phone, imageUrl, minOrder, deliveryTime, isActive, ownerId } = body as Record<string, string>;

    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const oldRow = await db.select({ ownerId: restaurants.ownerId }).from(restaurants).where(eq(restaurants.id, id)).limit(1);
    const prevOwnerId = oldRow[0]?.ownerId;

    const [updated] = await db.update(restaurants).set({
        name: name.trim(),
        cuisine: cuisine || null,
        description: description || null,
        address: address || null,
        phone: phone || null,
        imageUrl: imageUrl || null,
        minOrder: minOrder ? parseInt(minOrder) : 500,
        deliveryTime: deliveryTime || null,
        isActive: isActive !== undefined ? isActive === "true" : undefined,
        ownerId: ownerId || null,
    }).where(eq(restaurants.id, id)).returning();

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Update roles when owner changes
    if (ownerId && ownerId !== prevOwnerId) {
        await db.update(profiles).set({ role: "restaurant" }).where(eq(profiles.id, ownerId));
    }
    if (prevOwnerId && prevOwnerId !== ownerId) {
        // Check if former owner still owns another restaurant
        const still = await db.select({ id: restaurants.id }).from(restaurants).where(eq(restaurants.ownerId, prevOwnerId)).limit(1);
        if (still.length === 0) {
            await db.update(profiles).set({ role: "customer" }).where(eq(profiles.id, prevOwnerId));
        }
    }

    return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await assertAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id } = await params;

    await db.delete(menuItems).where(eq(menuItems.restaurantId, id));
    const [deleted] = await db.delete(restaurants).where(eq(restaurants.id, id)).returning({ id: restaurants.id });

    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
}
