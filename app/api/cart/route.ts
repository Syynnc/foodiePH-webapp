import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { cartItems } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);

async function getUserId() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
}

// POST — upsert a cart item (add or update qty)
export async function POST(req: Request) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { menuItemId, quantity } = await req.json();
        if (!menuItemId || typeof quantity !== "number") {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        if (quantity <= 0) {
            // Remove if qty drops to zero
            await db
                .delete(cartItems)
                .where(and(eq(cartItems.userId, userId), eq(cartItems.menuItemId, menuItemId)));
            return NextResponse.json({ deleted: true });
        }

        // Check for existing row
        const [existing] = await db
            .select()
            .from(cartItems)
            .where(and(eq(cartItems.userId, userId), eq(cartItems.menuItemId, menuItemId)))
            .limit(1);

        if (existing) {
            await db
                .update(cartItems)
                .set({ quantity, updatedAt: new Date() })
                .where(eq(cartItems.id, existing.id));
        } else {
            await db.insert(cartItems).values({ userId, menuItemId, quantity });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[POST /api/cart]", err);
        return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
    }
}

// DELETE — remove a single item from cart
export async function DELETE(req: Request) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const menuItemId = searchParams.get("menuItemId");
        if (!menuItemId) return NextResponse.json({ error: "Missing menuItemId" }, { status: 400 });

        await db
            .delete(cartItems)
            .where(and(eq(cartItems.userId, userId), eq(cartItems.menuItemId, menuItemId)));

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[DELETE /api/cart]", err);
        return NextResponse.json({ error: "Failed to delete cart item" }, { status: 500 });
    }
}