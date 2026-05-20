import { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";

export default async function DriverLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
