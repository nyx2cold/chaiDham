"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import {
    CheckCircle2, Clock, ChefHat, XCircle, Star,
    User, ShoppingBag, LogOut, Trophy, Flame,
} from "lucide-react";
import type React from "react";

// ── Types (unchanged) ─────────────────────────────────────────────────────────
type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";
interface OrderItem { name: string; quantity: number; price: number }
interface Order {
    _id: string; orderNumber: number; items: OrderItem[];
    total: number; status: OrderStatus; type: "dine-in" | "takeaway"; createdAt: string;
}
interface Stats {
    totalOrders: number; totalSpent: number;
    favoriteItem: string | null; browniePoints: number; memberSince?: string;
}
interface DBUser {
    userName: string; email: string; phone: string; createdAt: string; browniePoints: number;
}

// ── Constants (unchanged) ─────────────────────────────────────────────────────
const TIERS = [
    { name: "Chai Lover", min: 0, max: 200, emoji: "🍵", perks: "Welcome to ChaiDham!" },
    { name: "Chai Addict", min: 200, max: 500, emoji: "☕", perks: "Priority order processing" },
    { name: "Chai Master", min: 500, max: Infinity, emoji: "👑", perks: "Exclusive member discounts" },
];

const STATUS_STEPS = [
    { key: "pending", label: "Order Received", icon: "🧾", desc: "We got your order" },
    { key: "preparing", label: "Being Prepared", icon: "👨‍🍳", desc: "Kitchen is on it" },
    { key: "ready", label: "Ready for Pickup", icon: "✅", desc: "Come grab it!" },
];

const STATUS_META: Record<OrderStatus, { bg: string; text: string; border: string; label: string; icon: React.ReactNode }> = {
    pending: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/25", label: "Pending", icon: <Clock size={11} /> },
    preparing: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/25", label: "Preparing", icon: <ChefHat size={11} /> },
    ready: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/25", label: "Ready!", icon: <CheckCircle2 size={11} /> },
    completed: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", label: "Completed", icon: <CheckCircle2 size={11} /> },
    cancelled: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/25", label: "Cancelled", icon: <XCircle size={11} /> },
};

// ── Helpers (unchanged) ───────────────────────────────────────────────────────
function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}
function getInitials(name?: string) {
    if (!name) return "?";
    const p = name.trim().split(/\s+/);
    return p.length === 1 ? p[0].slice(0, 2).toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}
function getTier(pts: number) {
    return [...TIERS].reverse().find((t) => pts >= t.min) ?? TIERS[0];
}
function getTierProgress(pts: number) {
    const tier = getTier(pts);
    const next = TIERS.find((t) => t.min > tier.min);
    if (!next) return 100;
    return Math.min(100, Math.round(((pts - tier.min) / (next.min - tier.min)) * 100));
}

