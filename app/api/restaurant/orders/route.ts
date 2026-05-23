import { NextResponse } from "next/server";
import { orders, orderItems, menuItems, restaurants, profiles } from "@/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { assertOwner } from "@/lib/auth";
import { db } from "@/db";

// GET — all orders for this restaurant owner's restaurants
export async function GET() {
    try {
        const user = await assertOwner();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        // Get all restaurants owned by this user
        const ownerRestaurants = await db
            .select({ id: restaurants.id, name: restaurants.name })
            .from(restaurants)
            .where(eq(restaurants.ownerId, user.id));

        if (ownerRestaurants.length === 0) return NextResponse.json({ data: [] });

        const restaurantIds = ownerRestaurants.map((r) => r.id);

        // Fetch orders for those restaurants
        const restaurantOrders = await db
            .select({
                id: orders.id,
                status: orders.status,
                subTotal: orders.subTotal,
                totalAmount: orders.totalAmount,
                deliveryAddress: orders.deliveryAddress,
                paymentMethod: orders.paymentMethod,
                createdAt: orders.createdAt,
                restaurantId: orders.restaurantId,
                driverId: orders.driverId,
                // customer info
                customerEmail: profiles.email,
                customerFirst: profiles.firstName,
                customerLast: profiles.lastName,
                customerPhone: profiles.phone,
            })
            .from(orders)
            .leftJoin(profiles, eq(orders.userId, profiles.id))
            .where(inArray(orders.restaurantId, restaurantIds))
            .orderBy(desc(orders.createdAt));

        if (restaurantOrders.length === 0) return NextResponse.json({ data: [] });

        // Attach restaurant names
        const restaurantMap = Object.fromEntries(ownerRestaurants.map((r) => [r.id, r.name]));

        // Fetch line items
        const orderIds = restaurantOrders.map((o) => o.id);
        const lineItems = await db
            .select({
                orderId: orderItems.orderId,
                quantity: orderItems.quantity,
                unitPrice: orderItems.unitPrice,
                name: menuItems.name,
            })
            .from(orderItems)
            .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
            .where(inArray(orderItems.orderId, orderIds));

        const itemsByOrder = lineItems.reduce<Record<string, typeof lineItems>>((acc, item) => {
            if (!acc[item.orderId]) acc[item.orderId] = [];
            acc[item.orderId].push(item);
            return acc;
        }, {});

        return NextResponse.json({
            data: restaurantOrders.map((o) => ({
                ...o,
                restaurantName: o.restaurantId ? restaurantMap[o.restaurantId] : null,
                items: itemsByOrder[o.id] ?? [],
            })),
        });
    } catch (err) {
        console.error("[GET /api/restaurant/orders]", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
