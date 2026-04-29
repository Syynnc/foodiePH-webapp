import { NextResponse } from "next/server";
import { orders, profiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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

        // Only the assigned driver can mark pickup
        const [updated] = await db
            .update(orders)
            .set({ status: "on_the_way" })
            .where(and(eq(orders.id, orderId), eq(orders.driverId, user.id), eq(orders.status, "preparing")))
            .returning({ id: orders.id });

        if (!updated) return NextResponse.json({ error: "Cannot update this order" }, { status: 409 });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[POST /api/driver/orders/[id]/pickup]", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
