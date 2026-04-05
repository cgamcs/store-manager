import "next-auth"
import "next-auth/jwt"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    rolId?: number
  }

  interface Session {
    user: {
      id: string
      rolId: number
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    rolId?: number
  }
}
