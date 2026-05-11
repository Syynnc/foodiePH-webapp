import { NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { assertOwner } from "@/lib/auth";

export async function GET() {
    const user = await assertOwner();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const rows = await db
        .select({
            id: restaurants.id,
            name: restaurants.name,
            cuisine: restaurants.cuisine,
            imageUrl: restaurants.imageUrl,
            isActive: restaurants.isActive,
        })
        .from(restaurants)
        .where(eq(restaurants.ownerId, user.id));

    return NextResponse.json(rows);
}
