import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { jwtDecode } from "jwt-decode";

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

function getUserIdFromCookies(request: NextRequest): string | null {
  const authCookie = request.cookies
    .getAll()
    .find((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));

  if (!authCookie) return null;

  try {
    const session = JSON.parse(authCookie.value);
    const payload = jwtDecode<{ sub: string; exp: number }>(
      session.access_token,
    );
    if (payload.exp < Date.now() / 1000) return null; //expired
    return payload.sub;
  } catch {
    return null;
  }
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anonymous";

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

  const isPublicGet =
    method === "GET" &&
    (pathname === "/" ||
      pathname.startsWith("/browse") ||
      pathname.startsWith("/portfolio/") ||
      pathname === "/login" ||
      pathname === "/signup");

  if (isPublicGet) {
    // return supabaseResponse แทน NextResponse.next()
    // เพื่อให้ cookie mechanism ทำงานได้แม้บน public pages
    addSecurityHeaders(supabaseResponse);
    return supabaseResponse;
  }

  const userId = getUserIdFromCookies(request);

  //auth guard
  const protectedRoutes = ["/uploadpage", "/profile", "/saved"];
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

  if (isProtected && !userId) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/uploadpage") && method === "POST") {
    const identifier = userId ?? ip;
    const { success, limit, reset } = await rateLimits.upload.limit(identifier);
    if (!success) return tooManyRequests(reset, limit);
  } else if (pathname.startsWith("/api/questions")) {
    const identifier = userId ?? ip;
    const { success, limit, reset } =
      await rateLimits.question.limit(identifier);
    if (!success) return tooManyRequests(reset, limit);
  } else if (pathname.startsWith("/api/")) {
    const { success, limit, reset } = await rateLimits.general.limit(ip);
    if (!success) return tooManyRequests(reset, limit);
  }

  // return supabaseResponse เสมอ
  addSecurityHeaders(supabaseResponse);
  return supabaseResponse;
}

export const config = {
  matcher: [
    // exclude static files and _next folder
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
