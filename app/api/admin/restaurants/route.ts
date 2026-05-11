import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth";
import { db } from "@/db";
import { profiles, restaurants, menuItems } from "@/db/schema";
import { eq, count, sql } from "drizzle-orm";

function parseIntOrNull(val: unknown): number | null {
    const n = parseInt(String(val ?? ""), 10);
    return isNaN(n) ? null : n;
}

export async function GET() {
    const user = await assertAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const rows = await db
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
        .orderBy(sql`${restaurants.createdAt} desc`);

    const counts = await db
        .select({ restaurantId: menuItems.restaurantId, count: count() })
        .from(menuItems)
        .groupBy(menuItems.restaurantId);

    const countMap = Object.fromEntries(counts.map(c => [c.restaurantId, c.count]));

    return NextResponse.json(rows.map(r => ({ ...r, menuItemCount: countMap[r.id] ?? 0 })));
}

export async function POST(req: Request) {
    const user = await assertAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await req.json();
    const { name, cuisine, description, address, phone, imageUrl, minOrder, deliveryTime, ownerId } = body as Record<string, string>;

    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const parsedMinOrder = parseIntOrNull(minOrder) ?? 500;

    const [row] = await db.insert(restaurants).values({
        name: name.trim(),
        cuisine: cuisine || null,
        description: description || null,
        address: address || null,
        phone: phone || null,
        imageUrl: imageUrl || null,
        minOrder: parsedMinOrder,
        deliveryTime: deliveryTime || null,
        ownerId: ownerId || null,
        isActive: true,
    }).returning();

    if (ownerId) {
        await db.update(profiles).set({ role: "restaurant" }).where(eq(profiles.id, ownerId));
    }

    return NextResponse.json(row, { status: 201 });
}
