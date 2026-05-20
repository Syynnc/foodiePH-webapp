import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth";
import { db } from "@/db";
import { orders, restaurants, drivers } from "@/db/schema";
import { gte, sql, count, sum, eq, and } from "drizzle-orm";

export async function GET() {
    const user = await assertAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const now = new Date();

    // ── Last 7 days: orders per day + revenue per day ──────────────────────────
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyRows = await db
        .select({
            day: sql<string>`DATE(${orders.createdAt})`.as("day"),
            orderCount: count(),
            revenue: sum(orders.totalAmount),
        })
        .from(orders)
        .where(gte(orders.createdAt, sevenDaysAgo))
        .groupBy(sql`DATE(${orders.createdAt})`)
        .orderBy(sql`DATE(${orders.createdAt})`);

    // Fill in any missing days so the chart always shows 7 points
    const dailyMap: Record<string, { orderCount: number; revenue: number }> = {};
    for (const row of dailyRows) {
        dailyMap[row.day] = {
            orderCount: Number(row.orderCount),
            revenue: Number(row.revenue ?? 0),
        };
    }
    const daily: { date: string; orderCount: number; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
        daily.push({
            date: label,
            orderCount: dailyMap[key]?.orderCount ?? 0,
            revenue: dailyMap[key]?.revenue ?? 0,
        });
    }

    // ── Order status breakdown ─────────────────────────────────────────────────
    const statusRows = await db
        .select({
            status: orders.status,
            count: count(),
        })
        .from(orders)
        .groupBy(orders.status);

    const statusBreakdown = statusRows.map(r => ({
        status: r.status,
        count: Number(r.count),
    }));

    // ── Top 5 restaurants by order count ──────────────────────────────────────
    const topRestaurants = await db
        .select({
            id: restaurants.id,
            name: restaurants.name,
            imageUrl: restaurants.imageUrl,
            orderCount: count(),
            revenue: sum(orders.totalAmount),
        })
        .from(orders)
        .leftJoin(restaurants, eq(orders.restaurantId, restaurants.id))
        .groupBy(restaurants.id, restaurants.name, restaurants.imageUrl)
        .orderBy(sql`count(*) desc`)
        .limit(5);

    // ── Summary totals ─────────────────────────────────────────────────────────
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [[totalRevenue], [monthRevenue], [activeDriverCount], [deliveredCount]] = await Promise.all([
        db.select({ total: sum(orders.totalAmount) }).from(orders),
        db.select({ total: sum(orders.totalAmount) })
            .from(orders)
            .where(gte(orders.createdAt, thirtyDaysAgo)),
        db.select({ count: count() })
            .from(drivers)
            .where(and(eq(drivers.isActive, true), eq(drivers.isAvailable, true))),
        db.select({ count: count() })
            .from(orders)
            .where(eq(orders.status, "delivered")),
    ]);

    return NextResponse.json({
        daily,
        statusBreakdown,
        topRestaurants: topRestaurants.map(r => ({
            id: r.id,
            name: r.name ?? "Unknown",
            imageUrl: r.imageUrl,
            orderCount: Number(r.orderCount),
            revenue: Number(r.revenue ?? 0),
        })),
        summary: {
            totalRevenue: Number(totalRevenue?.total ?? 0),
            monthRevenue: Number(monthRevenue?.total ?? 0),
            activeDrivers: Number(activeDriverCount?.count ?? 0),
            deliveredOrders: Number(deliveredCount?.count ?? 0),
        },
    });
}
