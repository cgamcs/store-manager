"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-xl text-muted-foreground hover:text-destructive"
      onClick={() => signOut({ redirectTo: "/" })}
    >
      <LogOut className="w-5 h-5" />
    </Button>
  )
}
