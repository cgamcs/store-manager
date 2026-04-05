import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

const ROL_ADMIN = 1

export default NextAuth(authConfig).auth((req) => {
  const { auth: session, nextUrl } = req
  const isLoggedIn = !!session?.user
  const rolId = (session?.user as { rolId?: number })?.rolId
  const { pathname } = nextUrl

  // Rutas de administrador → requieren sesión activa con rolId de administrador
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url))
    }
    if (rolId !== ROL_ADMIN) {
      return NextResponse.redirect(new URL("/pos", req.url))
    }
    return NextResponse.next()
  }

  // POS → requiere sesión activa (cualquier rol)
  if (pathname.startsWith("/pos")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url))
    }
    return NextResponse.next()
  }

  // Rutas públicas → si ya hay sesión, redirigir al área correspondiente
  const publicRoutes = ["/", "/registro", "/verificar", "/recuperar", "/cambiar-password"]
  if (isLoggedIn && publicRoutes.includes(pathname)) {
    const destino = rolId === ROL_ADMIN ? "/admin/dashboard" : "/pos"
    return NextResponse.redirect(new URL(destino, req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
}
