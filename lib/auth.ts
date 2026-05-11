import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { profiles, restaurants } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function assertAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const [p] = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.id, user.id)).limit(1);
    if (!p || p.role !== "admin") return null;
    return user;
}

export async function assertOwner(): Promise<{ id: string; role: string } | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const [p] = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.id, user.id)).limit(1);
    if (!p || p.role !== "restaurant") return null;
    return { id: user.id, role: p.role };
}

/** Verify the caller owns (or is admin of) a specific restaurant. Returns the user or null. */
export async function assertRestaurantOwner(restaurantId: string): Promise<{ id: string; role: string } | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const [p] = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.id, user.id)).limit(1);
    if (!p) return null;
    if (p.role === "admin") return { id: user.id, role: p.role };
    if (p.role !== "restaurant") return null;
    const [r] = await db.select({ id: restaurants.id }).from(restaurants)
        .where(and(eq(restaurants.id, restaurantId), eq(restaurants.ownerId, user.id))).limit(1);
    if (!r) return null;
    return { id: user.id, role: p.role };
}
