"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function networkError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (
    msg.includes("Connect Timeout") ||
    msg.includes("fetch failed") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("AbortError") ||
    msg.includes("abort")
  ) {
    return "Cannot reach the server. Your Supabase project may be paused — visit supabase.com/dashboard to restore it, then try again.";
  }
  return msg || "An unexpected error occurred. Please try again.";
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  let error;
  try {
    ({ error } = await supabase.auth.signInWithPassword({
      email: (formData.get("email") as string).trim().toLowerCase(),
      password: formData.get("password") as string,
    }));
  } catch (e) {
    return { error: networkError(e) };
  }

  if (error) {
    // Surface friendlier messages for common cases
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return { error: "Incorrect email or password. Please try again." };
    }
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { error: "Please confirm your email address before signing in." };
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  let error;
  try {
    ({ error } = await supabase.auth.signUp({
      email: (formData.get("email") as string).trim().toLowerCase(),
      password: formData.get("password") as string,
      options: {
        data: {
          full_name: (formData.get("full_name") as string).trim(),
          company: (formData.get("company") as string)?.trim() ?? "",
        },
      },
    }));
  } catch (e) {
    return { error: networkError(e) };
  }

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "An account with this email already exists. Try signing in instead." };
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/auth?message=Check your email to confirm your account.");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
