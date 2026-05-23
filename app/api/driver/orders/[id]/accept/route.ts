import { NextResponse } from "next/server";
import { orders, profiles, drivers } from "@/db/schema";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";

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

        // Ensure driver record exists (auto-create on first accept)
        await db.insert(drivers).values({ id: user.id }).onConflictDoNothing();

        // Claim the order — only if the restaurant has marked it ready_for_pickup
        // and no driver is assigned yet. Status stays ready_for_pickup until driver
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
