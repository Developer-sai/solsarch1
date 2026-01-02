"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Lightbulb, BarChart3, Settings, FileText, Grid, BookOpen, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  items?: NavItem[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    title: "Generate",
    href: "/generate",
    icon: <Lightbulb className="w-5 h-5" />,
  },
  {
    title: "Architectures",
    href: "/dashboard/architectures",
    icon: <Grid className="w-5 h-5" />,
  },
  {
    title: "Templates",
    href: "/templates",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    title: "Learning",
    href: "/docs",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="w-5 h-5" />,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <aside className="hidden md:flex w-64 bg-card/50 border-r border-border/40 flex-col h-screen sticky top-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={pathname === item.href ? "default" : "ghost"}
              className="w-full justify-start gap-3"
              asChild
            >
              <span>
                {item.icon}
                {item.title}
              </span>
            </Button>
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-border/40 space-y-2">
        <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
