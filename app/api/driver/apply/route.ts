import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { db } from "@/db";
import { profiles, driverApplications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET — return current user's latest driver application
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ application: null });

    const [app] = await db
        .select()
        .from(driverApplications)
        .where(eq(driverApplications.userId, user.id))
        .orderBy(desc(driverApplications.createdAt))
        .limit(1);

    return NextResponse.json({ application: app ?? null });
}

// POST — submit a driver application (multipart/form-data)
export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Block if already approved (already a driver)
    const [profile] = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.id, user.id)).limit(1);
    if (profile?.role === "driver") return NextResponse.json({ error: "Already a driver" }, { status: 400 });

    // Block if a pending application already exists
    const [existing] = await db
        .select({ id: driverApplications.id, status: driverApplications.status })
        .from(driverApplications)
        .where(eq(driverApplications.userId, user.id))
        .orderBy(desc(driverApplications.createdAt))
        .limit(1);

    if (existing?.status === "pending") {
        return NextResponse.json({ error: "You already have a pending application" }, { status: 400 });
    }

    let formData: FormData;
    try { formData = await req.formData(); } catch {
        return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const vehicleType = (formData.get("vehicleType") as string) ?? "motorcycle";
    const plateNumber = (formData.get("plateNumber") as string) ?? "";
    const licenseNumber = (formData.get("licenseNumber") as string) ?? "";
    const serviceRegion = (formData.get("serviceRegion") as string) || null;
    const govIdFile = formData.get("govId") as File | null;

    if (!govIdFile || govIdFile.size === 0) {
        return NextResponse.json({ error: "A government-issued ID is required." }, { status: 400 });
    }

    let govIdUrl: string | null = null;

    if (govIdFile && govIdFile.size > 0) {
        const admin = createAdminClient();
        const ext = govIdFile.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/gov-id-${Date.now()}.${ext}`;
        const buffer = Buffer.from(await govIdFile.arrayBuffer());

        const { error: uploadError } = await admin.storage
            .from("application-docs")
            .upload(path, buffer, { contentType: govIdFile.type, upsert: true });

        if (!uploadError) {
            const { data: { publicUrl } } = admin.storage
                .from("application-docs")
                .getPublicUrl(path);
            govIdUrl = publicUrl;
        }
    }

    const [newApp] = await db
        .insert(driverApplications)
        .values({ userId: user.id, vehicleType, plateNumber, licenseNumber, govIdUrl, serviceRegion })
        .returning();

    return NextResponse.json({ application: newApp });
}
