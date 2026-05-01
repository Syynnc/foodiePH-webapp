import { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import AdminShell from "./AdminShell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth");

    const [profile] = await db
        .select({ role: profiles.role, email: profiles.email, fullName: profiles.fullName })
        .from(profiles)
        .where(eq(profiles.id, user.id))
        .limit(1);

    if (!profile || profile.role !== "admin") redirect("/");

    return (
        <AdminShell email={profile.email} name={profile.fullName}>
            {children}
        </AdminShell>
    );
}
