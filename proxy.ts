import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const rateLimits = {
  upload: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    prefix: "rl:upload",
  }),
  question: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(20, "10 m"),
    prefix: "rl:question",
  }),
  general: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    prefix: "rl:general",
  }),
};

function tooManyRequests(reset: number, limit: number): NextResponse {
  return new NextResponse(
    JSON.stringify({ error: "Too many requests กรุณารอสักครู่" }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(reset),
        "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
      },
    },
  );
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ?? "anonymous";
  const path = request.nextUrl.pathname;

  const identity = user?.id ?? ip;
  if (path.startsWith("/uploadpage")) {
    // use IP เพื่อป้องกันการ upload ที่ไม่ได้ login
    const { success, limit, reset } = await rateLimits.upload.limit(identity);
    if (!success) return tooManyRequests(reset, limit);
  } else if (path.startsWith("/api/questions")) {
    // question limiter ใช้ IP เพราะคนถามคำถามอาจยังไม่ login
    const { success, limit, reset } = await rateLimits.question.limit(identity);

    if (!success) return tooManyRequests(reset, limit);
  } else {
    // general limiter สำหรับทุก route ที่เหลือ
    const { success, limit, reset } = await rateLimits.general.limit(identity);

    if (!success) return tooManyRequests(reset, limit);
  }

  // ── Auth Guard ──────────────────────────────────────────
  // redirect ไป login ถ้าพยายามเข้า protected route โดยไม่ login
  const protectedRoutes = ["/uploadpage", "/profile", "/saved"];
  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", request.nextUrl.pathname); // จำ path ที่จะไป
    return NextResponse.redirect(loginUrl);
  }

  // ── Security Headers ──────────────────────────────────
  // เพิ่มทุก response ไม่ใช่แค่ protected routes
  supabaseResponse.headers.set("X-Frame-Options", "DENY");
  supabaseResponse.headers.set("X-Content-Type-Options", "nosniff");
  supabaseResponse.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin",
  );

  return supabaseResponse;
}

export const config = {
  matcher: [
    // exclude static files and _next folder
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
