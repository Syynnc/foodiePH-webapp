import { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CartProvider } from "@/app/context/CartContext";
import DashboardShell from "@/app/components/DashboardShell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  return (
    <CartProvider>
      <DashboardShell userEmail={user.email || "user@foodie.ph"}>
        {children}
      </DashboardShell>
    </CartProvider>
  );
}