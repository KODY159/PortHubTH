import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server";
import  type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  //if user login redirect to upload page ifnot go to login page
  const { data: { user }, error } = await supabase.auth.getUser();

  // if dont have session and try to go /upload
  if (request.nextUrl.pathname.startsWith("/uploadpage")) {
    if (!user || error){
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      const response = NextResponse.redirect(redirectUrl);

      request.cookies.getAll().forEach((cookie) => {
        if (cookie.name.startsWith("sb-")){
          response.cookies.delete(cookie.name);
        }
      })
      return response;
    }
  }

  return supabaseResponse
}


export const config = {
  matcher: ["/uploadpage/:path*"],
}