"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import type React from "react";

type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";

interface OrderItem { name: string; quantity: number; price: number; }
interface Order {
    _id: string; orderNumber: number; items: OrderItem[];
    total: number; status: OrderStatus; type: "dine-in" | "takeaway"; createdAt: string;
}
interface Stats {
    totalOrders: number; totalSpent: number;
    favoriteItem: string; browniePoints: number; memberSince?: string;
}
interface DBUser {
    userName: string; email: string; phone: string; createdAt: string; browniePoints: number;
}

const TIERS = [
    { name: "Chai Lover", min: 0, max: 200, emoji: "🍵", perks: "Welcome to ChaiDham!" },
    { name: "Chai Addict", min: 200, max: 500, emoji: "☕", perks: "Priority order processing" },
    { name: "Chai Master", min: 500, max: Infinity, emoji: "👑", perks: "Exclusive member discounts" },
];

const TIER_COLOR = "#f59e0b"; // single amber color for everything

const STATUS_STYLE: Record<OrderStatus, { bg: string; text: string; border: string; label: string }> = {
    pending: { bg: "rgba(245,158,11,0.12)", text: "#fbbf24", border: "rgba(245,158,11,0.3)", label: "Pending" },
    preparing: { bg: "rgba(59,130,246,0.12)", text: "#60a5fa", border: "rgba(59,130,246,0.3)", label: "Preparing" },
    ready: { bg: "rgba(16,185,129,0.12)", text: "#34d399", border: "rgba(16,185,129,0.3)", label: "Ready!" },
    completed: { bg: "rgba(16,185,129,0.12)", text: "#34d399", border: "rgba(16,185,129,0.3)", label: "Completed" },
    cancelled: { bg: "rgba(239,68,68,0.12)", text: "#f87171", border: "rgba(239,68,68,0.3)", label: "Cancelled" },
};

const glassCard: React.CSSProperties = {
    position: "relative",
    background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
    backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.10)",
    borderRadius: 20,
};

const BASE_FONT = "var(--font-sans), 'Figtree', 'DM Sans', 'Segoe UI', sans-serif";

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function getInitials(name?: string) {
    if (!name) return "?";
    const p = name.trim().split(/\s+/);
    return p.length === 1 ? p[0].slice(0, 2).toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}
function getTier(points: number) {
    return [...TIERS].reverse().find((t) => points >= t.min) ?? TIERS[0];
}
function getNextTier(points: number) {
    return TIERS.find((t) => points < t.max && t.max !== Infinity ? points < t.max : false)
        ?? TIERS.find((t) => points < t.max);
}
function getTierProgress(points: number) {
    const tier = getTier(points);
    const next = TIERS.find((t) => t.min > tier.min);
    if (!next) return 100;
    const range = next.min - tier.min;
    const earned = points - tier.min;
    return Math.min(100, Math.max(0, Math.round((earned / range) * 100)));
}

