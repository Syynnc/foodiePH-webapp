import { NextResponse } from "next/server";
import { cartItems, profiles } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";

async function getUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user ?? null;
}

// Ensure a profiles row exists for this Supabase auth user.
// The FK on cart_items and orders requires the user_id to exist in profiles.
async function ensureProfile(userId: string, email: string) {
    await db
        .insert(profiles)
        .values({ id: userId, email })
        .onConflictDoNothing();
}

// POST — upsert a cart item (add or update qty)
export async function POST(req: Request) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const userId = user.id;
        await ensureProfile(userId, user.email ?? "");

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
        const user = await getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const userId = user.id;

        const { searchParams } = new URL(req.url);
        const menuItemId = searchParams.get("menuItemId");
        if (!menuItemId)
            return NextResponse.json({ error: "Missing menuItemId" }, { status: 400 });

        await db
            .delete(cartItems)
            .where(and(eq(cartItems.userId, userId), eq(cartItems.menuItemId, menuItemId)));

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[DELETE /api/cart]", err);
        return NextResponse.json({ error: "Failed to delete cart item" }, { status: 500 });
    }
}