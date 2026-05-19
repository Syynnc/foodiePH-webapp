import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sanitize } from "@/lib/sanitize";

async function getAuthedUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id));
  if (!profile) {
    const meta = user.user_metadata ?? {};
    [profile] = await db
      .insert(profiles)
      .values({
        id: user.id,
        email: user.email ?? "",
        firstName: meta.first_name ?? null,
        lastName: meta.last_name ?? null,
      })
      .returning();
  }

  return NextResponse.json(profile);
}

export async function PATCH(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { firstName, lastName, phone, company } = body;

  const [updated] = await db
    .update(profiles)
    .set({
      firstName: sanitize(firstName) || null,
      lastName: sanitize(lastName) || null,
      phone: phone?.trim() || null,
      company: sanitize(company) || null,
    })
    .where(eq(profiles.id, user.id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  return NextResponse.json(updated);
}
