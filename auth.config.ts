import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  callbacks: {
    // Solo codifica/decodifica el token — la lógica de rutas va en middleware.ts
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.rolId = (user as { rolId?: number }).rolId
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
