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
    const permitFile = formData.get("permit") as File | null;

    if (!permitFile || permitFile.size === 0) {
        return NextResponse.json({ error: "A business permit or registration document is required." }, { status: 400 });
    }

    let permitUrl: string | null = null;

    if (permitFile && permitFile.size > 0) {
        const admin = createAdminClient();
        const ext = permitFile.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/permit-${Date.now()}.${ext}`;
        const buffer = Buffer.from(await permitFile.arrayBuffer());

        const { error: uploadError } = await admin.storage
            .from("application-docs")
            .upload(path, buffer, { contentType: permitFile.type, upsert: true });

        if (!uploadError) {
            const { data: { publicUrl } } = admin.storage
                .from("application-docs")
                .getPublicUrl(path);
            permitUrl = publicUrl;
        }
    }

    const [newApp] = await db
        .insert(restaurantApplications)
        .values({ userId: user.id, restaurantName, cuisine, address, phone, description, permitUrl })
        .returning();

    return NextResponse.json({ application: newApp });
}
