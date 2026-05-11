import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth";
import { db } from "@/db";
import { profiles, restaurants, menuItems } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

function parseIntOrNull(val: unknown): number | null {
    const n = parseInt(String(val ?? ""), 10);
    return isNaN(n) ? null : n;
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
    const body = await req.json() as Record<string, unknown>;
    const { name, cuisine, description, address, phone, imageUrl, minOrder, deliveryTime, isActive, ownerId } = body;

    if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const oldRow = await db.select({ ownerId: restaurants.ownerId }).from(restaurants).where(eq(restaurants.id, id)).limit(1);
    const prevOwnerId = oldRow[0]?.ownerId;

    const parsedMinOrder = parseIntOrNull(minOrder) ?? 500;

    // Accept both boolean and string "true"/"false" from clients
    let parsedIsActive: boolean | undefined;
    if (isActive !== undefined) {
        parsedIsActive = isActive === true || isActive === "true";
    }

    const [updated] = await db.update(restaurants).set({
        name: name.trim(),
        cuisine: (cuisine as string) || null,
        description: (description as string) || null,
        address: (address as string) || null,
        phone: (phone as string) || null,
        imageUrl: (imageUrl as string) || null,
        minOrder: parsedMinOrder,
        deliveryTime: (deliveryTime as string) || null,
        isActive: parsedIsActive,
        ownerId: (ownerId as string) || null,
    }).where(eq(restaurants.id, id)).returning();

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const newOwnerId = ownerId as string | undefined;
    if (newOwnerId && newOwnerId !== prevOwnerId) {
        await db.update(profiles).set({ role: "restaurant" }).where(eq(profiles.id, newOwnerId));
    }
    if (prevOwnerId && prevOwnerId !== newOwnerId) {
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
