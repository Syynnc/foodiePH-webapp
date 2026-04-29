import { NextResponse } from "next/server";
import { orders, profiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "delivery-proofs";

async function uploadToStorage(storagePath: string, buffer: ArrayBuffer, contentType: string): Promise<string> {
    const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${SERVICE_KEY}`,
            "apikey": SERVICE_KEY,
            "Content-Type": contentType,
            "x-upsert": "true",
        },
        body: new Uint8Array(buffer),
        cache: "no-store",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Storage upload failed (${res.status}): ${text}`);
    }

    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

        const formData = await req.formData();
        const file = formData.get("photo") as File | null;
        if (!file) return NextResponse.json({ error: "No photo provided" }, { status: 400 });

        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const storagePath = `${orderId}/${Date.now()}.${ext}`;
        const arrayBuffer = await file.arrayBuffer();

        const publicUrl = await uploadToStorage(storagePath, arrayBuffer, file.type || "image/jpeg");

        const [updated] = await db
            .update(orders)
            .set({ status: "delivered", deliveryPhotoUrl: publicUrl, deliveredAt: new Date() })
            .where(and(eq(orders.id, orderId), eq(orders.driverId, user.id), eq(orders.status, "on_the_way")))
            .returning({ id: orders.id });

        if (!updated) return NextResponse.json({ error: "Cannot update this order" }, { status: 409 });

        return NextResponse.json({ ok: true, photoUrl: publicUrl });
    } catch (err) {
        console.error("[POST /api/driver/orders/[id]/deliver]", err);
        return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
    }
}