// ── Live Order Tracker (redesigned, logic unchanged) ─────────────────────────
function LiveOrderTracker({ order }: { order: Order }) {
    const stepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
    const isDone = order.status === "completed" || order.status === "cancelled";
    const s = STATUS_META[order.status];

    return (
        <div className={`relative rounded-2xl overflow-hidden border transition-all duration-300
      ${isDone
                ? "bg-white/[0.03] border-white/[0.07]"
                : "bg-gradient-to-br from-amber-500/[0.07] via-white/[0.03] to-transparent border-amber-500/20"
            }
      shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.07)]`}>

            {!isDone && (
                <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-16 rounded-full bg-amber-500/10 blur-2xl" />
            )}

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[13px] font-black text-amber-400">#{order.orderNumber}</span>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                        {s.icon}{s.label}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border
            ${order.type === "dine-in"
                            ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                            : "bg-violet-500/10 text-violet-400 border-violet-500/20"
                        }`}>
                        {order.type === "dine-in" ? "Dine In" : "Takeaway"}
                    </span>
                </div>
                <span className="text-sm font-black text-white">₹{order.total}</span>
            </div>

            {/* Items */}
            <p className="px-4 pt-2.5 text-[11px] text-zinc-500 leading-relaxed">
                {order.items.map((i) => `${i.name} ×${i.quantity}`).join(" · ")}
            </p>

            {/* Stepper */}
            {!isDone ? (
                <div className="px-4 pt-3 pb-4 space-y-0">
                    {STATUS_STEPS.map((step, i) => {
                        const isDoneStep = i < stepIndex;
                        const isActiveStep = i === stepIndex;
                        return (
                            <div key={step.key}>
                                <div className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all duration-300
                  ${isActiveStep
                                        ? "bg-amber-500/10 border-amber-500/20"
                                        : isDoneStep
                                            ? "bg-emerald-500/[0.06] border-emerald-500/15"
                                            : "border-transparent opacity-25"
                                    }`}>
                                    <span className="text-base leading-none">{step.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-[11px] font-bold
                      ${isActiveStep ? "text-amber-300" : isDoneStep ? "text-emerald-400" : "text-zinc-600"}`}>
                                            {step.label}
                                        </p>
                                        <p className="text-[10px] text-zinc-600">{step.desc}</p>
                                    </div>
                                    {isDoneStep && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                                    {isActiveStep && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />}
                                </div>
                                {i < STATUS_STEPS.length - 1 && (
                                    <div className={`ml-[22px] w-px h-2.5 ${isDoneStep ? "bg-emerald-500/20" : "bg-white/[0.05]"}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className={`mx-4 my-3 flex items-center gap-3 px-3 py-2.5 rounded-xl border
          ${order.status === "completed"
                        ? "bg-emerald-500/[0.07] border-emerald-500/15"
                        : "bg-red-500/[0.07] border-red-500/15"
                    }`}>
                    <span className="text-lg">{order.status === "completed" ? "✅" : "❌"}</span>
                    <div>
                        <p className={`text-xs font-bold ${order.status === "completed" ? "text-emerald-400" : "text-red-400"}`}>
                            {order.status === "completed" ? "Order completed" : "Order cancelled"}
                        </p>
                        <p className="text-[10px] text-zinc-600">{order.type} · {formatTime(order.createdAt)}</p>
                    </div>
                </div>
            )}

            <p className="px-4 pb-3 text-[10px] text-zinc-600">
                {formatDate(order.createdAt)} · {formatTime(order.createdAt)}
            </p>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
    const { data: session } = useSession();
    const sessionUser = session?.user as any;

    const [activeTab, setActiveTab] = useState<"orders" | "account">("orders");
    const [ordersTab, setOrdersTab] = useState<"live" | "history">("live");
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalSpent: 0, favoriteItem: null, browniePoints: 0 });
    const [dbUser, setDbUser] = useState<DBUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Form state (unchanged)
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // ── Initial load (unchanged) ──────────────────────────────────────────────
    useEffect(() => {
        async function load() {
            try {
                const [profileRes, ordersRes] = await Promise.all([
                    fetch("/api/user/profile"),
                    fetch("/api/orders/my"),
                ]);
                const profileData = await profileRes.json();
                const ordersData = await ordersRes.json();
                if (profileData.success) {
                    setDbUser(profileData.user);
                    setUserName(profileData.user.userName ?? "");
                    setEmail(profileData.user.email ?? "");
                    setPhone(profileData.user.phone ?? "");
                }
                if (ordersData.success) {
                    setOrders(ordersData.orders);
                    setStats(ordersData.stats);
                }
            } catch { } finally { setLoading(false); }
        }
        if (session) load();
    }, [session]);

    // ── Poll every 5s (unchanged) ─────────────────────────────────────────────
    useEffect(() => {
        const id = setInterval(async () => {
            try {
                const res = await fetch("/api/orders/my");
                const data = await res.json();
                if (data.success) { setOrders(data.orders); setStats(data.stats); }
            } catch { }
        }, 5000);
        return () => clearInterval(id);
    }, []);

    // ── Save profile (unchanged) ──────────────────────────────────────────────
    async function handleSave() {
        setSaving(true); setSaveMsg(null);
        try {
            const body: any = { userName, email, phone };
            if (showPass && newPassword) { body.currentPassword = currentPassword; body.newPassword = newPassword; }
            const res = await fetch("/api/user/profile", {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSaveMsg({ type: "success", text: "Profile updated successfully!" });
            setCurrentPassword(""); setNewPassword(""); setShowPass(false);
        } catch (err: any) {
            setSaveMsg({ type: "error", text: err.message ?? "Failed to update" });
        } finally { setSaving(false); }
    }

    // ── Derived (unchanged) ───────────────────────────────────────────────────
    const tier = getTier(stats.browniePoints);
    const progress = getTierProgress(stats.browniePoints);
    const nextTier = TIERS.find((t) => t.min > tier.min);
    const displayName = dbUser?.userName ?? sessionUser?.username ?? sessionUser?.name ?? "…";
    const memberSince = dbUser?.createdAt
        ? new Date(dbUser.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
        : "—";

    const liveOrders = orders.filter((o) => o.status !== "completed" && o.status !== "cancelled");
    const historyOrders = orders.filter((o) => o.status === "completed" || o.status === "cancelled");

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-zinc-950 text-white">

            {/* Ambient background glows */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-amber-500/[0.04] blur-[100px]" />
                <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-amber-600/[0.03] blur-[80px]" />
            </div>

            <div className="relative mx-auto max-w-3xl px-4 py-8 pb-16">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
                    <span className="text-[11px] text-zinc-600 uppercase tracking-[0.18em] font-semibold">
                        ChaiDham / Profile
                    </span>
                </div>

                {/* ── Hero card ── */}
                <div className="relative rounded-2xl overflow-hidden mb-3
          bg-white/[0.04] backdrop-blur-xl
          border border-white/[0.08]
          shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]">

                    {/* Top sheen */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                    <div className="pointer-events-none absolute -top-10 left-10 w-48 h-24 bg-amber-500/[0.06] blur-3xl rounded-full" />

                    <div className="relative flex items-center gap-5 p-5 flex-wrap">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600
                flex items-center justify-center text-2xl font-black text-zinc-950
                shadow-[0_0_0_3px_rgba(245,158,11,0.2),0_0_24px_rgba(245,158,11,0.2)]">
                                {getInitials(displayName)}
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h1 className="text-xl font-black text-white truncate">{displayName}</h1>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold
                  bg-amber-500/12 text-amber-400 border border-amber-500/25">
                                    {tier.emoji} {tier.name}
                                </span>
                                {liveOrders.length > 0 && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold
                    bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        {liveOrders.length} active
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-zinc-400 truncate">{dbUser?.email ?? sessionUser?.email ?? "—"}</p>
                            <p className="text-[11px] text-zinc-600 mt-0.5">Member since {memberSince}</p>
                        </div>

                        {/* Sign out */}
                        <button
                            onClick={() => signOut({ callbackUrl: "/sign-in" })}
                            className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold
                bg-red-500/[0.07] text-red-400 border border-red-500/15
                hover:bg-red-500/15 hover:border-red-500/25
                active:scale-95 transition-all duration-150">
                            <LogOut className="h-3.5 w-3.5" /> Sign out
                        </button>
                    </div>
                </div>

                {/* ── Stats row ── */}
                <div className="grid grid-cols-3 gap-2.5 mb-3">
                    {[
                        { label: "Orders", value: loading ? "…" : String(stats.totalOrders), icon: <ShoppingBag className="h-4 w-4" /> },
                        { label: "Spent", value: loading ? "…" : `₹${stats.totalSpent.toLocaleString("en-IN")}`, icon: <Trophy className="h-4 w-4" /> },
                        { label: "Favourite", value: loading ? "…" : (stats.favoriteItem ?? "—"), icon: <Flame className="h-4 w-4" /> },
                    ].map((s) => (
                        <div key={s.label}
                            className="group relative rounded-2xl px-4 py-3.5 overflow-hidden
                bg-white/[0.04] backdrop-blur-xl
                border border-white/[0.07]
                hover:border-amber-500/20 hover:bg-white/[0.06]
                shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
                transition-all duration-200">
                            <div className="pointer-events-none absolute -top-4 -right-4 w-16 h-16 rounded-full bg-amber-500/[0.05] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="flex items-center gap-2 mb-2 text-zinc-600 group-hover:text-amber-500/60 transition-colors duration-200">
                                {s.icon}
                            </div>
                            <p className="text-lg font-black text-amber-400 truncate leading-none mb-1">{s.value}</p>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* ── Brownie Points card ── */}
                <div className="relative rounded-2xl overflow-hidden mb-3
          bg-white/[0.04] backdrop-blur-xl
          border border-amber-500/[0.12]
          shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.07)]">

                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent pointer-events-none" />
                    <div className="pointer-events-none absolute -top-8 right-10 w-40 h-20 bg-amber-500/[0.07] blur-3xl rounded-full" />

                    <div className="relative p-5">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.15em] mb-2">
                                    🍪 Brownie Points
                                </p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-5xl font-black text-amber-400 leading-none
                    [text-shadow:0_0_30px_rgba(245,158,11,0.35)]">
                                        {loading ? "…" : stats.browniePoints}
                                    </span>
                                    <span className="text-sm font-semibold text-zinc-500">pts</span>
                                </div>
                                <p className="text-[11px] text-zinc-600 mt-1.5">
                                    Earn 13 pts per ₹200 · 1 pt = ₹1 discount
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                <span className="text-3xl">{tier.emoji}</span>
                                <p className="text-sm font-bold text-amber-400 mt-1">{tier.name}</p>
                                <p className="text-[11px] text-zinc-600">{tier.perks}</p>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-4">
                            <div className="flex justify-between text-[11px] mb-1.5">
                                <span className="text-zinc-600">
                                    {nextTier
                                        ? `${stats.browniePoints} / ${nextTier.min} pts → ${nextTier.emoji} ${nextTier.name}`
                                        : "Maximum tier reached 👑"
                                    }
                                </span>
                                <span className="text-amber-400 font-bold">{progress}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400
                    shadow-[0_0_10px_rgba(245,158,11,0.4)] transition-all duration-700 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Tier cards */}
                        <div className="grid grid-cols-3 gap-2">
                            {TIERS.map((t) => {
                                const unlocked = stats.browniePoints >= t.min;
                                return (
                                    <div key={t.name}
                                        className={`rounded-xl px-3 py-2.5 border transition-all duration-200
                      ${unlocked
                                                ? "bg-amber-500/[0.07] border-amber-500/20"
                                                : "bg-white/[0.02] border-white/[0.05] opacity-40"
                                            }`}>
                                        <p className="text-xl mb-1">{t.emoji}</p>
                                        <p className={`text-[11px] font-bold ${unlocked ? "text-amber-400" : "text-zinc-600"}`}>{t.name}</p>
                                        <p className="text-[10px] text-zinc-700 mt-0.5">{t.min}+ pts</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Main tabs ── */}
                <div className="flex gap-1 p-1 rounded-xl mb-3
          bg-white/[0.03] border border-white/[0.07]">
                    {(["orders", "account"] as const).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider
                transition-all duration-200 active:scale-[0.98]
                ${activeTab === tab
                                    ? "bg-amber-500 text-zinc-950 shadow-[0_2px_12px_rgba(245,158,11,0.35)]"
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05]"
                                }`}>
                            {tab === "orders" ? <ShoppingBag className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                            {tab}
                        </button>
                    ))}
                </div>

                {/* ══ Orders tab ══ */}
                {activeTab === "orders" && (
                    <div>
                        {/* Sub-tabs */}
                        <div className="flex gap-1 p-1 rounded-xl mb-3
              bg-white/[0.02] border border-white/[0.06]">
                            {(["live", "history"] as const).map((t) => {
                                const count = t === "live" ? liveOrders.length : historyOrders.length;
                                const isActive = ordersTab === t;
                                return (
                                    <button key={t} onClick={() => setOrdersTab(t)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider
                      transition-all duration-200 active:scale-[0.98]
                      ${isActive
                                                ? t === "live" && liveOrders.length > 0
                                                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                                                    : "bg-white/[0.07] text-white border border-white/[0.10]"
                                                : "text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.03]"
                                            }`}>
                                        {t === "live" && liveOrders.length > 0 && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                        )}
                                        {t}
                                        {count > 0 && (
                                            <span className={`flex items-center justify-center h-4 w-4 rounded-full text-[9px] font-black
                        ${isActive
                                                    ? t === "live" && liveOrders.length > 0 ? "bg-amber-500/20 text-amber-400" : "bg-white/15 text-white"
                                                    : "bg-white/[0.06] text-zinc-500"
                                                }`}>
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Live orders */}
                        {ordersTab === "live" && (
                            loading ? (
                                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-10 text-center text-sm text-zinc-600">
                                    Loading orders…
                                </div>
                            ) : liveOrders.length === 0 ? (
                                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-12 text-center">
                                    <p className="text-3xl mb-2">🍵</p>
                                    <p className="text-sm font-medium text-zinc-500">No active orders</p>
                                    <p className="text-xs text-zinc-700 mt-1">Place an order from the menu to track it here</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {liveOrders.map((o) => <LiveOrderTracker key={o._id} order={o} />)}
                                </div>
                            )
                        )}

                        {/* History */}
                        {ordersTab === "history" && (
                            <div className="rounded-2xl overflow-hidden
                bg-white/[0.03] backdrop-blur-xl
                border border-white/[0.07]
                shadow-[0_4px_24px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.05)]">

                                <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.06]">
                                    <p className="text-sm font-bold text-white">Order History</p>
                                    {historyOrders.length > 0 && (
                                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/12 text-amber-400 border border-amber-400/20">
                                            {historyOrders.length}
                                        </span>
                                    )}
                                </div>

                                {loading ? (
                                    <div className="p-10 text-center text-sm text-zinc-600">Loading…</div>
                                ) : historyOrders.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <p className="text-3xl mb-2">📋</p>
                                        <p className="text-sm text-zinc-500">No completed orders yet</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs" style={{ minWidth: 520 }}>
                                            <thead>
                                                <tr className="border-b border-white/[0.05]">
                                                    {["Order", "Items", "Type", "Status", "Date", "Total"].map((h) => (
                                                        <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest whitespace-nowrap">
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {historyOrders.map((order, i) => {
                                                    const s = STATUS_META[order.status];
                                                    return (
                                                        <tr key={order._id}
                                                            className={`border-b border-white/[0.03] transition-colors hover:bg-white/[0.025]
                                ${i % 2 !== 0 ? "bg-white/[0.015]" : ""}`}>
                                                            <td className="px-4 py-3 font-mono font-black text-amber-400 whitespace-nowrap">
                                                                #{order.orderNumber}
                                                            </td>
                                                            <td className="px-4 py-3 text-zinc-400 max-w-[160px]">
                                                                <span className="block truncate">
                                                                    {order.items.map((it) => `${it.name} ×${it.quantity}`).join(", ")}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border
                                  ${order.type === "dine-in"
                                                                        ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                                                                        : "bg-violet-500/10 text-violet-400 border-violet-500/20"
                                                                    }`}>
                                                                    {order.type === "dine-in" ? "Dine In" : "Takeaway"}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                                                                    {s.icon}{s.label}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                                                                {formatDate(order.createdAt)}
                                                            </td>
                                                            <td className="px-4 py-3 font-black text-white whitespace-nowrap">
                                                                ₹{order.total}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ══ Account tab ══ */}
                {activeTab === "account" && (
                    <div className="rounded-2xl overflow-hidden
            bg-white/[0.04] backdrop-blur-xl
            border border-white/[0.08]
            shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.07)]">

                        <div className="px-5 py-4 border-b border-white/[0.06]">
                            <p className="text-sm font-bold text-white">Edit Profile</p>
                            <p className="text-[11px] text-zinc-600 mt-0.5">Update your account details</p>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Username */}
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-[0.12em]">
                                        Username
                                    </label>
                                    <input
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        placeholder="Your username"
                                        className="w-full h-10 px-3.5 rounded-xl text-sm text-white placeholder:text-zinc-600
                      bg-white/[0.05] border border-white/[0.09]
                      focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08]
                      transition-all duration-200"
                                    />
                                </div>

                                {/* Phone */}
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-[0.12em]">
                                        Phone
                                    </label>
                                    <input
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="10-digit mobile"
                                        className="w-full h-10 px-3.5 rounded-xl text-sm text-white placeholder:text-zinc-600
                      bg-white/[0.05] border border-white/[0.09]
                      focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08]
                      transition-all duration-200"
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-[0.12em]">
                                        Email
                                    </label>
                                    <input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        type="email"
                                        className="w-full h-10 px-3.5 rounded-xl text-sm text-white placeholder:text-zinc-600
                      bg-white/[0.05] border border-white/[0.09]
                      focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08]
                      transition-all duration-200"
                                    />
                                </div>

                                {/* Member since (read-only) */}
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-[0.12em]">
                                        Member Since
                                    </label>
                                    <div className="h-10 px-3.5 rounded-xl text-sm text-zinc-500 flex items-center
                    bg-white/[0.02] border border-white/[0.05] cursor-not-allowed select-none">
                                        {memberSince}
                                    </div>
                                </div>
                            </div>

                            {/* Password section */}
                            <div className="pt-1 border-t border-white/[0.06]">
                                <button
                                    onClick={() => { setShowPass(!showPass); setCurrentPassword(""); setNewPassword(""); }}
                                    className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors duration-150 active:scale-[0.98]">
                                    {showPass ? "✕ Cancel password change" : "🔒 Change password"}
                                </button>

                                {showPass && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-[0.12em]">
                                                Current Password
                                            </label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full h-10 px-3.5 rounded-xl text-sm text-white placeholder:text-zinc-600
                          bg-white/[0.05] border border-white/[0.09]
                          focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08]
                          transition-all duration-200"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-[0.12em]">
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Min 6 characters"
                                                className="w-full h-10 px-3.5 rounded-xl text-sm text-white placeholder:text-zinc-600
                          bg-white/[0.05] border border-white/[0.09]
                          focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08]
                          transition-all duration-200"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Save message */}
                            {saveMsg && (
                                <div className={`px-4 py-3 rounded-xl text-xs font-semibold border
                  ${saveMsg.type === "success"
                                        ? "bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-400"
                                        : "bg-red-500/[0.08] border-red-500/20 text-red-400"
                                    }`}>
                                    {saveMsg.text}
                                </div>
                            )}

                            {/* Save button */}
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full py-3 rounded-xl text-sm font-black text-zinc-950
                  bg-amber-500 hover:bg-amber-400
                  shadow-[0_4px_20px_rgba(245,158,11,0.25)]
                  hover:shadow-[0_4px_28px_rgba(245,158,11,0.4)]
                  active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed
                  transition-all duration-150">
                                {saving ? "Saving…" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}