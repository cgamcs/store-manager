import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  callbacks: {
    // Solo codifica/decodifica el token — la lógica de rutas va en proxy.ts
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.rolId = (user as { rolId?: number }).rolId
        const rememberMe = (user as { rememberMe?: boolean }).rememberMe ?? false
        const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 8 * 60 * 60 // 30 días vs 8 horas
        token.exp = Math.floor(Date.now() / 1000) + maxAge
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        ;(session.user as { rolId?: number }).rolId = token.rolId as number
      }
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
