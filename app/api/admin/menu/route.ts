import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { profiles, menuItems } from "@/db/schema";
import { eq } from "drizzle-orm";

async function assertAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const [p] = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.id, user.id)).limit(1);
    if (!p || p.role !== "admin") return null;
    return user;
}

export async function POST(req: Request) {
    const user = await assertAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await req.json();
    const { restaurantId, name, description, price, imageUrl, category, isAvailable } = body as Record<string, string>;

    if (!restaurantId || !name?.trim() || !price) return NextResponse.json({ error: "restaurantId, name, and price are required" }, { status: 400 });

    const [row] = await db.insert(menuItems).values({
        restaurantId,
        name: name.trim(),
        description: description || null,
        price: parseInt(price),
        imageUrl: imageUrl || null,
        category: category || null,
        isAvailable: isAvailable !== "false",
    }).returning();

    return NextResponse.json(row, { status: 201 });
}
