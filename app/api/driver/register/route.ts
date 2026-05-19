import { NextResponse } from "next/server";
import { profiles, drivers, driverApplications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";

// GET — check if current user is a driver, and return latest application status
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ isDriver: false, application: null });

        const [profile] = await db
            .select({ role: profiles.role, firstName: profiles.firstName, lastName: profiles.lastName })
            .from(profiles)
            .where(eq(profiles.id, user.id))
            .limit(1);

        const [driverRow] = profile?.role === "driver"
            ? await db.select().from(drivers).where(eq(drivers.id, user.id)).limit(1)
            : [null];

        const [latestApp] = await db
            .select({
                id: driverApplications.id,
                status: driverApplications.status,
                adminNotes: driverApplications.adminNotes,
                createdAt: driverApplications.createdAt,
            })
            .from(driverApplications)
            .where(eq(driverApplications.userId, user.id))
            .orderBy(desc(driverApplications.createdAt))
            .limit(1);

        return NextResponse.json({
            isDriver: profile?.role === "driver",
            driver: driverRow ?? null,
            profileName: { firstName: profile?.firstName ?? "", lastName: profile?.lastName ?? "" },
            application: latestApp ?? null,
        });
    } catch (err) {
        console.error("[GET /api/driver/register]", err);
        return NextResponse.json({ isDriver: false, application: null });
    }
}
