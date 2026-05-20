import { NextResponse } from "next/server";
import { orders, orderItems, profiles, restaurants, menuItems } from "@/db/schema";
import { eq, desc, inArray, count } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";

async function getUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user ?? null;
}

async function ensureProfile(userId: string, email: string) {
    await db.insert(profiles).values({ id: userId, email }).onConflictDoNothing();
}

// GET — fetch the current user's orders with line items (paginated)
export async function GET(req: Request) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(req.url);
        const page  = Math.max(1, parseInt(url.searchParams.get("page")  ?? "1",  10));
        const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") ?? "10", 10)));
        const offset = (page - 1) * limit;

        const [{ total }] = await db
            .select({ total: count() })
            .from(orders)
            .where(eq(orders.userId, user.id));

        // Fetch orders newest-first, joined with restaurant name/image
        const userOrders = await db
            .select({
                id: orders.id,
                status: orders.status,
                subTotal: orders.subTotal,
                totalAmount: orders.totalAmount,
                deliveryAddress: orders.deliveryAddress,
                paymentMethod: orders.paymentMethod,
                createdAt: orders.createdAt,
                restaurantId: orders.restaurantId,
                restaurantName: restaurants.name,
                restaurantImage: restaurants.imageUrl,
            })
            .from(orders)
            .leftJoin(restaurants, eq(orders.restaurantId, restaurants.id))
            .where(eq(orders.userId, user.id))
            .orderBy(desc(orders.createdAt))
            .limit(limit)
            .offset(offset);

        if (userOrders.length === 0) return NextResponse.json({ data: [], total, page, limit });

        // Fetch all line items for these orders in a single query
        const orderIds = userOrders.map((o) => o.id);
        const lineItems = await db
            .select({
                orderId: orderItems.orderId,
                menuItemId: orderItems.menuItemId,
                quantity: orderItems.quantity,
                unitPrice: orderItems.unitPrice,
                name: menuItems.name,
                imageUrl: menuItems.imageUrl,
            })
            .from(orderItems)
            .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
            .where(inArray(orderItems.orderId, orderIds));

        // Group line items by orderId
        const itemsByOrder = lineItems.reduce<Record<string, typeof lineItems>>((acc, item) => {
            if (!acc[item.orderId]) acc[item.orderId] = [];
            acc[item.orderId].push(item);
            return acc;
        }, {});

        return NextResponse.json({
            data: userOrders.map((o) => ({ ...o, items: itemsByOrder[o.id] ?? [] })),
            total,
            page,
            limit,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[GET /api/orders]", message);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

// POST — place an order
// Body: { restaurantId, items: [{ menuItemId, quantity, unitPrice }], subTotal, totalAmount }
export async function POST(req: Request) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const userId = user.id;

        const { restaurantId, items, subTotal, totalAmount, deliveryAddress, paymentMethod } = await req.json();

        if (
            !restaurantId ||
            !Array.isArray(items) ||
            items.length === 0 ||
            typeof subTotal !== "number" ||
            typeof totalAmount !== "number" ||
            !deliveryAddress ||
            !paymentMethod
        ) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        await ensureProfile(userId, user.email ?? "");

        // Create the order
        const [order] = await db
            .insert(orders)
            .values({
                userId,
                restaurantId: restaurantId ?? null,
                status: "pending",
                subTotal,
                discount: 0,
                totalAmount,
                deliveryAddress,
                paymentMethod,
            })
            .returning();

        // Insert line items
        await db.insert(orderItems).values(
            items.map((item: { menuItemId: string; quantity: number; unitPrice: number }) => ({
                orderId: order.id,
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            }))
        );

        return NextResponse.json({ ok: true, orderId: order.id });
    } catch (err) {
        // Log the real error server-side and surface the message to the client
        // so you can see exactly what Postgres is rejecting during development.
        // Remove the `detail` field before going to production.
        console.error("[POST /api/orders]", err);
        return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
    }
}

// PATCH — cancel an order
export async function PATCH(req: Request) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        
        const { orderId, status } = await req.json();
        if (!orderId || status !== "cancelled") {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // Verify the order belongs to the user and is still pending
        const [existingOrder] = await db
            .select()
            .from(orders)
            .where(eq(orders.id, orderId))
            .limit(1);

        if (!existingOrder || existingOrder.userId !== user.id) {
            return NextResponse.json({ error: "Order not found or unauthorized" }, { status: 404 });
        }

        if (existingOrder.status !== "pending") {
            return NextResponse.json({ error: "Order can only be cancelled while pending" }, { status: 400 });
        }

        await db
            .update(orders)
            .set({ status: "cancelled" })
            .where(eq(orders.id, orderId));

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[PATCH /api/orders]", err);
        return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
    }
}