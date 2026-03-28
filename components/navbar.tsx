"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  ShoppingCart, LogOut, User, Home, LayoutDashboard,
  UtensilsCrossed, ChevronDown, X, Trash2, Plus, Minus,
  FileText, Coffee, Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

type OrderType = "dine-in" | "takeaway";

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
  const [orderType, setOrderType] = useState<OrderType>("dine-in");
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (drawerOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [drawerOpen]);

  const toggleNotes = (id: string) =>
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));

  const setNote = (id: string, val: string) =>
    setItemNotes((prev) => ({ ...prev, [id]: val }));

  return (
    <>
      {/* ─────────────────────── Navbar ─────────────────────── */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.5)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 shadow-lg shadow-amber-900/40 group-hover:bg-amber-400 group-hover:shadow-amber-500/30 transition-all duration-200">
              <UtensilsCrossed className="h-4 w-4 text-zinc-950" />
            </div>
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
              <div className="h-8 w-8 rounded-full bg-zinc-800 animate-pulse" />
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
                             [&_[data-highlighted]]:bg-zinc-800 [&_[data-highlighted]]:text-zinc-100
                             [&_[data-highlighted]_svg]:text-amber-400"
                >
                  {/* User info */}
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

                  <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-zinc-300 cursor-pointer outline-none transition-colors">
                    <Link href="/" className="flex items-center gap-2.5">
                      <Home className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>Home</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-zinc-300 cursor-pointer outline-none transition-colors">
                    <Link href="/profile" className="flex items-center gap-2.5">
                      <User className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-zinc-300 cursor-pointer outline-none transition-colors">
                      <Link href="/dashboard" className="flex items-center gap-2.5">
                        <LayoutDashboard className="h-4 w-4 text-amber-400 shrink-0" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {!isAdmin && (
                    <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-zinc-300 cursor-pointer outline-none transition-colors">
                      <Link href="/menu" className="flex items-center gap-2.5">
                        <UtensilsCrossed className="h-4 w-4 text-amber-400 shrink-0" />
                        <span>Menu</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-zinc-800 -mx-1.5 my-1" />

                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/sign-in" })}
                    className="rounded-lg px-3 py-2 text-red-400 cursor-pointer outline-none transition-colors
                               data-[highlighted]:bg-zinc-800 data-[highlighted]:!text-red-300
                               [&_svg]:text-red-400 data-[highlighted]:[&_svg]:text-red-300"
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

      {/* Frosted backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-50 transition-all duration-300 ${drawerOpen
          ? "opacity-100 pointer-events-auto bg-black/50 backdrop-blur-sm"
          : "opacity-0 pointer-events-none"
          }`}
      />

      {/* Glass panel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col
          transition-transform duration-300 ease-in-out
          ${drawerOpen ? "translate-x-0" : "translate-x-full"}
          bg-zinc-950/60 backdrop-blur-2xl
          border-l border-white/[0.07]
          [box-shadow:-20px_0_60px_rgba(0,0,0,0.5),inset_1px_0_0_rgba(255,255,255,0.04)]
        `}
      >
        {/* Top gloss sheen */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="h-5 w-5 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Your Cart</h2>
            {cartCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-zinc-950">
                {cartCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg
              border border-white/[0.08] bg-white/[0.04]
              text-zinc-400 hover:text-white hover:bg-white/[0.1]
              transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Items ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {cartItems.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full gap-4 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full
                bg-white/[0.04] border border-white/[0.08]
                shadow-[0_0_0_8px_rgba(255,255,255,0.02)]">
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
              <div
                key={item._id}
                className="relative rounded-2xl overflow-hidden
                  bg-white/[0.04] hover:bg-white/[0.06]
                  border border-white/[0.06] hover:border-white/[0.1]
                  transition-all duration-200"
              >
                {/* Card inner gloss */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none rounded-2xl" />

                {/* Main row */}
                <div className="flex gap-3 p-3 relative">

                  {/* Thumbnail */}
                  <div className="h-14 w-14 flex-shrink-0 rounded-xl
                    bg-white/[0.06] border border-white/[0.06]
                    flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <UtensilsCrossed className="h-5 w-5 text-zinc-600" />
                    )}
                  </div>

                  {/* Name + price + qty */}
                  <div className="flex flex-1 flex-col gap-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                    <p className="text-xs font-medium text-amber-400">₹{item.price}</p>
                    <div className="flex items-center gap-2 mt-auto">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md
                          bg-white/[0.06] hover:bg-white/[0.12]
                          border border-white/[0.08]
                          text-zinc-300 hover:text-white transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-sm font-semibold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md
                          bg-white/[0.06] hover:bg-white/[0.12]
                          border border-white/[0.08]
                          text-zinc-300 hover:text-white transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Delete + line total */}
                  <div className="flex flex-col items-end justify-between flex-shrink-0">
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg
                        border border-red-500/[0.15] bg-red-500/[0.06]
                        text-red-500/50 hover:text-red-400 hover:bg-red-500/[0.15]
                        transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <p className="text-xs font-semibold text-zinc-400">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* ── Per-item order details ── */}
                <div className="border-t border-white/[0.05]">
                  <button
                    onClick={() => toggleNotes(item._id)}
                    className="flex w-full items-center justify-between px-3 py-2
                      text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <span className="flex items-center gap-1.5 text-[11px] font-medium">
                      <FileText className="h-3 w-3" />
                      {itemNotes[item._id] ? "Edit order details" : "Add order details"}
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-300 ${expandedNotes[item._id] ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {/* Smooth slide-down panel — max-height transition */}
                  <div
                    style={{
                      maxHeight: expandedNotes[item._id] ? "120px" : "0px",
                      opacity: expandedNotes[item._id] ? 1 : 0,
                      overflow: "hidden",
                      transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease",
                    }}
                  >
                    <div className="px-3 pb-3 pt-0.5">
                      <textarea
                        value={itemNotes[item._id] ?? ""}
                        onChange={(e) => setNote(item._id, e.target.value)}
                        placeholder="e.g. Less sugar, extra ginger, no ice…"
                        rows={2}
                        className="w-full resize-none rounded-xl px-3 py-2 text-xs
                          bg-white/[0.05] border border-white/[0.08]
                          text-zinc-200 placeholder:text-zinc-600
                          focus:outline-none focus:border-amber-500/40 focus:bg-white/[0.07]
                          transition-all"
                      />
                    </div>
                  </div>

                  {/* Collapsed note preview — only when closed and note exists */}
                  {!expandedNotes[item._id] && itemNotes[item._id] && (
                    <p className="px-3 pb-2.5 text-[11px] text-zinc-500 italic truncate">
                      "{itemNotes[item._id]}"
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Footer ── */}
        {cartItems.length > 0 && (
          <div className="relative px-4 pt-3 pb-5 space-y-3 border-t border-white/[0.06] bg-white/[0.015]">

            {/* Subtotal row */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Subtotal</span>
              <span className="text-base font-bold text-white">₹{cartTotal.toFixed(2)}</span>
            </div>
            <p className="text-[11px] text-zinc-600">Taxes and delivery calculated at checkout</p>

            {/* ── Dine In / Takeaway toggle ── */}
            <div className="flex rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.03]">
              <button
                onClick={() => setOrderType("dine-in")}
                className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all duration-200 ${orderType === "dine-in"
                  ? "bg-amber-500 text-zinc-950"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                  }`}
              >
                <Coffee className="h-4 w-4" />
                Dine In
              </button>
              <button
                onClick={() => setOrderType("takeaway")}
                className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all duration-200 ${orderType === "takeaway"
                  ? "bg-amber-500 text-zinc-950"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                  }`}
              >
                <Truck className="h-4 w-4" />
                Takeaway
              </button>
            </div>

            {/* ── Checkout button ── */}
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-full py-3 rounded-xl font-semibold text-sm text-zinc-950
                bg-amber-500 hover:bg-amber-400
                active:scale-[0.99]
                transition-all duration-150"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </aside>
    </>
  );
}