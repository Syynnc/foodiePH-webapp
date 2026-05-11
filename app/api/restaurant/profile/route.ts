import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { profiles, restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sanitize } from "@/lib/sanitize";

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

    const [row] = await db
        .select()
        .from(restaurants)
        .where(eq(restaurants.ownerId, user.id))
        .limit(1);

    if (!row) return NextResponse.json({ error: "No restaurant linked to this account" }, { status: 404 });
    return NextResponse.json(row);
}

export async function PUT(req: Request) {
    const user = await assertOwner();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const [existing] = await db.select({ id: restaurants.id }).from(restaurants).where(eq(restaurants.ownerId, user.id)).limit(1);
    if (!existing) return NextResponse.json({ error: "No restaurant linked to this account" }, { status: 404 });

    const body = await req.json();
    const { name, cuisine, description, address, phone, imageUrl, minOrder, deliveryTime } = body as Record<string, string>;

    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const [updated] = await db.update(restaurants).set({
        name: sanitize(name),
        cuisine: sanitize(cuisine) || null,
        description: sanitize(description) || null,
        address: sanitize(address) || null,
        phone: phone?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        minOrder: minOrder ? parseInt(minOrder) : undefined,
        deliveryTime: sanitize(deliveryTime) || null,
    }).where(eq(restaurants.id, existing.id)).returning();

    return NextResponse.json(updated);
}
