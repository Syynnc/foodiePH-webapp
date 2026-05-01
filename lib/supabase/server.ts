import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function isNetworkError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return (
    msg.includes("fetch failed") ||
    msg.includes("Connect Timeout") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("AbortError") ||
    msg.includes("abort") ||
    msg.includes("UND_ERR")
  );
}

// Wraps fetch with:
//  - A per-attempt AbortController timeout (30s — covers slow connects too)
//  - Automatic retry (up to 2 extra attempts) for transient network errors,
//    with a short back-off between attempts (1s, then 2s)
function resilientFetch(timeout = 30_000, retries = 2): typeof fetch {
  return async (input, init) => {
    let lastErr: unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
      const ctrl = new AbortController();
      const id = setTimeout(() => ctrl.abort(), timeout);

      try {
        const res = await fetch(input, { ...init, signal: ctrl.signal });
        clearTimeout(id);
        return res;
      } catch (e) {
        clearTimeout(id);
        lastErr = e;
        // Only retry on network-level failures, not on 4xx/5xx or intentional aborts
        if (!isNetworkError(e) || attempt === retries) throw e;
        await new Promise(r => setTimeout(r, 1_000 * (attempt + 1)));
      }
    }

    throw lastErr;
  };
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { fetch: resilientFetch() },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
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
