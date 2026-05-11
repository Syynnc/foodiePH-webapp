import { NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { assertRestaurantOwner } from "@/lib/auth";
import { sanitize } from "@/lib/sanitize";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await assertRestaurantOwner(id);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const [row] = await db.select().from(restaurants).where(eq(restaurants.id, id)).limit(1);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await assertRestaurantOwner(id);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

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
    }).where(eq(restaurants.id, id)).returning();

    return NextResponse.json(updated);
}
