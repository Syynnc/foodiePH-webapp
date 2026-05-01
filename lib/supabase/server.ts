import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Wraps fetch with a 20-second abort timeout so a paused/unreachable
// Supabase project surfaces a clear error instead of hanging indefinitely.
function fetchWithTimeout(timeout = 20_000): typeof fetch {
  return (input, init) => {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeout);
    return fetch(input, { ...init, signal: ctrl.signal }).finally(() =>
      clearTimeout(id)
    );
  };
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { fetch: fetchWithTimeout() },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
