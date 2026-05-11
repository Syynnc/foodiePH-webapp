import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
    const user = await assertAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const rows = await db
        .select({
            id: profiles.id,
            email: profiles.email,
            fullName: profiles.fullName,
            role: profiles.role,
            company: profiles.company,
            createdAt: profiles.createdAt,
        })
        .from(profiles)
        .orderBy(sql`${profiles.createdAt} desc`);

    return NextResponse.json(rows);
}

export async function PATCH(req: Request) {
    const user = await assertAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id, role } = await req.json() as { id: string; role: string };
    if (!id || !role) return NextResponse.json({ error: "id and role required" }, { status: 400 });

    const allowed = ["customer", "driver", "admin", "restaurant"];
    if (!allowed.includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

    const [updated] = await db.update(profiles).set({ role }).where(eq(profiles.id, id)).returning({ id: profiles.id, role: profiles.role });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(updated);
}
