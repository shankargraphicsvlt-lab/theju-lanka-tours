import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabasePublicConfig } from "@/lib/supabase/config";

/**
 * Refreshes the staff session cookie on admin routes (Server Components
 * cannot write cookies). This is not the access check: every admin page and
 * action verifies the user and their staff role on the server.
 */
export async function proxy(request: NextRequest) {
  const config = supabasePublicConfig();
  if (!config) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        for (const { name, value } of toSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
