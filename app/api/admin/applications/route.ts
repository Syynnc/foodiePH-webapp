import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth";
import { db } from "@/db";
import { driverApplications, restaurantApplications, profiles, drivers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/admin/applications?type=driver|restaurant&status=pending
export async function GET(req: NextRequest) {
    if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") ?? "driver";
    const status = searchParams.get("status") ?? "pending";

    if (type === "driver") {
        const rows = await db
            .select({
                id: driverApplications.id,
                userId: driverApplications.userId,
                status: driverApplications.status,
                vehicleType: driverApplications.vehicleType,
                plateNumber: driverApplications.plateNumber,
                licenseNumber: driverApplications.licenseNumber,
                govIdUrl: driverApplications.govIdUrl,
                adminNotes: driverApplications.adminNotes,
                createdAt: driverApplications.createdAt,
                email: profiles.email,
                firstName: profiles.firstName,
                lastName: profiles.lastName,
            })
            .from(driverApplications)
            .leftJoin(profiles, eq(driverApplications.userId, profiles.id))
            .where(status === "all" ? undefined : eq(driverApplications.status, status))
            .orderBy(desc(driverApplications.createdAt));

        return NextResponse.json({ applications: rows });
    }

    // restaurant
    const rows = await db
        .select({
            id: restaurantApplications.id,
            userId: restaurantApplications.userId,
            status: restaurantApplications.status,
            restaurantName: restaurantApplications.restaurantName,
            cuisine: restaurantApplications.cuisine,
            address: restaurantApplications.address,
            phone: restaurantApplications.phone,
            description: restaurantApplications.description,
            permitUrl: restaurantApplications.permitUrl,
            adminNotes: restaurantApplications.adminNotes,
            createdAt: restaurantApplications.createdAt,
            email: profiles.email,
            firstName: profiles.firstName,
            lastName: profiles.lastName,
        })
        .from(restaurantApplications)
        .leftJoin(profiles, eq(restaurantApplications.userId, profiles.id))
        .where(status === "all" ? undefined : eq(restaurantApplications.status, status))
        .orderBy(desc(restaurantApplications.createdAt));

    return NextResponse.json({ applications: rows });
}
