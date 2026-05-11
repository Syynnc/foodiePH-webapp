import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth";
import { db } from "@/db";
import { profiles, restaurants, menuItems, orders } from "@/db/schema";
import { count, sql } from "drizzle-orm";

export async function GET() {
    const user = await assertAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const [[restCount], [menuCount], [orderCount], [userCount], recentOrders] = await Promise.all([
        db.select({ count: count() }).from(restaurants),
        db.select({ count: count() }).from(menuItems),
        db.select({ count: count() }).from(orders),
        db.select({ count: count() }).from(profiles),
        db.select({
            id: orders.id,
            totalAmount: orders.totalAmount,
            status: orders.status,
            createdAt: orders.createdAt,
            restaurantId: orders.restaurantId,
        })
            .from(orders)
            .orderBy(sql`${orders.createdAt} desc`)
            .limit(5),
    ]);

    return NextResponse.json({
        restaurants: restCount.count,
        menuItems: menuCount.count,
        orders: orderCount.count,
        users: userCount.count,
        recentOrders,
    });
}
