import { NextResponse } from "next/server";
import { profiles, drivers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";

// POST — register current user as a driver
// Body: { licenseNumber?, vehicleType?, plateNumber? }
export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json().catch(() => ({}));
        const { firstName, lastName, licenseNumber, vehicleType, plateNumber } = body as Record<string, string>;

        // Ensure profile exists
        await db.insert(profiles).values({ id: user.id, email: user.email ?? "" }).onConflictDoNothing();

        // Promote role to driver
        await db.update(profiles).set({ role: "driver" }).where(eq(profiles.id, user.id));

        // Upsert driver record
        await db
            .insert(drivers)
            .values({ id: user.id, firstName, lastName, licenseNumber, vehicleType: vehicleType ?? "motorcycle", plateNumber })
            .onConflictDoUpdate({
                target: drivers.id,
                set: { firstName, lastName, licenseNumber, vehicleType: vehicleType ?? "motorcycle", plateNumber },
            });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[POST /api/driver/register]", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

// GET — check if current user is a driver
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ isDriver: false });

        const [profile] = await db
            .select({ role: profiles.role, firstName: profiles.firstName, lastName: profiles.lastName })
            .from(profiles)
            .where(eq(profiles.id, user.id))
            .limit(1);

        const [driverRow] = profile?.role === "driver"
            ? await db.select().from(drivers).where(eq(drivers.id, user.id)).limit(1)
            : [null];

        return NextResponse.json({
            isDriver: profile?.role === "driver",
            driver: driverRow ?? null,
            profileName: { firstName: profile?.firstName ?? "", lastName: profile?.lastName ?? "" },
        });
    } catch (err) {
        console.error("[GET /api/driver/register]", err);
        return NextResponse.json({ isDriver: false });
    }
}
