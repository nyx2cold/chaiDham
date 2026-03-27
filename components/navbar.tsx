"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  ShoppingCart, LogOut, User, Home, LayoutDashboard,
  UtensilsCrossed, ChevronDown, X, Trash2, Plus, Minus,
} from "lucide-react";
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
import { useState, useEffect } from "react";
import { useCart } from "@/context/cartContext";

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const isLoading = status === "loading";

  const displayName =
    (session?.user as any)?.username ?? session?.user?.name ?? null;
  const displayEmail =
    (session?.user as any)?.email ?? session?.user?.email ?? null;

  const initials = getInitials(displayName);

  const { cartItems, removeFromCart, updateQuantity, cartCount, cartTotal } =
    useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      {/* ─────────────────────── Navbar ─────────────────────── */}
      {/*
        FIXED: was bg-white which broke the dark zinc theme entirely.
        Now: glassmorphism — semi-transparent zinc-950 + backdrop-blur.
        The bottom border uses a subtle white/5 line instead of zinc-800
        so it reads as a glass edge rather than a hard divider.
      */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.5)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 shadow-lg shadow-amber-900/40 group-hover:bg-amber-400 group-hover:shadow-amber-500/30 transition-all duration-200">
              <UtensilsCrossed className="h-4 w-4 text-zinc-950" />
            </div>
            {/* FIXED: was text-black — invisible on dark bg */}
            <span className="text-lg font-bold text-white tracking-tight">
              Chai<span className="text-amber-500">Dham</span>
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">

            {/* Cart — users only */}
            {session && !isAdmin && (
              <button
                onClick={() => setDrawerOpen(true)}
                className="relative p-2 rounded-md text-zinc-400 hover:text-amber-400 hover:bg-white/5 transition-colors"
                aria-label="Open cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-zinc-950 leading-none">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Auth */}
            {isLoading ? (
              <div className="h-8 w-8 rounded-full bg-zinc-800 bg-transparent animate-pulse" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 whitespace-nowrap">
                    <Avatar className="h-8 w-8 border border-zinc-700">
                      <AvatarFallback
                        className={
                          isAdmin
                            ? "bg-red-500/90 text-white text-xs font-bold"
                            : "bg-amber-500 text-zinc-950 text-xs font-bold"
                        }
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden xs:inline-block sm:inline-block max-w-[120px] truncate text-sm font-medium text-white leading-none">
                      {displayName}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-56 rounded-xl border border-zinc-800 bg-zinc-900 p-1.5 shadow-2xl shadow-black/50
                             [&_[data-highlighted]]:bg-amber-500/10 [&_[data-highlighted]]:text-amber-400
                             [&_[data-highlighted]_svg]:text-amber-400"
                >
                  {/* User info label */}
                  <div className="px-3 py-2.5 mb-1">
                    {isAdmin && (
                      <span className="inline-flex items-center mb-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30 tracking-wider">
                        ADMIN
                      </span>
                    )}
                    <p className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium">
                      Signed in as
                    </p>
                    <p className="text-white font-semibold text-sm truncate mt-0.5">
                      {displayEmail ?? "Unknown"}
                    </p>
                  </div>

                  <DropdownMenuSeparator className="bg-zinc-800 -mx-1.5 my-1" />

                  <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-zinc-300 hover:text-amber-400 hover:bg-amber-500/10 focus:text-amber-400 focus:bg-amber-500/10 cursor-pointer outline-none transition-all duration-150">
                    <Link href="/" className="group flex items-center gap-2.5">
                      <Home className="h-4 w-4 text-amber-400 shrink-0 transition-all duration-300 group-hover:text-amber-300 group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] group-focus:text-amber-300 group-focus:drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                      <span>Home</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-zinc-300 hover:text-amber-400 hover:bg-amber-500/10 focus:text-amber-400 focus:bg-amber-500/10 cursor-pointer outline-none transition-all duration-150">
                    <Link href="/profile" className="group flex items-center gap-2.5">
                      <User className="h-4 w-4 text-amber-400 shrink-0 transition-all duration-300 group-hover:text-amber-300 group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] group-focus:text-amber-300 group-focus:drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-zinc-300 hover:text-amber-400 hover:bg-amber-500/10 focus:text-amber-400 focus:bg-amber-500/10 cursor-pointer outline-none transition-all duration-150">
                      <Link href="/dashboard" className="group flex items-center gap-2.5">
                        <LayoutDashboard className="h-4 w-4 text-amber-400 shrink-0 transition-all duration-300 group-hover:text-amber-300 group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] group-focus:text-amber-300 group-focus:drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {!isAdmin && (
                    <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-zinc-300 hover:text-amber-400 hover:bg-amber-500/10 focus:text-amber-400 focus:bg-amber-500/10 cursor-pointer outline-none transition-all duration-150">
                      <Link href="/menu" className="group flex items-center gap-2.5">
                        <UtensilsCrossed className="h-4 w-4 text-amber-400 shrink-0 transition-all duration-300 group-hover:text-amber-300 group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] group-focus:text-amber-300 group-focus:drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                        <span>Menu</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-zinc-800 -mx-1.5 my-1" />

                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/sign-in" })}
                    className="group rounded-lg px-3 py-2 text-red-400 cursor-pointer outline-none transition-all duration-300
                               data-[highlighted]:bg-red-500/10 data-[highlighted]:!text-red-400
                               [&_svg]:text-red-400 data-[highlighted]:[&_svg]:text-red-400 data-[highlighted]:[&_svg]:drop-shadow-[0_0_8px_rgba(248,113,113,0.6)]"
                  >
                    <LogOut className="mr-2.5 h-4 w-4 shrink-0" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/5">
                    Sign in
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium shadow-lg shadow-amber-900/30">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ─────────────────────── Cart Drawer ─────────────────────── */}

      {/* Backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      />

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-zinc !bg-transparent border-l border-zinc-800 shadow-2xl transition-transform duration-300 ease-in-out ${drawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Your Cart</h2>
            {cartCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-zinc-950">
                {cartCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800">
                <ShoppingCart className="h-7 w-7 text-zinc-600" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Your cart is empty</p>
                <p className="text-zinc-500 text-xs mt-1">Add items from the menu to get started</p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-amber-400 text-sm hover:text-amber-300 underline underline-offset-2 transition-colors"
              >
                Browse menu →
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item._id} className="flex gap-3 rounded-xl bg-zinc-900 border border-zinc-800 p-3">
                <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <UtensilsCrossed className="h-6 w-6 text-zinc-600" />
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                  <p className="text-xs font-medium text-amber-400">₹{item.price}</p>
                  <div className="flex items-center gap-2 mt-auto">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between flex-shrink-0">
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="p-1.5 rounded-md text-zinc-600 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <p className="text-xs font-semibold text-zinc-300">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-zinc-800 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Subtotal</span>
              <span className="text-base font-bold text-white">₹{cartTotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-zinc-600">Taxes and delivery calculated at checkout</p>
            <Button
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold h-11 shadow-lg shadow-amber-900/30"
              onClick={() => setDrawerOpen(false)}
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}