// Next.js 16: middleware.ts foi renomeado para proxy.ts.
// Runtime e Node apenas (nao edge) -- permite usar Auth.js + bcrypt sem restricoes.
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const isAuth = !!req.auth;
  const isLoginPage = req.nextUrl.pathname.startsWith("/login");

  if (!isAuth && !isLoginPage) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuth && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  // Aplica a todos os paths excepto API auth, estaticos e ficheiros publicos.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|webp)$).*)"],
};
