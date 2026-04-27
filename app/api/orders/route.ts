import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { orders, orderItems, cartItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);

type OrderItemPayload = {
    menuItemId: string;
    quantity: number;
    unitPrice: number;
};

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const {
            restaurantId,
            items,
            subTotal,
            totalAmount,
            deliveryAddress,
            notes,
        }: {
            restaurantId: string;
            items: OrderItemPayload[];
            subTotal: number;
            totalAmount: number;
            deliveryAddress?: string;
            notes?: string;
        } = await req.json();

        if (!items?.length) {
            return NextResponse.json({ error: "No items in order" }, { status: 400 });
        }

        // 1. Insert the order
        const [order] = await db
            .insert(orders)
            .values({
                userId: user.id,
                restaurantId,
                subTotal,
                totalAmount,
                deliveryAddress,
                notes,
                status: "pending",
            })
            .returning();

        // 2. Insert order_items (price snapshot preserved)
        await db.insert(orderItems).values(
            items.map((i) => ({
                orderId: order.id,
                menuItemId: i.menuItemId,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
            }))
        );

        // 3. Clear the user's cart
        await db
            .delete(cartItems)
            .where(eq(cartItems.userId, user.id));

        return NextResponse.json({ orderId: order.id });
    } catch (err) {
        console.error("[POST /api/orders]", err);
        return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
    }
}