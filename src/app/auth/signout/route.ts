import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: Request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.headers
            .get("Cookie")
            ?.split(";")
            .map((c) => {
              const [name, ...rest] = c.split("=");
              return { name: name.trim(), value: rest.join("=").trim() };
            }) ?? [];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookie = `${name}=${value}`;
            const response = NextResponse.redirect(new URL("/", request.url));
            response.headers.append("Set-Cookie", cookie);
          });
        },
      },
    },
  );

  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url));
}
