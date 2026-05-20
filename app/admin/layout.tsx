import { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import AdminShell from "./AdminShell";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth");

    const [profile] = await db
        .select({ role: profiles.role, email: profiles.email, firstName: profiles.firstName, lastName: profiles.lastName })
        .from(profiles)
        .where(eq(profiles.id, user.id))
        .limit(1);

    if (!profile || profile.role !== "admin") redirect("/");

    const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || null;

    return (
        <ErrorBoundary>
            <AdminShell email={profile.email} name={name}>
                {children}
            </AdminShell>
        </ErrorBoundary>
    );
}
