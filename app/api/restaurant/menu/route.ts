import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { profiles, restaurants, menuItems } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

async function getOwnerRestaurant(userId: string) {
    const [row] = await db.select({ id: restaurants.id }).from(restaurants).where(eq(restaurants.ownerId, userId)).limit(1);
    return row ?? null;
}

async function assertOwner() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const [p] = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.id, user.id)).limit(1);
    if (!p || (p.role !== "restaurant" && p.role !== "admin")) return null;
    return user;
}

export async function GET() {
    const user = await assertOwner();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const rest = await getOwnerRestaurant(user.id);
    if (!rest) return NextResponse.json({ error: "No restaurant linked" }, { status: 404 });

    const items = await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.restaurantId, rest.id))
        .orderBy(sql`${menuItems.category} asc, ${menuItems.name} asc`);

    return NextResponse.json(items);
}

export async function POST(req: Request) {
    const user = await assertOwner();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const rest = await getOwnerRestaurant(user.id);
    if (!rest) return NextResponse.json({ error: "No restaurant linked" }, { status: 404 });

    const body = await req.json();
    const { name, description, price, imageUrl, category, isAvailable } = body as Record<string, string>;

    if (!name?.trim() || !price) return NextResponse.json({ error: "name and price are required" }, { status: 400 });

    const [row] = await db.insert(menuItems).values({
        restaurantId: rest.id,
        name: name.trim(),
        description: description || null,
        price: parseInt(price),
        imageUrl: imageUrl || null,
        category: category || null,
        isAvailable: isAvailable !== "false",
    }).returning();

    return NextResponse.json(row, { status: 201 });
}
