import { NextResponse } from "next/server";
import { orders, restaurants } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { assertOwner } from "@/lib/auth";
import { db } from "@/db";

// POST — restaurant owner marks order ready for pickup → ready_for_pickup
export async function POST(_req: Request, { params }: { params: Promise<{ orderId: string }> }) {
    try {
        const { orderId } = await params;
        const user = await assertOwner();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        const ownerRestaurants = await db
            .select({ id: restaurants.id })
            .from(restaurants)
            .where(eq(restaurants.ownerId, user.id));

        if (ownerRestaurants.length === 0)
            return NextResponse.json({ error: "No restaurants found" }, { status: 403 });

        const restaurantIds = ownerRestaurants.map((r) => r.id);

        // Mark ready: confirmed → ready_for_pickup
        const [updated] = await db
            .update(orders)
            .set({ status: "ready_for_pickup" })
            .where(
                and(
                    eq(orders.id, orderId),
                    eq(orders.status, "confirmed"),
                    inArray(orders.restaurantId, restaurantIds),
                )
            )
            .returning({ id: orders.id });

        if (!updated)
            return NextResponse.json({ error: "Order must be confirmed before marking ready" }, { status: 409 });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[POST /api/restaurant/orders/[id]/ready]", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
