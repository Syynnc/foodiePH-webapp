import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { reviews, orders, restaurants } from "@/db/schema";
import { eq, avg, and } from "drizzle-orm";
import { sanitize } from "@/lib/sanitize";

async function getUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user ?? null;
}

// GET /api/reviews?orderId=xxx  — check if a review already exists
export async function GET(req: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orderId = new URL(req.url).searchParams.get("orderId");
    if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

    const [existing] = await db
        .select({ id: reviews.id, rating: reviews.rating, comment: reviews.comment })
        .from(reviews)
        .where(and(eq(reviews.orderId, orderId), eq(reviews.userId, user.id)))
        .limit(1);

    return NextResponse.json(existing ?? null);
}

// POST /api/reviews  — submit a review (one per order, only for delivered orders)
export async function POST(req: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orderId, rating, comment } = await req.json() as { orderId: string; rating: number; comment?: string };

    if (!orderId || typeof rating !== "number" || rating < 1 || rating > 5) {
        return NextResponse.json({ error: "orderId and rating (1–5) are required" }, { status: 400 });
    }

    // Verify the order belongs to this user and is delivered
    const [order] = await db
        .select({ restaurantId: orders.restaurantId, status: orders.status, userId: orders.userId })
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (order.status !== "delivered") return NextResponse.json({ error: "Can only review delivered orders" }, { status: 400 });
    if (!order.restaurantId) return NextResponse.json({ error: "No restaurant on order" }, { status: 400 });

    const [review] = await db.insert(reviews).values({
        orderId,
        userId: user.id,
        restaurantId: order.restaurantId,
        rating,
        comment: sanitize(comment) || null,
    }).onConflictDoNothing().returning();

    if (!review) return NextResponse.json({ error: "Already reviewed" }, { status: 409 });

    // Recompute and update restaurant rating
    const [agg] = await db
        .select({ avg: avg(reviews.rating) })
        .from(reviews)
        .where(eq(reviews.restaurantId, order.restaurantId));

    if (agg?.avg) {
        await db.update(restaurants)
            .set({ rating: String(parseFloat(agg.avg).toFixed(1)) })
            .where(eq(restaurants.id, order.restaurantId));
    }

    return NextResponse.json(review, { status: 201 });
}
