import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth";
import { db } from "@/db";
import { driverApplications, restaurantApplications, profiles, drivers } from "@/db/schema";
import { eq } from "drizzle-orm";

// PATCH /api/admin/applications/[id]
// Body: { type: 'driver' | 'restaurant', action: 'approve' | 'deny', notes?: string }
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const { type, action, notes } = await req.json();

    if (!["driver", "restaurant"].includes(type)) {
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    if (!["approve", "deny"].includes(action)) {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const newStatus = action === "approve" ? "approved" : "denied";

    if (type === "driver") {
        const [app] = await db
            .update(driverApplications)
            .set({ status: newStatus, adminNotes: notes ?? null, updatedAt: new Date() })
            .where(eq(driverApplications.id, id))
            .returning();

        if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

        if (action === "approve") {
            // Promote profile to driver role
            await db.update(profiles).set({ role: "driver" }).where(eq(profiles.id, app.userId));

            // Pull the profile name to populate the drivers table
            const [prof] = await db
                .select({ firstName: profiles.firstName, lastName: profiles.lastName })
                .from(profiles)
                .where(eq(profiles.id, app.userId))
                .limit(1);

            // Upsert driver record
            await db
                .insert(drivers)
                .values({
                    id: app.userId,
                    firstName: prof?.firstName ?? null,
                    lastName: prof?.lastName ?? null,
                    vehicleType: app.vehicleType ?? "motorcycle",
                    plateNumber: app.plateNumber ?? null,
                    licenseNumber: app.licenseNumber ?? null,
                })
                .onConflictDoUpdate({
                    target: drivers.id,
                    set: {
                        vehicleType: app.vehicleType ?? "motorcycle",
                        plateNumber: app.plateNumber ?? null,
                        licenseNumber: app.licenseNumber ?? null,
                    },
                });
        }

        return NextResponse.json({ ok: true });
    }

    // restaurant
    const [app] = await db
        .update(restaurantApplications)
        .set({ status: newStatus, adminNotes: notes ?? null, updatedAt: new Date() })
        .where(eq(restaurantApplications.id, id))
        .returning();

    if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (action === "approve") {
        await db.update(profiles).set({ role: "restaurant" }).where(eq(profiles.id, app.userId));
    }

    return NextResponse.json({ ok: true });
}
