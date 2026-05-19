import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ exists: false });
  }

  try {
    const [row] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.email, email.trim().toLowerCase()))
      .limit(1);

    return NextResponse.json({ exists: !!row });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
