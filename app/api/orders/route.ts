import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { orders, orderItems } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

// Singleton client — avoids connection exhaustion in serverless/edge environments.
let _client: ReturnType<typeof postgres> | null = null;
function getDb() {
    if (!_client) {
        _client = postgres(process.env.DATABASE_URL!, {
            prepare: false,
            max: 5, // cap pool size; Supabase's free tier allows ~15 total connections
        });
    }
    return drizzle(_client);
}

async function getUserId() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
}

// POST — place an order
// Body: { restaurantId, items: [{ menuItemId, quantity, unitPrice }], subTotal, totalAmount }
export async function POST(req: Request) {
    try {
        const userId = await getUserId();
        if (!userId)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { restaurantId, items, subTotal, totalAmount } = await req.json();

        if (
            !Array.isArray(items) ||
            items.length === 0 ||
            typeof subTotal !== "number" ||
            typeof totalAmount !== "number"
        ) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const db = getDb();

        // Create the order
        const [order] = await db
            .insert(orders)
            .values({
                userId,
                restaurantId: restaurantId ?? null,
                status: "pending",
                subTotal,
                discount: 0,
                totalAmount,
            })
            .returning();

        // Insert line items
        await db.insert(orderItems).values(
            items.map((item: { menuItemId: string; quantity: number; unitPrice: number }) => ({
                orderId: order.id,
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            }))
        );

        return NextResponse.json({ ok: true, orderId: order.id });
    } catch (err) {
        // Log the real error server-side and surface the message to the client
        // so you can see exactly what Postgres is rejecting during development.
        // Remove the `detail` field before going to production.
        const message = err instanceof Error ? err.message : String(err);
        console.error("[POST /api/orders]", message);
        return NextResponse.json(
            { error: "Failed to place order", detail: message },
            { status: 500 }
        );
    }
}