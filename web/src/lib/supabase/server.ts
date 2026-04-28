import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(items) {
          try {
            for (const c of items) cookieStore.set(c.name, c.value, c.options);
          } catch { /* ignored: server component cookies are read-only */ }
        },
      },
    },
  );
}
