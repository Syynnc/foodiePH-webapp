"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  let error;
  try {
    ({ error } = await supabase.auth.signInWithPassword({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    if (msg.includes("Connect Timeout") || msg.includes("fetch failed")) {
      return { error: "Unable to reach the server. Please check your connection and try again." };
    }
    return { error: msg };
  }

  if (error) {
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
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      options: {
        data: {
          full_name: formData.get("full_name") as string,
          company: formData.get("company") as string,
        },
      },
    }));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    if (msg.includes("Connect Timeout") || msg.includes("fetch failed")) {
      return { error: "Unable to reach the server. Please check your connection and try again." };
    }
    return { error: msg };
  }

  if (error) {
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
