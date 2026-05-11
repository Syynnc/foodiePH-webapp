import { NextResponse } from "next/server";
import { cartItems, profiles, menuItems } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user ?? null;
}

async function ensureProfile(userId: string, email: string) {
    await db
        .insert(profiles)
        .values({ id: userId, email })
        .onConflictDoNothing();
}

// GET — fetch the current user's cart items
export async function GET() {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const rows = await db
            .select({
                id: cartItems.id,
                menuItemId: cartItems.menuItemId,
                quantity: cartItems.quantity,
                name: menuItems.name,
                price: menuItems.price,
                imageUrl: menuItems.imageUrl,
                restaurantId: menuItems.restaurantId,
            })
            .from(cartItems)
            .leftJoin(menuItems, eq(cartItems.menuItemId, menuItems.id))
            .where(eq(cartItems.userId, user.id));

        return NextResponse.json(rows);
    } catch (err) {
        console.error("[GET /api/cart]", err);
        return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
    }
}

// POST — upsert a cart item (add or update qty)
export async function POST(req: Request) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const userId = user.id;
        await ensureProfile(userId, user.email ?? "");

        const { menuItemId, quantity } = await req.json();
        if (!menuItemId || !UUID_RE.test(menuItemId) || typeof quantity !== "number") {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        if (quantity <= 0) {
            await db
                .delete(cartItems)
                .where(and(eq(cartItems.userId, userId), eq(cartItems.menuItemId, menuItemId)));
            return NextResponse.json({ deleted: true });
        }

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
        if (!menuItemId || !UUID_RE.test(menuItemId)) {
            return NextResponse.json({ error: "Invalid or missing menuItemId" }, { status: 400 });
        }

        await db
            .delete(cartItems)
            .where(and(eq(cartItems.userId, userId), eq(cartItems.menuItemId, menuItemId)));

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[DELETE /api/cart]", err);
        return NextResponse.json({ error: "Failed to delete cart item" }, { status: 500 });
    }
}
