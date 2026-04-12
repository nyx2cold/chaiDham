"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  ShoppingCart, LogOut, User, Home, LayoutDashboard,
  UtensilsCrossed, ChevronDown, X, Trash2, Plus, Minus,
  FileText, Coffee, Truck, CheckCircle2, ChevronUp, History, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { useCart } from "@/context/cartContext";
import { useRouter } from "next/navigation";

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type OrderType = "dine-in" | "takeaway";
type CartTab = "live" | "history";

export interface PlacedOrder {
  orderId: string;
  orderNumber: number;
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  type: string;
  total: number;
  items: { name: string; quantity: number; price: number }[];
  placedAt: string;
}

const STATUS_STEPS = [
  { key: "pending", label: "Order Received", icon: "🧾", desc: "We got your order" },
  { key: "preparing", label: "Being Prepared", icon: "👨‍🍳", desc: "Kitchen is on it" },
  { key: "ready", label: "Ready for Pickup", icon: "✅", desc: "Come grab it!" },
];

const STATUS_COLOR: Record<string, string> = {
  pending: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  preparing: "text-blue-400 bg-blue-500/10 border-blue-500/25",
  ready: "text-green-400 bg-green-500/10 border-green-500/25",
  completed: "text-zinc-400 bg-white/[0.03] border-white/[0.06]",
  cancelled: "text-red-400 bg-red-500/10 border-red-500/20",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Placed",
  preparing: "Preparing",
  ready: "Ready!",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = session?.user?.role === "admin";
  const isLoading = status === "loading";

  const displayName = (session?.user as any)?.username ?? session?.user?.name ?? null;
  const displayEmail = (session?.user as any)?.email ?? session?.user?.email ?? null;
  const initials = getInitials(displayName);

  const { cartItems, removeFromCart, updateQuantity, cartCount, cartTotal, clearCart } = useCart();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>("dine-in");
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [cartTab, setCartTab] = useState<CartTab>("live");

  const [placedOrders, setPlacedOrders] = useState<PlacedOrder[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("chaidham_orders");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  // Persist to localStorage
  useEffect(() => {
    try { localStorage.setItem("chaidham_orders", JSON.stringify(placedOrders)); } catch { }
  }, [placedOrders]);

  // Poll active order statuses every 5s
  useEffect(() => {
    const activeOrders = placedOrders.filter(
      (o) => o.status !== "completed" && o.status !== "cancelled"
    );
    if (activeOrders.length === 0) return;

    async function pollStatuses() {
      const updated = await Promise.all(
        placedOrders.map(async (order) => {
          if (order.status === "completed" || order.status === "cancelled") return order;
          try {
            const res = await fetch(`/api/orders/${order.orderId}`);
            const data = await res.json();
            if (data.order?.status) return { ...order, status: data.order.status };
          } catch { }
          return order;
        })
      );
      setPlacedOrders(updated);
    }

    pollStatuses();
    const id = setInterval(pollStatuses, 5000);
    return () => clearInterval(id);
  }, [placedOrders.map((o) => o.orderId + o.status).join(",")]);

  const [collapsedOrders, setCollapsedOrders] = useState<Record<string, boolean>>({});

  useEffect(() => setMounted(true), []);

  // Reset to live tab & lock scroll on drawer open
  useEffect(() => {
    if (drawerOpen) {
      setCartTab("live");
      const sw = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${sw}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [drawerOpen]);

  // Hide navbar on dashboard
  if (pathname?.startsWith("/dashboard")) return null;

  const toggleNotes = (id: string) => setExpandedNotes((p) => ({ ...p, [id]: !p[id] }));
  const setNote = (id: string, val: string) => setItemNotes((p) => ({ ...p, [id]: val }));
  const toggleCollapse = (id: string) => setCollapsedOrders((p) => ({ ...p, [id]: !p[id] }));

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const itemsWithNotes = cartItems.map((item) => ({
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        notes: itemNotes[item._id] ?? "",
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsWithNotes, total: cartTotal, type: orderType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const newOrder: PlacedOrder = {
        orderId: data.orderId,
        orderNumber: data.order.orderNumber,
        status: "pending",
        type: orderType,
        total: cartTotal,
        placedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        items: cartItems.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
      };

      setPlacedOrders((prev) => [newOrder, ...prev]);
      clearCart();
      setItemNotes({});
      setExpandedNotes({});
      setCartTab("live");
    } catch (err: any) {
      alert(err.message ?? "Checkout failed. Try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const activeOrderCount = placedOrders.filter(
    (o) => o.status !== "completed" && o.status !== "cancelled"
  ).length;

  const liveOrders = placedOrders.filter((o) => o.status !== "completed" && o.status !== "cancelled");
  const historyOrders = placedOrders.filter((o) => o.status === "completed" || o.status === "cancelled");
  const visibleOrders = cartTab === "live" ? liveOrders : historyOrders;

  // ─── Order card renderer (shared between tabs) ────────────────────────────
  function OrderCard({ order }: { order: PlacedOrder }) {
    const stepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
    const isCollapsed = collapsedOrders[order.orderId] ?? (cartTab === "history");
    const isDone = order.status === "completed" || order.status === "cancelled";

    return (
      <div className="relative rounded-2xl overflow-hidden">
        <div className={`absolute inset-0 rounded-2xl backdrop-blur-sm pointer-events-none
          ${isDone
            ? "bg-white/[0.03] border border-white/[0.06]"
            : "bg-gradient-to-br from-amber-500/[0.07] via-white/[0.03] to-white/[0.02] border border-amber-500/20"
          }
          shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`}
        />
        {!isDone && (
          <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 h-12 w-24 rounded-full bg-amber-500/10 blur-2xl" />
        )}

        {/* Card header / toggle */}
        <button
          onClick={() => toggleCollapse(order.orderId)}
          className="relative w-full flex items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm border shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
              ${isDone ? "bg-white/[0.04] border-white/[0.08]" : "bg-amber-500/15 border-amber-500/25"}`}>
              {STATUS_STEPS.find((s) => s.key === order.status)?.icon ?? "📦"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">#{order.orderNumber}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border backdrop-blur-sm ${STATUS_COLOR[order.status]}`}>
                  {STATUS_LABEL[order.status]}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className="text-xs font-semibold text-amber-400 [text-shadow:0_0_12px_rgba(245,158,11,0.4)]">
              ₹{order.total.toFixed(0)}
            </span>
            {isCollapsed
              ? <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
              : <ChevronUp className="h-3.5 w-3.5 text-zinc-500" />
            }
          </div>
        </button>

        {/* Expandable tracker */}
        <div style={{
          maxHeight: isCollapsed ? "0px" : "300px",
          overflow: "hidden",
          transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}>
          <div className="relative px-4 pb-4 pt-1 border-t border-white/[0.06] space-y-1">
            {isDone ? (
              <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border
                ${order.status === "completed"
                  ? "bg-emerald-500/[0.06] border-emerald-500/15"
                  : "bg-red-500/[0.06] border-red-500/15"}`}>
                <span className="text-lg">{order.status === "completed" ? "✅" : "❌"}</span>
                <div>
                  <p className={`text-xs font-semibold ${order.status === "completed" ? "text-emerald-400" : "text-red-400"}`}>
                    {order.status === "completed" ? "Order Completed" : "Order Cancelled"}
                  </p>
                  <p className="text-[10px] text-zinc-600">
                    {order.type} · {order.placedAt} · ₹{order.total.toFixed(2)}
                  </p>
                </div>
              </div>
            ) : (
              STATUS_STEPS.map((step, i) => {
                const isDoneStep = i < stepIndex;
                const isActiveStep = i === stepIndex;
                return (
                  <div key={step.key}>
                    <div className={`flex items-center gap-3 rounded-xl px-3 py-2 border backdrop-blur-sm transition-all duration-300
                      ${isActiveStep
                        ? "bg-amber-500/10 border-amber-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                        : isDoneStep
                          ? "bg-emerald-500/[0.06] border-emerald-500/15"
                          : "border-transparent opacity-30"
                      }`}>
                      <span className="text-base leading-none">{step.icon}</span>
                      <div className="flex-1">
                        <p className={`text-xs font-semibold
                          ${isActiveStep ? "text-amber-300" : isDoneStep ? "text-emerald-400" : "text-zinc-600"}`}>
                          {step.label}
                        </p>
                        <p className="text-[10px] text-zinc-600">{step.desc}</p>
                      </div>
                      {isDoneStep && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                      {isActiveStep && <span className="animate-pulse inline-flex rounded-full h-2 w-2 bg-amber-500 shrink-0" />}
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`ml-[22px] w-px h-2.5 ${isDoneStep ? "bg-emerald-500/20" : "bg-white/[0.05]"}`} />
                    )}
                  </div>
                );
              })
            )}

            {!isDone && (
              <div className="flex justify-between text-[11px] pt-2 mt-1 border-t border-white/[0.06]">
                <span className="text-zinc-600 capitalize">{order.type} · {order.placedAt}</span>
                <span className="text-amber-400 font-semibold">₹{order.total.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ─────────────────────── Navbar ─────────────────────── */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.5)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 shadow-lg shadow-amber-900/40 group-hover:bg-amber-400 transition-all duration-200">
              <UtensilsCrossed className="h-4 w-4 text-zinc-950" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Chai<span className="text-amber-500">Dham</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
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
                {mounted && activeOrderCount > 0 && cartCount === 0 && !drawerOpen && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                  </span>
                )}
              </button>
            )}

            {/* Auth */}
            {isLoading ? (
              <div className="h-8 w-8 rounded-full bg-black animate-pulse" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 whitespace-nowrap group">
                    <Avatar className="h-8 w-8 border border-white/10 shadow-sm group-hover:border-amber-500/40 transition-all duration-200">
                      <AvatarFallback className={isAdmin ? "bg-red-500/90 text-white text-xs font-bold" : "bg-amber-500 text-zinc-950 text-xs font-bold"}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden xs:inline-block sm:inline-block max-w-[120px] truncate text-sm font-medium text-white leading-none">
                      {displayName}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" sideOffset={8}
                  className="relative w-56 rounded-2xl p-1.5 overflow-hidden bg-zinc-950 backdrop-blur-xl border border-white/[0.09] shadow-[0_4px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300">
                  <div className="relative px-3 py-2.5 mb-1">
                    {isAdmin && (
                      <span className="inline-flex items-center mb-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider bg-red-500/15 text-red-400 border border-red-500/25">
                        ADMIN
                      </span>
                    )}
                    <p className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium">Signed in as</p>
                    <p className="text-white font-semibold text-sm truncate mt-0.5">{displayEmail ?? "Unknown"}</p>
                  </div>

                  <DropdownMenuSeparator className="bg-white/10 -mx-1.5 my-1" />

                  {pathname !== "/" && (
                    <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-zinc-300 cursor-pointer outline-none transition-all duration-150 data-[highlighted]:bg-white/5 data-[highlighted]:text-white">
                      <Link href="/" className="flex items-center gap-2.5">
                        <Home className="h-4 w-4 text-amber-400 shrink-0" /><span>Home</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {pathname !== "/profile" && (
                    <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-zinc-300 cursor-pointer outline-none transition-all duration-150 data-[highlighted]:bg-white/5 data-[highlighted]:text-white">
                      <Link href="/profile" className="flex items-center gap-2.5">
                        <User className="h-4 w-4 text-amber-400 shrink-0" /><span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {pathname !== "/menu" && (
                    <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-zinc-300 cursor-pointer outline-none transition-all duration-150 data-[highlighted]:bg-white/5 data-[highlighted]:text-white">
                      <Link href="/menu" className="flex items-center gap-2.5">
                        <UtensilsCrossed className="h-4 w-4 text-amber-400 shrink-0" /><span>Menu</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isAdmin && pathname !== "/dashboard" && (
                    <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-zinc-300 cursor-pointer outline-none transition-all duration-150 data-[highlighted]:bg-white/5 data-[highlighted]:text-white">
                      <Link href="/dashboard" className="flex items-center gap-2.5">
                        <LayoutDashboard className="h-4 w-4 text-amber-400 shrink-0" /><span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-white/10 -mx-1.5 my-1" />

                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/sign-in" })}
                    className="rounded-xl px-3 py-2 cursor-pointer outline-none text-red-400 transition-all duration-150 data-[highlighted]:bg-red-500/10 data-[highlighted]:text-red-300 [&_svg]:text-red-400">
                    <LogOut className="mr-2.5 h-4 w-4 shrink-0" />Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/5">Sign in</Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium shadow-lg shadow-amber-900/30">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ─────────────────────── Backdrop ─────────────────────── */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-50 transition-all duration-300 ${drawerOpen ? "opacity-100 pointer-events-auto bg-black/60 backdrop-blur-sm" : "opacity-0 pointer-events-none"
          }`}
      />

      {/* ─────────────────────── Cart Drawer ─────────────────────── */}
      <aside className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col transition-transform duration-300 ease-in-out ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>

        {/* Glass shell */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.05] backdrop-blur-2xl border-l border-white/[0.10] shadow-[-20px_0_60px_rgba(0,0,0,0.5),inset_1px_0_0_rgba(255,255,255,0.08)] pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        {/* ── Header ── */}
        <div className="relative flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-gradient-to-r from-white/[0.06] to-transparent shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="h-4 w-4 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Your Cart</h2>
            {cartCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-zinc-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                {cartCount}
              </span>
            )}
            {activeOrderCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-[10px] font-semibold text-amber-400">
                <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                {activeOrderCount} active
              </span>
            )}
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.10] bg-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.12] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Tab switcher (only show if there are any orders) ── */}
        {placedOrders.length > 0 && (
          <div className="relative flex gap-1 mx-4 mt-3 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] shrink-0">
            <button
              onClick={() => setCartTab("live")}
              className={`flex flex-1 items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200
                ${cartTab === "live"
                  ? "bg-amber-500 text-zinc-950 shadow-[0_2px_12px_rgba(245,158,11,0.4)]"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05]"
                }`}
            >
              <Zap className="h-3 w-3" />
              Live
              {activeOrderCount > 0 && (
                <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black
                  ${cartTab === "live" ? "bg-zinc-950/30 text-zinc-950" : "bg-amber-500/20 text-amber-400"}`}>
                  {activeOrderCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setCartTab("history")}
              className={`flex flex-1 items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200
                ${cartTab === "history"
                  ? "bg-white/[0.12] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05]"
                }`}
            >
              <History className="h-3 w-3" />
              History
              {historyOrders.length > 0 && (
                <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black
                  ${cartTab === "history" ? "bg-white/20 text-white" : "bg-white/[0.08] text-zinc-500"}`}>
                  {historyOrders.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* ── Scrollable body ── */}
        <div className="relative flex-1 overflow-y-auto">

          {/* ── Live / History orders ── */}
          {placedOrders.length > 0 && (
            <div className="px-4 pt-3 space-y-2.5">

              {visibleOrders.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  {cartTab === "live" ? (
                    <>
                      <span className="text-2xl">🍵</span>
                      <p className="text-zinc-500 text-sm font-medium">No active orders</p>
                      <p className="text-zinc-700 text-xs">Place an order to track it here</p>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">📋</span>
                      <p className="text-zinc-500 text-sm font-medium">No past orders yet</p>
                    </>
                  )}
                </div>
              )}

              {visibleOrders.map((order) => (
                <OrderCard key={order.orderId} order={order} />
              ))}

              {cartTab === "live" && cartItems.length > 0 && visibleOrders.length > 0 && (
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                  <span className="text-[11px] text-zinc-600 font-medium uppercase tracking-wider">Add more</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                </div>
              )}
            </div>
          )}

          {/* ── Cart items (only on live tab or when no orders yet) ── */}
          {(cartTab === "live" || placedOrders.length === 0) && (
            <div className="px-4 py-4 space-y-3">
              {cartItems.length === 0 && placedOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 py-20 text-center">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.05] border border-white/[0.10] shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.10)]">
                    <ShoppingCart className="h-7 w-7 text-zinc-600" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Your cart is empty</p>
                    <p className="text-zinc-500 text-xs mt-1">Add items from the menu to get started</p>
                  </div>
                  <button
                    onClick={() => { router.push("/menu"); setDrawerOpen(false); }}
                    className="text-amber-400 text-sm hover:text-amber-300 underline underline-offset-2 transition-colors"
                  >
                    Browse menu →
                  </button>
                </div>
              ) : cartItems.length === 0 && placedOrders.length > 0 ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <p className="text-zinc-600 text-xs">Cart is empty</p>
                  <button
                    onClick={() => { router.push("/menu"); setDrawerOpen(false); }}
                    className="text-amber-400 text-sm hover:text-amber-300 underline underline-offset-2 transition-colors"
                  >
                    + Add more items
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item._id} className="relative rounded-2xl overflow-hidden group">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.04] backdrop-blur-sm border border-white/[0.08] group-hover:border-white/[0.14] group-hover:from-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 pointer-events-none" />
                    <div className="flex gap-3 p-3 relative">
                      <div className="h-14 w-14 flex-shrink-0 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center overflow-hidden">
                        {item.image
                          ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          : <UtensilsCrossed className="h-5 w-5 text-zinc-600" />
                        }
                      </div>
                      <div className="flex flex-1 flex-col gap-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                        <p className="text-xs font-bold text-amber-400">₹{item.price}</p>
                        <div className="flex items-center gap-2 mt-auto">
                          <button onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.06] hover:bg-white/[0.14] border border-white/[0.10] text-zinc-300 hover:text-white transition-all">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-sm font-bold text-white">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.06] hover:bg-white/[0.14] border border-white/[0.10] text-zinc-300 hover:text-white transition-all">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between flex-shrink-0">
                        <button onClick={() => removeFromCart(item._id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/[0.18] bg-red-500/[0.07] text-red-500/50 hover:text-red-400 hover:bg-red-500/[0.18] transition-all">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <p className="text-xs font-bold text-zinc-300">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="relative border-t border-white/[0.06]">
                      <button onClick={() => toggleNotes(item._id)}
                        className="flex w-full items-center justify-between px-3 py-2 text-zinc-500 hover:text-zinc-300 transition-colors">
                        <span className="flex items-center gap-1.5 text-[11px] font-medium">
                          <FileText className="h-3 w-3" />
                          {itemNotes[item._id] ? "Edit order details" : "Add order details"}
                        </span>
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${expandedNotes[item._id] ? "rotate-180" : ""}`} />
                      </button>
                      <div style={{
                        maxHeight: expandedNotes[item._id] ? "120px" : "0px",
                        opacity: expandedNotes[item._id] ? 1 : 0,
                        overflow: "hidden",
                        transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease",
                      }}>
                        <div className="px-3 pb-3 pt-0.5">
                          <textarea
                            value={itemNotes[item._id] ?? ""}
                            onChange={(e) => setNote(item._id, e.target.value)}
                            placeholder="e.g. Less sugar, extra ginger, no ice…"
                            rows={2}
                            className="w-full resize-none rounded-xl px-3 py-2 text-xs bg-white/[0.05] border border-white/[0.08] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40 transition-all"
                          />
                        </div>
                      </div>
                      {!expandedNotes[item._id] && itemNotes[item._id] && (
                        <p className="px-3 pb-2.5 text-[11px] text-zinc-500 italic truncate">"{itemNotes[item._id]}"</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── Footer (cart checkout) ── */}
        {cartItems.length > 0 && cartTab === "live" && (
          <div className="relative px-4 pt-4 pb-5 space-y-3 shrink-0">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-white/[0.03] to-transparent backdrop-blur-sm border-t border-white/[0.08] pointer-events-none" />
            <div className="relative flex items-center justify-between">
              <span className="text-sm text-zinc-400">Subtotal</span>
              <span className="text-sm font-bold text-white">₹{cartTotal.toFixed(2)}</span>
            </div>
            <p className="relative text-[11px] text-zinc-600">Taxes and delivery calculated at checkout</p>

            <div className="relative flex rounded-xl overflow-hidden border border-white/[0.10] bg-white/[0.03]">
              <button
                onClick={() => setOrderType("dine-in")}
                className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all duration-200
                  ${orderType === "dine-in" ? "bg-amber-500 text-zinc-950 shadow-[0_0_20px_rgba(245,158,11,0.3)]" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]"}`}>
                <Coffee className="h-4 w-4" /> Dine In
              </button>
              <button
                onClick={() => setOrderType("takeaway")}
                className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all duration-200
                  ${orderType === "takeaway" ? "bg-amber-500 text-zinc-950 shadow-[0_0_20px_rgba(245,158,11,0.3)]" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]"}`}>
                <Truck className="h-4 w-4" /> Takeaway
              </button>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="relative w-full py-3 rounded-xl font-bold text-sm text-zinc-950 bg-amber-500 hover:bg-amber-400 shadow-[0_4px_24px_rgba(245,158,11,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150"
            >
              {isCheckingOut
                ? "Placing order…"
                : placedOrders.length > 0
                  ? "Place Another Order"
                  : "Proceed to Checkout"
              }
            </button>
          </div>
        )}
      </aside>
    </>
  );
}