export default function ProfilePage() {
    const { data: session } = useSession();
    const sessionUser = session?.user as any;

    const [activeTab, setActiveTab] = useState<"orders" | "account">("orders");
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalSpent: 0, favoriteItem: "—", browniePoints: 0 });
    const [dbUser, setDbUser] = useState<DBUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Form state
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

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
            } catch { } finally {
                setLoading(false);
            }
        }
        if (session) load();
    }, [session]);

    async function handleSave() {
        setSaving(true);
        setSaveMsg(null);
        try {
            const body: any = { userName, email, phone };
            if (showPass && newPassword) {
                body.currentPassword = currentPassword;
                body.newPassword = newPassword;
            }
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSaveMsg({ type: "success", text: "Profile updated successfully!" });
            setCurrentPassword(""); setNewPassword(""); setShowPass(false);
        } catch (err: any) {
            setSaveMsg({ type: "error", text: err.message ?? "Failed to update" });
        } finally {
            setSaving(false);
        }
    }

    const tier = getTier(stats.browniePoints);
    const progress = getTierProgress(stats.browniePoints);
    const nextTier = TIERS.find((t) => t.min > tier.min);

    // Show session name immediately while db loads
    const displayName = dbUser?.userName ?? sessionUser?.username ?? sessionUser?.name ?? "…";
    const memberSince = dbUser?.createdAt
        ? new Date(dbUser.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
        : "—";

    const inputStyle: React.CSSProperties = {
        width: "100%", background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10,
        padding: "0.6rem 0.9rem", color: "#fff", fontSize: 14,
        fontFamily: BASE_FONT, outline: "none", boxSizing: "border-box",
        transition: "border 0.2s",
    };
    const labelStyle: React.CSSProperties = {
        fontSize: 10, fontWeight: 700, color: "#6b5e3e",
        textTransform: "uppercase", letterSpacing: "0.12em",
        display: "block", marginBottom: 6, fontFamily: BASE_FONT,
    };

    return (
        <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: BASE_FONT, color: "#f5f0e8", padding: "2rem 1rem 4rem", overflowX: "hidden" }}>

            {/* Ambient glows */}
            <div style={{ position: "fixed", top: "-15%", left: "-10%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
            <div style={{ position: "fixed", bottom: "-10%", right: "-8%", width: "35vw", height: "35vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

            <div style={{ maxWidth: 820, margin: "0 auto", position: "relative", zIndex: 1 }}>

                {/* Breadcrumb */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.75rem" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 8px rgba(245,158,11,0.6)" }} />
                    <span style={{ fontSize: 11, color: "#6b5e3e", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, fontFamily: BASE_FONT }}>ChaiDham / Profile</span>
                </div>

                {/* ── Hero ── */}
                <div style={{ ...glassCard, padding: "1.75rem 2rem", marginBottom: "1.1rem", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(245,158,11,0.07)", filter: "blur(40px)", pointerEvents: "none" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", position: "relative" }}>
                        {/* Avatar */}
                        <div style={{ position: "relative", flexShrink: 0 }}>
                            <div style={{
                                width: 72, height: 72, borderRadius: "50%",
                                background: "linear-gradient(135deg,#eab308,#f59e0b)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 24, fontWeight: 800, color: "#0a0a0a",
                                boxShadow: "0 0 0 3px rgba(245,158,11,0.2), 0 0 20px rgba(245,158,11,0.25)",
                                fontFamily: BASE_FONT,
                            }}>{getInitials(displayName)}</div>
                            <div style={{ position: "absolute", bottom: 3, right: 3, width: 13, height: 13, borderRadius: "50%", background: "#22c55e", border: "2px solid #0a0a0a" }} />
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 140 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#fff", fontFamily: BASE_FONT }}>
                                    {displayName}
                                </h1>
                                <span style={{
                                    fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                                    background: "rgba(245,158,11,0.12)", color: TIER_COLOR,
                                    border: "1px solid rgba(245,158,11,0.25)",
                                    fontFamily: BASE_FONT,
                                }}>
                                    {tier.emoji} {tier.name}
                                </span>
                            </div>
                            <p style={{ fontSize: 13, color: "#a89060", margin: "4px 0 0", fontFamily: BASE_FONT }}>{dbUser?.email ?? sessionUser?.email ?? "—"}</p>
                            <p style={{ fontSize: 11, color: "#4a3f28", margin: "3px 0 0", fontFamily: BASE_FONT }}>Member since {memberSince}</p>
                        </div>

                        {/* Sign out */}
                        <button onClick={() => signOut({ callbackUrl: "/sign-in" })} style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "0.5rem 1.1rem",
                            background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)",
                            borderRadius: 10, color: "#f87171", fontSize: 12, fontWeight: 700,
                            cursor: "pointer", fontFamily: BASE_FONT,
                        }}>
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* ── Stats ── */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.875rem", marginBottom: "1.1rem" }}>
                    {[
                        { label: "Total Orders", value: loading ? "…" : stats.totalOrders },
                        { label: "Total Spent", value: loading ? "…" : `₹${stats.totalSpent}` },
                        { label: "Favourite", value: loading ? "…" : (stats.favoriteItem || "—") },
                    ].map((s) => (
                        <div key={s.label} style={{ ...glassCard, padding: "1rem", textAlign: "center", borderRadius: 16 }}>
                            <p style={{ fontSize: 20, fontWeight: 800, margin: 0, color: TIER_COLOR, textShadow: "0 0 16px rgba(245,158,11,0.35)", fontFamily: BASE_FONT }}>{s.value}</p>
                            <p style={{ fontSize: 10, color: "#6b5e3e", margin: "5px 0 0", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, fontFamily: BASE_FONT }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* ── Brownie Points ── */}
                <div style={{ ...glassCard, padding: "1.5rem 1.75rem", marginBottom: "1.1rem", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(245,158,11,0.06)", filter: "blur(30px)", pointerEvents: "none" }} />
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", position: "relative" }}>
                        <div>
                            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#6b5e3e", textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: BASE_FONT }}>
                                🍪 Brownie Points
                            </p>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
                                <span style={{ fontSize: 44, fontWeight: 900, color: TIER_COLOR, textShadow: "0 0 20px rgba(245,158,11,0.4)", lineHeight: 1, fontFamily: BASE_FONT }}>
                                    {loading ? "…" : stats.browniePoints}
                                </span>
                                <span style={{ fontSize: 13, color: "#6b5e3e", fontWeight: 600, fontFamily: BASE_FONT }}>pts</span>
                            </div>
                            <p style={{ margin: "6px 0 0", fontSize: 12, color: "#4a3f28", fontFamily: BASE_FONT }}>
                                Earn 13 pts per ₹200 spent · 1 pt = ₹1 discount
                            </p>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <span style={{ fontSize: 28 }}>{tier.emoji}</span>
                            <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 700, color: TIER_COLOR, fontFamily: BASE_FONT }}>{tier.name}</p>
                            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6b5e3e", fontFamily: BASE_FONT }}>{tier.perks}</p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginTop: "1.25rem", position: "relative" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: 11, color: "#6b5e3e", fontFamily: BASE_FONT }}>
                                {nextTier
                                    ? `${stats.browniePoints} / ${nextTier.min} pts to ${nextTier.emoji} ${nextTier.name}`
                                    : "Maximum tier reached 👑"}
                            </span>
                            <span style={{ fontSize: 11, color: TIER_COLOR, fontWeight: 700, fontFamily: BASE_FONT }}>{progress}%</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                            <div style={{
                                height: "100%", borderRadius: 99,
                                width: `${progress}%`,
                                background: "linear-gradient(90deg, #eab308, #f59e0b)",
                                boxShadow: "0 0 10px rgba(245,158,11,0.4)",
                                transition: "width 0.8s ease",
                            }} />
                        </div>
                    </div>

                    {/* Tier cards */}
                    <div style={{ display: "flex", gap: 8, marginTop: "1.1rem", flexWrap: "wrap" }}>
                        {TIERS.map((t) => {
                            const unlocked = stats.browniePoints >= t.min;
                            return (
                                <div key={t.name} style={{
                                    flex: 1, minWidth: 90, padding: "0.6rem 0.75rem", borderRadius: 10,
                                    background: unlocked ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.02)",
                                    border: unlocked ? "1px solid rgba(245,158,11,0.2)" : "1px solid rgba(255,255,255,0.05)",
                                    opacity: unlocked ? 1 : 0.4, transition: "all 0.2s",
                                }}>
                                    <p style={{ margin: 0, fontSize: 18 }}>{t.emoji}</p>
                                    <p style={{ margin: "4px 0 0", fontSize: 11, fontWeight: 700, color: unlocked ? TIER_COLOR : "#6b5e3e", fontFamily: BASE_FONT }}>{t.name}</p>
                                    <p style={{ margin: "2px 0 0", fontSize: 10, color: "#4a3f28", fontFamily: BASE_FONT }}>{t.min}+ pts</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div style={{ display: "flex", gap: 4, marginBottom: "1.1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 13, padding: 4 }}>
                    {(["orders", "account"] as const).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{
                            flex: 1, padding: "0.55rem 0", border: "none", cursor: "pointer",
                            fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                            borderRadius: 10, transition: "all 0.2s ease", fontFamily: BASE_FONT,
                            background: activeTab === tab ? "linear-gradient(135deg,#eab308,#f59e0b)" : "transparent",
                            color: activeTab === tab ? "#0a0a0a" : "#5a4e35",
                            boxShadow: activeTab === tab ? "0 2px 12px rgba(245,158,11,0.35)" : "none",
                        }}>{tab}</button>
                    ))}
                </div>

                {/* ── Orders Tab ── */}
                {activeTab === "orders" && (
                    <div style={{ ...glassCard, overflow: "hidden" }}>
                        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: BASE_FONT }}>Order History</p>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "rgba(245,158,11,0.12)", color: TIER_COLOR, border: "1px solid rgba(245,158,11,0.2)", fontFamily: BASE_FONT }}>{orders.length}</span>
                        </div>
                        {loading ? (
                            <div style={{ padding: "3rem", textAlign: "center", color: "#4a3f28", fontFamily: BASE_FONT }}>Loading orders…</div>
                        ) : orders.length === 0 ? (
                            <div style={{ padding: "3rem", textAlign: "center" }}>
                                <p style={{ color: "#4a3f28", margin: 0, fontFamily: BASE_FONT }}>No orders yet — place your first order!</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: BASE_FONT }}>
                                    <thead>
                                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                            {["Order", "Items", "Type", "Status", "Date", "Total"].map((h) => (
                                                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#4a3f28", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: BASE_FONT }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order, i) => {
                                            const s = STATUS_STYLE[order.status];
                                            return (
                                                <tr key={order._id} style={{ borderBottom: i < orders.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none", background: i % 2 !== 0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                                                    <td style={{ padding: "12px 16px" }}>
                                                        <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 800, color: TIER_COLOR }}>#{order.orderNumber}</span>
                                                    </td>
                                                    <td style={{ padding: "12px 16px", color: "#a89060", maxWidth: 180 }}>
                                                        <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                            {order.items.map((it) => `${it.name} ×${it.quantity}`).join(", ")}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "12px 16px" }}>
                                                        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 6, background: order.type === "dine-in" ? "rgba(14,165,233,0.12)" : "rgba(139,92,246,0.12)", color: order.type === "dine-in" ? "#38bdf8" : "#a78bfa", border: order.type === "dine-in" ? "1px solid rgba(14,165,233,0.25)" : "1px solid rgba(139,92,246,0.25)" }}>
                                                            {order.type === "dine-in" ? "Dine In" : "Takeaway"}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "12px 16px" }}>
                                                        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 6, background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>{s.label}</span>
                                                    </td>
                                                    <td style={{ padding: "12px 16px", color: "#6b5e3e", fontSize: 11 }}>{formatDate(order.createdAt)}</td>
                                                    <td style={{ padding: "12px 16px" }}>
                                                        <span style={{ fontWeight: 800, color: "#fff", fontSize: 13 }}>₹{order.total}</span>
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

                {/* ── Account Tab ── */}
                {activeTab === "account" && (
                    <div style={{ ...glassCard, padding: "1.5rem" }}>
                        <p style={{ margin: "0 0 1.25rem", fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: BASE_FONT }}>Edit Profile</p>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div>
                                <label style={labelStyle}>Username</label>
                                <input
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    style={inputStyle}
                                    placeholder="Your username"
                                    onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
                                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.10)")}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Phone</label>
                                <input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    style={inputStyle}
                                    placeholder="10-digit mobile"
                                    onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
                                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.10)")}
                                />
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={labelStyle}>Email</label>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={inputStyle}
                                    placeholder="your@email.com"
                                    type="email"
                                    onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
                                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.10)")}
                                />
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={labelStyle}>Member Since</label>
                                <div style={{ ...inputStyle, color: "#4a3f28", cursor: "default", display: "flex", alignItems: "center" }}>{memberSince}</div>
                            </div>
                        </div>

                        {/* Password toggle */}
                        <div style={{ marginTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.25rem" }}>
                            <button
                                onClick={() => { setShowPass(!showPass); setCurrentPassword(""); setNewPassword(""); }}
                                style={{ background: "none", border: "none", color: TIER_COLOR, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0, fontFamily: BASE_FONT, letterSpacing: "0.03em" }}
                            >
                                {showPass ? "✕ Cancel password change" : "🔒 Change password"}
                            </button>

                            {showPass && (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                                    <div>
                                        <label style={labelStyle}>Current Password</label>
                                        <input
                                            type="password" value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            style={inputStyle} placeholder="••••••••"
                                            onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
                                            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.10)")}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>New Password</label>
                                        <input
                                            type="password" value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            style={inputStyle} placeholder="Min 6 characters"
                                            onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
                                            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.10)")}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Save feedback */}
                        {saveMsg && (
                            <div style={{ marginTop: "1rem", padding: "0.65rem 1rem", borderRadius: 10, background: saveMsg.type === "success" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${saveMsg.type === "success" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, color: saveMsg.type === "success" ? "#34d399" : "#f87171", fontSize: 13, fontWeight: 600, fontFamily: BASE_FONT }}>
                                {saveMsg.text}
                            </div>
                        )}

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                marginTop: "1.25rem", width: "100%", padding: "0.875rem",
                                borderRadius: 12, border: "none",
                                cursor: saving ? "not-allowed" : "pointer",
                                background: "linear-gradient(135deg,#eab308,#f59e0b)",
                                color: "#0a0a0a", fontSize: 14, fontWeight: 800,
                                opacity: saving ? 0.7 : 1,
                                boxShadow: "0 4px 20px rgba(245,158,11,0.25)",
                                transition: "all 0.15s", fontFamily: BASE_FONT,
                            }}
                        >
                            {saving ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}