import { NextResponse } from "next/server";
import { orders, profiles, drivers, driverApplications } from "@/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { regionLabel } from "@/lib/ph-regions";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: orderId } = await params;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const [profile] = await db
            .select({ role: profiles.role })
            .from(profiles)
            .where(eq(profiles.id, user.id))
            .limit(1);

        if (!profile || profile.role !== "driver")
            return NextResponse.json({ error: "Not a driver" }, { status: 403 });

        // ── Resolve driver's service region ──────────────────────────────────
        // First check the drivers table, then fall back to their latest approved
        // application (in case the drivers row was created before the region
        // column was added).
        let [driverRow] = await db
            .select({ serviceRegion: drivers.serviceRegion })
            .from(drivers)
            .where(eq(drivers.id, user.id))
            .limit(1);

        let driverRegion = driverRow?.serviceRegion ?? null;

        if (!driverRegion) {
            // Try latest approved application
            const [latestApp] = await db
                .select({ serviceRegion: driverApplications.serviceRegion })
                .from(driverApplications)
                .where(eq(driverApplications.userId, user.id))
                .orderBy(desc(driverApplications.createdAt))
                .limit(1);
            driverRegion = latestApp?.serviceRegion ?? null;
        }

        // ── Fetch the order to check its delivery region ─────────────────────
        const [order] = await db
            .select({
                id: orders.id,
                status: orders.status,
                driverId: orders.driverId,
                deliveryRegion: orders.deliveryRegion,
            })
            .from(orders)
            .where(eq(orders.id, orderId))
            .limit(1);

        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        // ── Zone enforcement ─────────────────────────────────────────────────
        // Block the driver if both the order AND the driver have known regions
        // and they don't match.
        if (driverRegion && order.deliveryRegion && driverRegion !== order.deliveryRegion) {
            return NextResponse.json(
                {
                    error: `This order is outside your delivery zone. ` +
                        `You are registered in ${regionLabel(driverRegion)}, ` +
                        `but this order delivers to ${regionLabel(order.deliveryRegion)}.`,
                    code: "ZONE_MISMATCH",
                    driverRegion,
                    orderRegion: order.deliveryRegion,
                },
                { status: 403 }
            );
        }

        // ── Ensure driver record exists (auto-create on first accept) ────────
        // Copy the service region from the application if available so that
        // the drivers row stays consistent.
        await db
            .insert(drivers)
            .values({ id: user.id, serviceRegion: driverRegion })
            .onConflictDoNothing();

        // If the drivers row already existed but had no region, backfill it now.
        if (driverRegion && !driverRow?.serviceRegion) {
            await db
                .update(drivers)
                .set({ serviceRegion: driverRegion })
                .where(eq(drivers.id, user.id));
        }

        // ── Claim the order ──────────────────────────────────────────────────
        // Only claim if the restaurant has marked it ready_for_pickup and no
        // driver is assigned yet. Status stays ready_for_pickup until the driver
        // physically picks it up and calls the /pickup endpoint.
        const [updated] = await db
            .update(orders)
            .set({ driverId: user.id })
            .where(and(
                eq(orders.id, orderId),
                eq(orders.status, "ready_for_pickup"),
                isNull(orders.driverId),
            ))
            .returning({ id: orders.id });

        if (!updated) return NextResponse.json({ error: "Order no longer available" }, { status: 409 });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[POST /api/driver/orders/[id]/accept]", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
