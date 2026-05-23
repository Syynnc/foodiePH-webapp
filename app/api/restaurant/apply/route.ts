import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { db } from "@/db";
import { profiles, restaurantApplications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET — return current user's latest restaurant application
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ application: null });

    const [app] = await db
        .select()
        .from(restaurantApplications)
        .where(eq(restaurantApplications.userId, user.id))
        .orderBy(desc(restaurantApplications.createdAt))
        .limit(1);

    return NextResponse.json({ application: app ?? null });
}

// POST — submit a restaurant owner application (multipart/form-data)
export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [profile] = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.id, user.id)).limit(1);
    if (profile?.role === "restaurant") return NextResponse.json({ error: "Already a restaurant owner" }, { status: 400 });

    const [existing] = await db
        .select({ id: restaurantApplications.id, status: restaurantApplications.status })
        .from(restaurantApplications)
        .where(eq(restaurantApplications.userId, user.id))
        .orderBy(desc(restaurantApplications.createdAt))
        .limit(1);

    if (existing?.status === "pending") {
        return NextResponse.json({ error: "You already have a pending application" }, { status: 400 });
    }

    let formData: FormData;
    try { formData = await req.formData(); } catch {
        return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const restaurantName = (formData.get("restaurantName") as string)?.trim();
    if (!restaurantName) return NextResponse.json({ error: "Restaurant name is required" }, { status: 400 });

    const cuisine = (formData.get("cuisine") as string) ?? "";
    const address = (formData.get("address") as string) ?? "";
    const phone = (formData.get("phone") as string) ?? "";
    const description = (formData.get("description") as string) ?? "";
    const openingHours = (formData.get("openingHours") as string) ?? "";
    const minOrderStr = (formData.get("minOrder") as string) ?? "";
    const deliveryTime = (formData.get("deliveryTime") as string) ?? "";
    const website = (formData.get("website") as string) ?? "";
    const facebook = (formData.get("facebook") as string) ?? "";
    const seatingCapacityStr = (formData.get("seatingCapacity") as string) ?? "";

    const minOrder = minOrderStr ? parseInt(minOrderStr, 10) : null;
    const seatingCapacity = seatingCapacityStr ? parseInt(seatingCapacityStr, 10) : null;

    const permitFile = formData.get("permit") as File | null;
    const logoFile = formData.get("logo") as File | null;

    if (!permitFile || permitFile.size === 0) {
        return NextResponse.json({ error: "A business permit or registration document is required." }, { status: 400 });
    }

    const admin = createAdminClient();

    // Upload permit
    let permitUrl: string | null = null;
    const permitExt = permitFile.name.split(".").pop() ?? "jpg";
    const permitPath = `${user.id}/permit-${Date.now()}.${permitExt}`;
    const permitBuffer = Buffer.from(await permitFile.arrayBuffer());
    const { error: permitUploadError } = await admin.storage
        .from("application-docs")
        .upload(permitPath, permitBuffer, { contentType: permitFile.type, upsert: true });
    if (!permitUploadError) {
        const { data: { publicUrl } } = admin.storage.from("application-docs").getPublicUrl(permitPath);
        permitUrl = publicUrl;
    }

    // Upload logo (optional)
    let logoUrl: string | null = null;
    if (logoFile && logoFile.size > 0) {
        const logoExt = logoFile.name.split(".").pop() ?? "jpg";
        const logoPath = `${user.id}/logo-${Date.now()}.${logoExt}`;
        const logoBuffer = Buffer.from(await logoFile.arrayBuffer());
        const { error: logoUploadError } = await admin.storage
            .from("application-docs")
            .upload(logoPath, logoBuffer, { contentType: logoFile.type, upsert: true });
        if (!logoUploadError) {
            const { data: { publicUrl } } = admin.storage.from("application-docs").getPublicUrl(logoPath);
            logoUrl = publicUrl;
        }
    }

    const [newApp] = await db
        .insert(restaurantApplications)
        .values({
            userId: user.id,
            restaurantName,
            cuisine: cuisine || null,
            address: address || null,
            phone: phone || null,
            description: description || null,
            openingHours: openingHours || null,
            minOrder: minOrder ?? null,
            deliveryTime: deliveryTime || null,
            website: website || null,
            facebook: facebook || null,
            seatingCapacity: seatingCapacity ?? null,
            permitUrl,
            logoUrl,
        })
        .returning();

    return NextResponse.json({ application: newApp });
}
