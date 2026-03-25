"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, LogOut, User, LayoutDashboard, UtensilsCrossed, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const isLoading = status === "loading";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 shadow-lg shadow-amber-900/40 group-hover:bg-amber-400 transition-colors">
            <UtensilsCrossed className="h-4 w-4 text-zinc-950" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            Chai<span className="text-amber-500">Dham</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">

          {/* Role-based nav link */}
          {session && (
            <Link
              href={isAdmin ? "/dashboard" : "/menu"}
              className="hidden sm:flex items-center gap-1.5 text-sm text-zinc-400 hover:text-amber-400 transition-colors"
            >
              {isAdmin ? (
                <>
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </>
              ) : (
                <>
                  <UtensilsCrossed className="h-4 w-4" />
                  Menu
                </>
              )}
            </Link>
          )}

          {/* Cart — only for users */}
          {session && !isAdmin && (
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-zinc-950">
                  0
                </span>
              </Button>
            </Link>
          )}

          {/* Auth state */}
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-zinc-800 animate-pulse" />
          ) : session ? (
            // Profile dropdown
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full outline-none ring-offset-zinc-950 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2">
                  <Avatar className="h-8 w-8 border border-zinc-700">
                    <AvatarFallback
                      className={
                        isAdmin
                          ? "bg-red-500 text-white text-xs font-bold"
                          : "bg-green-500 text-white text-xs font-bold"
                      }
                    >
                      {isAdmin ? "A" : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium text-white">
                    {session.user?.username}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-52 bg-zinc-900 border-zinc-800 text-zinc-300"
              >
                <DropdownMenuLabel className="text-zinc-400 font-normal text-xs">
                  {isAdmin && (
                    <span className="inline-flex items-center mb-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                      ADMIN
                    </span>
                  )}
                  <p className="text-zinc-400 text-xs">Signed in as</p>
                  <p className="text-white font-semibold text-sm truncate">
                    {session.user?.username}
                  </p>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-zinc-800" />

                {/* Role-based item */}
                <DropdownMenuItem asChild className="hover:bg-zinc-800 hover:text-white cursor-pointer">
                  <Link href={isAdmin ? "/dashboard" : "/menu"}>
                    {isAdmin ? (
                      <><LayoutDashboard className="mr-2 h-4 w-4 text-amber-400" />Dashboard</>
                    ) : (
                      <><UtensilsCrossed className="mr-2 h-4 w-4 text-amber-400" />Menu</>
                    )}
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="hover:bg-zinc-800 hover:text-white cursor-pointer">
  <Link href="/menu">
    <UtensilsCrossed className="mr-2 h-4 w-4 text-amber-400" />
    Menu
  </Link>
</DropdownMenuItem>

                <DropdownMenuSeparator className="bg-zinc-800" />

                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/sign-in" })}
                  className="text-red-400 hover:bg-zinc-800 hover:text-red-300 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Logged out
            <div className="flex items-center gap-2">
              <Link href="/sign-in">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  Sign in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium shadow-lg shadow-amber-900/30"
                >
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}