import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth";
import { db } from "@/db";
import { profiles, restaurants, menuItems } from "@/db/schema";
import { eq, count, sql, ilike, or } from "drizzle-orm";

function parseIntOrNull(val: unknown): number | null {
    const n = parseInt(String(val ?? ""), 10);
    return isNaN(n) ? null : n;
}

export async function GET(req: Request) {
    const user = await assertAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const url    = new URL(req.url);
    const page   = Math.max(1, parseInt(url.searchParams.get("page")  ?? "1",  10));
    const limit  = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "15", 10)));
    const search = url.searchParams.get("search")?.trim() ?? "";
    const offset = (page - 1) * limit;

    const where = search
        ? or(ilike(restaurants.name, `%${search}%`), ilike(restaurants.cuisine, `%${search}%`))
        : undefined;

    const [{ total }] = await db
        .select({ total: count() })
        .from(restaurants)
        .where(where);

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
            ownerName: sql<string | null>`NULLIF(TRIM(CONCAT(${profiles.firstName}, ' ', COALESCE(${profiles.lastName}, ''))), '')`,
        })
        .from(restaurants)
        .leftJoin(profiles, eq(restaurants.ownerId, profiles.id))
        .where(where)
        .orderBy(sql`${restaurants.createdAt} desc`)
        .limit(limit)
        .offset(offset);

    const counts = await db
        .select({ restaurantId: menuItems.restaurantId, count: count() })
        .from(menuItems)
        .groupBy(menuItems.restaurantId);

    const countMap = Object.fromEntries(counts.map(c => [c.restaurantId, c.count]));

    return NextResponse.json({
        data: rows.map(r => ({ ...r, menuItemCount: countMap[r.id] ?? 0 })),
        total,
        page,
        limit,
    });
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
        const [ownerProfile] = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.id, ownerId)).limit(1);
        if (!ownerProfile) return NextResponse.json({ error: "Owner account not found." }, { status: 400 });
        if (ownerProfile.role === "driver") return NextResponse.json({ error: "Cannot assign a driver as a restaurant owner. Remove their driver role first." }, { status: 400 });
        if (ownerProfile.role === "admin") return NextResponse.json({ error: "Cannot assign an admin as a restaurant owner." }, { status: 400 });
        await db.update(profiles).set({ role: "restaurant" }).where(eq(profiles.id, ownerId));
    }

    return NextResponse.json(row, { status: 201 });
}
