import { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CartProvider } from "@/app/context/CartContext";
import DashboardShell from "@/app/components/DashboardShell";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const [profile] = await db
    .select({ firstName: profiles.firstName, lastName: profiles.lastName })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  return (
    <ErrorBoundary>
      <CartProvider>
        <DashboardShell
          userEmail={user?.email || "user@foodie.ph"}
          userName={
            profile?.firstName && profile?.lastName
              ? { first: profile.firstName, last: profile.lastName }
              : undefined
          }
        >
          {children}
        </DashboardShell>
      </CartProvider>
    </ErrorBoundary>
  );
}
