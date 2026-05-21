import { NextResponse } from "next/server";
import { orders, restaurants, menuItems, orderItems, drivers, profiles } from "@/db/schema";
import { eq, isNull, desc, inArray, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";

async function getDriverUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const [profile] = await db
        .select({ id: profiles.id, role: profiles.role })
        .from(profiles)
        .where(eq(profiles.id, user.id))
        .limit(1);

    if (!profile || profile.role !== "driver") return null;
    return { userId: user.id, email: user.email ?? "" };
}

// GET — available orders (preparing, no driver) + this driver's active order
export async function GET() {
    try {
        const driver = await getDriverUser();
        if (!driver) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Orders waiting for a driver (pending/confirmed/preparing + no driver assigned)
        const AVAILABLE_STATUSES = ["pending", "confirmed", "preparing"] as const;
        const available = await db
            .select({
                id: orders.id,
                status: orders.status,
                totalAmount: orders.totalAmount,
                deliveryAddress: orders.deliveryAddress,
                paymentMethod: orders.paymentMethod,
                createdAt: orders.createdAt,
                restaurantName: restaurants.name,
                restaurantImage: restaurants.imageUrl,
            })
            .from(orders)
            .leftJoin(restaurants, eq(orders.restaurantId, restaurants.id))
            .where(and(inArray(orders.status, [...AVAILABLE_STATUSES]), isNull(orders.driverId)))
            .orderBy(desc(orders.createdAt));

        // This driver's active delivery (on_the_way or still preparing but assigned to them)
        const myOrders = await db
            .select({
                id: orders.id,
                status: orders.status,
                totalAmount: orders.totalAmount,
                deliveryAddress: orders.deliveryAddress,
                paymentMethod: orders.paymentMethod,
                createdAt: orders.createdAt,
                deliveryPhotoUrl: orders.deliveryPhotoUrl,
                deliveredAt: orders.deliveredAt,
                restaurantName: restaurants.name,
                restaurantImage: restaurants.imageUrl,
            })
            .from(orders)
            .leftJoin(restaurants, eq(orders.restaurantId, restaurants.id))
            .where(eq(orders.driverId, driver.userId))
            .orderBy(desc(orders.createdAt));

        // Attach line items to my orders
        const myOrderIds = myOrders.map((o) => o.id);
        const lineItems = myOrderIds.length
            ? await db
                  .select({
                      orderId: orderItems.orderId,
                      quantity: orderItems.quantity,
                      unitPrice: orderItems.unitPrice,
                      name: menuItems.name,
                  })
                  .from(orderItems)
                  .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
                  .where(inArray(orderItems.orderId, myOrderIds))
            : [];

        const itemsByOrder = lineItems.reduce<Record<string, typeof lineItems>>((acc, i) => {
            if (!acc[i.orderId]) acc[i.orderId] = [];
            acc[i.orderId].push(i);
            return acc;
        }, {});

        return NextResponse.json({
            available,
            myOrders: myOrders.map((o) => ({ ...o, items: itemsByOrder[o.id] ?? [] })),
        });
    } catch (err) {
        console.error("[GET /api/driver/orders]", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
