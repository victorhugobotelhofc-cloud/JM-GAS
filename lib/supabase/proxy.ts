import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(
  request: NextRequest
) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(name, value);
            }
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const rotaProtegida =
    pathname.startsWith("/point") ||
    pathname.startsWith("/jm") ||
    pathname.startsWith("/config");

  // Sem login → manda para /login
  // e guarda qual página o usuário queria abrir.
  if (rotaProtegida && !user) {
    const url = request.nextUrl.clone();

    url.pathname = "/login";

    url.searchParams.set(
      "next",
      request.nextUrl.pathname
    );

    return NextResponse.redirect(url);
  }

  // Se já estiver logado e abrir /login,
  // manda para a página solicitada ou para /point.
  if (pathname.startsWith("/login") && user) {
    const destino =
      request.nextUrl.searchParams.get("next") ||
      "/point";

    const url = request.nextUrl.clone();

    url.pathname = destino;
    url.search = "";

    return NextResponse.redirect(url);
  }

  return response;
}
