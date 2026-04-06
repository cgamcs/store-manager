import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { authConfig } from "@/auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        correo: { label: "Correo electrónico", type: "email" },
        contrasena: { label: "Contraseña", type: "password" },
        rememberMe: { label: "Recordarme", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.correo || !credentials?.contrasena) return null

        let usuario
        try {
          usuario = await prisma.usuario.findUnique({
            where: { correo: credentials.correo as string },
            include: { perfilCajero: true },
          })
        } catch (err) {
          console.error("[auth] DB error en authorize:", err)
          return null
        }

        if (!usuario) {
          console.error("[auth] Usuario no encontrado:", credentials.correo)
          return null
        }

        const passwordMatch = await bcrypt.compare(
          credentials.contrasena as string,
          usuario.contrasena
        )

        if (!passwordMatch) {
          console.error("[auth] Contraseña incorrecta para:", credentials.correo)
          return null
        }

        const ROL_ADMIN = 1
        // Cajeros sin perfil activo no pueden iniciar sesión
        if (usuario.rolId !== ROL_ADMIN && !usuario.perfilCajero?.activo) {
          console.error("[auth] Cajero sin perfil activo:", credentials.correo)
          return null
        }

        return {
          id: String(usuario.id),
          name: usuario.nombre,
          email: usuario.correo,
          rolId: usuario.rolId,
          rememberMe: credentials.rememberMe === "true",
        }
      },
    }),
  ],
})
