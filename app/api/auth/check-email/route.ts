import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ exists: false });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    // Service key not configured — inline check skipped; form submission handles duplicates
    return NextResponse.json({ exists: false });
  }

  try {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error } = await admin.auth.admin.getUserByEmail(email.trim().toLowerCase());
    // No error means a user was found
    return NextResponse.json({ exists: !error });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
