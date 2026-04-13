"use client";

import { useEffect, useState } from "react";
import {
    Trophy, Star, Users, IndianRupee, ShoppingBag,
    Loader2, Plus, Minus, Crown, Search, Ban, CheckCircle,
    ChevronLeft, ChevronRight, X, Calendar, Clock, ShieldCheck, ShieldBan, Info,
} from "lucide-react";
import { toast } from "sonner";

interface Customer {
    rank: number;
    email: string;
    name: string;
    totalSpent: number;
    orderCount: number;
    lastOrderAt: string;
    browniePoints: number;
    memberSince: string | null;
    isBanned: boolean;
}

const TIER_CONFIG = [
    { name: "Chai Lover", min: 0, emoji: "🍵", color: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/20" },
    { name: "Chai Addict", min: 100, emoji: "☕", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { name: "Chai Master", min: 500, emoji: "👑", color: "text-yellow-300", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
];

function getTier(pts: number) {
    return [...TIER_CONFIG].reverse().find((t) => pts >= t.min) ?? TIER_CONFIG[0];
}

const PODIUM_CONFIG = [
    { rank: 1, label: "Gold", crownColor: "text-amber-300", ringColor: "ring-amber-400/40", badgeBg: "bg-amber-500/15", badgeBorder: "border-amber-400/30", badgeText: "text-amber-300", glowColor: "rgba(245,158,11,0.15)", bonus: 50, avatarFrom: "#92400e", avatarTo: "#78350f", pillBg: "#b45309", pillText: "#fef3c7", pillBorder: "#f59e0b" },
    { rank: 2, label: "Silver", crownColor: "text-zinc-200", ringColor: "ring-zinc-400/30", badgeBg: "bg-zinc-400/10", badgeBorder: "border-zinc-400/25", badgeText: "text-zinc-300", glowColor: "rgba(161,161,170,0.10)", bonus: 30, avatarFrom: "#52525b", avatarTo: "#3f3f46", pillBg: "#52525b", pillText: "#e4e4e7", pillBorder: "#a1a1aa" },
    { rank: 3, label: "Bronze", crownColor: "text-orange-300", ringColor: "ring-orange-400/25", badgeBg: "bg-orange-500/10", badgeBorder: "border-orange-400/25", badgeText: "text-orange-300", glowColor: "rgba(249,115,22,0.10)", bonus: 20, avatarFrom: "#9a3412", avatarTo: "#7c2d12", pillBg: "#9a3412", pillText: "#ffedd5", pillBorder: "#fb923c" },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function initials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function formatDate(iso: string | null) {
    if (!iso) return "N/A";
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const glass: React.CSSProperties = {
    background: "linear-gradient(135deg,rgba(255,255,255,0.06) 0%,rgba(255,255,255,0.02) 100%)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.06)",
};

/* ───────────────────────── Details Modal ───────────────────────── */
function CustomerDetailsModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {
    const tier = getTier(customer.browniePoints);
    const podium = PODIUM_CONFIG.find((p) => p.rank === customer.rank);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
            onClick={onClose}>
            <div className="relative w-full max-w-md rounded-2xl overflow-hidden"
                style={{ ...glass, boxShadow: "0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.09)" }}
                onClick={(e) => e.stopPropagation()}>

                {/* Glow */}
                <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl opacity-20"
                    style={{ background: "rgba(245,158,11,0.6)" }} />

                {/* Header */}
                <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/[0.07]"
                    style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-amber-400" />
                        <span className="text-sm font-bold text-white">Customer Details</span>
                    </div>
                    <button onClick={onClose}
                        className="h-7 w-7 flex items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.10] transition-all">
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>

                {/* Avatar + Name */}
                <div className="flex flex-col items-center pt-7 pb-5 px-6">
                    <div className="relative mb-3">
                        <div className="h-20 w-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white/90 border border-white/[0.12]"
                            style={{ background: podium ? `linear-gradient(135deg,${podium.avatarFrom},${podium.avatarTo})` : "rgba(255,255,255,0.06)" }}>
                            {initials(customer.name)}
                        </div>
                        {customer.rank && (
                            <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black border border-white/10"
                                style={{ background: podium ? podium.pillBg : "#27272a", color: podium ? podium.pillText : "#a1a1aa" }}>
                                #{customer.rank}
                            </div>
                        )}
                    </div>
                    <p className="text-lg font-black text-white">{customer.name}</p>
                    <p className="text-xs text-zinc-500 mb-3">{customer.email}</p>
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${tier.bg} ${tier.border} ${tier.color}`}>
                            {tier.emoji} {tier.name}
                        </span>
                        {customer.isBanned && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                                <Ban className="h-3 w-3" /> Banned
                            </span>
                        )}
                        {podium && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border"
                                style={{ background: `${podium.pillBg}33`, color: podium.pillText, borderColor: podium.pillBorder }}>
                                <Crown className="h-3 w-3" /> {podium.label}
                            </span>
                        )}
                    </div>
                </div>

                {/* Stats grid */}
                <div className="px-6 pb-6 grid grid-cols-2 gap-3">
                    {[
                        { label: "Total Spent", value: `₹${customer.totalSpent.toLocaleString("en-IN")}`, icon: <IndianRupee className="h-3.5 w-3.5 text-amber-400" />, color: "text-amber-400" },
                        { label: "Total Orders", value: String(customer.orderCount), icon: <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" />, color: "text-emerald-400" },
                        { label: "Brownie Points", value: String(customer.browniePoints), icon: <Star className="h-3.5 w-3.5 text-amber-400" />, color: "text-amber-400" },
                        { label: "Global Rank", value: `#${customer.rank}`, icon: <Trophy className="h-3.5 w-3.5 text-yellow-400" />, color: "text-yellow-400" },
                        { label: "Last Order", value: timeAgo(customer.lastOrderAt), icon: <Clock className="h-3.5 w-3.5 text-blue-400" />, color: "text-blue-300" },
                        { label: "Member Since", value: formatDate(customer.memberSince), icon: <Calendar className="h-3.5 w-3.5 text-purple-400" />, color: "text-purple-300" },
                        { label: "Account Status", value: customer.isBanned ? "Banned" : "Active", icon: customer.isBanned ? <ShieldBan className="h-3.5 w-3.5 text-red-400" /> : <ShieldCheck className="h-3.5 w-3.5 text-green-400" />, color: customer.isBanned ? "text-red-400" : "text-green-400" },
                        { label: "Avg. Order Value", value: customer.orderCount > 0 ? `₹${Math.round(customer.totalSpent / customer.orderCount).toLocaleString("en-IN")}` : "N/A", icon: <IndianRupee className="h-3.5 w-3.5 text-zinc-400" />, color: "text-zinc-300" },
                    ].map((s) => (
                        <div key={s.label} className="rounded-xl px-3.5 py-3 border border-white/[0.06]"
                            style={{ background: "rgba(255,255,255,0.03)" }}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                {s.icon}
                                <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">{s.label}</span>
                            </div>
                            <p className={`text-sm font-black tabular-nums ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Email row */}
                <div className="mx-6 mb-6 rounded-xl px-4 py-3 border border-white/[0.06] flex items-center gap-3"
                    style={{ background: "rgba(255,255,255,0.03)" }}>
                    <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold flex-shrink-0">Email</span>
                    <span className="text-xs font-semibold text-zinc-300 truncate">{customer.email}</span>
                </div>
            </div>
        </div>
    );
}

/* ───────────────────────── Podium Card ───────────────────────── */
function PodiumCard({ customer, onAward, onBan, awarding, banning, onDetails }: {
    customer: Customer;
    onAward: (email: string, points: number) => void;
    onBan: (email: string, isBanned: boolean) => void;
    awarding: string | null;
    banning: string | null;
    onDetails: (c: Customer) => void;
}) {
    const rc = PODIUM_CONFIG.find((r) => r.rank === customer.rank)!;
    const tier = getTier(customer.browniePoints);
    const isAwarding = awarding === customer.email;
    const isBanning = banning === customer.email;

    return (
        <div className={`relative rounded-2xl p-5 flex flex-col items-center text-center ring-1 ${rc.ringColor} ${customer.isBanned ? "opacity-60" : ""}`}
            style={{ ...glass, boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 48px ${rc.glowColor}, inset 0 1px 0 rgba(255,255,255,0.07)` }}>

            <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl opacity-25"
                    style={{ background: rc.glowColor }} />
            </div>

            {/* ── Rank badge – solid, prominent ── */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <span
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-extrabold shadow-lg"
                    style={{
                        background: rc.pillBg,
                        color: rc.pillText,
                        border: `1.5px solid ${rc.pillBorder}`,
                        boxShadow: `0 4px 14px rgba(0,0,0,0.45), 0 0 12px ${rc.glowColor}`,
                        letterSpacing: "0.02em",
                    }}>
                    <Crown className="h-3 w-3" style={{ color: rc.pillText }} />
                    {rc.label}
                </span>
            </div>

            {customer.isBanned && (
                <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                        <Ban className="h-2.5 w-2.5" /> Banned
                    </span>
                </div>
            )}

            <div className="relative mt-7 mb-3 flex-shrink-0">
                <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-black border border-white/[0.12] text-white/90"
                    style={{ background: `linear-gradient(135deg,${rc.avatarFrom},${rc.avatarTo})` }}>
                    {initials(customer.name)}
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border border-white/10"
                    style={{ background: rc.pillBg, color: rc.pillText }}>
                    {customer.rank}
                </div>
            </div>

            <p className="text-sm font-bold text-white leading-tight">{customer.name}</p>
            <p className="text-[11px] text-zinc-500 mb-1.5 truncate w-full px-2">{customer.email}</p>

            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold mb-4 border ${tier.bg} ${tier.border} ${tier.color}`}>
                {tier.emoji} {tier.name}
            </span>

            <div className="w-full grid grid-cols-2 gap-2 mb-3">
                {[
                    { label: "Spent", value: `₹${customer.totalSpent.toLocaleString("en-IN")}`, color: "text-amber-400" },
                    { label: "Orders", value: String(customer.orderCount), color: "text-white" },
                ].map((s) => (
                    <div key={s.label} className="rounded-xl px-3 py-2.5 border border-white/[0.06]"
                        style={{ background: "rgba(255,255,255,0.03)" }}>
                        <p className="text-[10px] text-zinc-600 mb-1 uppercase tracking-wider">{s.label}</p>
                        <p className={`text-sm font-black tabular-nums ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 mb-3 border border-amber-500/[0.15]"
                style={{ background: "rgba(245,158,11,0.06)" }}>
                <div className="flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs text-zinc-400">Brownie pts</span>
                </div>
                <span className="text-sm font-black text-amber-400 tabular-nums">{customer.browniePoints}</span>
            </div>

            <div className="w-full flex flex-col gap-2">
                <button onClick={() => onAward(customer.email, rc.bonus)} disabled={isAwarding || customer.isBanned}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${rc.badgeBg} ${rc.badgeBorder} ${rc.badgeText} hover:opacity-80 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed`}>
                    {isAwarding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Plus className="h-3 w-3" />Award {rc.bonus} pts</>}
                </button>

                {/* Details button */}
                <button onClick={() => onDetails(customer)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-white/[0.10] bg-white/[0.05] text-zinc-300 hover:bg-white/[0.09] hover:text-white active:scale-[0.98]">
                    <Info className="h-3 w-3" /> View Details
                </button>
            </div>
        </div>
    );
}

export function CustomersTable() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [awarding, setAwarding] = useState<string | null>(null);
    const [banning, setBanning] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<"totalSpent" | "orderCount" | "browniePoints">("totalSpent");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [detailsCustomer, setDetailsCustomer] = useState<Customer | null>(null);

    async function load() {
        try {
            const res = await fetch("/api/admin/customers");
            const data = await res.json();
            if (data.success) setCustomers(data.customers);
        } catch { toast.error("Failed to load customers"); }
        finally { setLoading(false); }
    }

    useEffect(() => { load(); }, []);
    useEffect(() => { setCurrentPage(1); }, [search, sortBy, pageSize]);

    async function awardPoints(email: string, points: number) {
        setAwarding(email);
        const id = toast.loading("Awarding points…");
        try {
            const res = await fetch("/api/admin/customers", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, points }) });
            const data = await res.json();
            if (!data.success) throw new Error();
            toast.success(`${points > 0 ? "+" : ""}${points} pts awarded!`, { id });
            setCustomers((prev) => prev.map((c) => c.email === email ? { ...c, browniePoints: data.browniePoints } : c));
        } catch { toast.error("Failed to award points", { id }); }
        finally { setAwarding(null); }
    }

    async function toggleBan(email: string, isBanned: boolean) {
        setBanning(email);
        const id = toast.loading(isBanned ? "Banning user…" : "Unbanning user…");
        try {
            const res = await fetch("/api/admin/customers", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, isBanned }) });
            const data = await res.json();
            if (!data.success) throw new Error();
            toast.success(isBanned ? "User banned" : "User unbanned", { id });
            setCustomers((prev) => prev.map((c) => c.email === email ? { ...c, isBanned } : c));
        } catch { toast.error("Failed to update ban status", { id }); }
        finally { setBanning(null); }
    }

    const top3 = customers.slice(0, 3);
    const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
    const totalOrders = customers.reduce((s, c) => s + c.orderCount, 0);
    const bannedCount = customers.filter((c) => c.isBanned).length;

    const filteredAll = customers
        .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => b[sortBy] - a[sortBy]);

    const totalPages = Math.max(1, Math.ceil(filteredAll.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paginated = filteredAll.slice((safePage - 1) * pageSize, safePage * pageSize);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32 gap-2 text-zinc-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading customers…</span>
            </div>
        );
    }

    return (
        <div className="space-y-5">

            {/* Details Modal */}
            {detailsCustomer && (
                <CustomerDetailsModal customer={detailsCustomer} onClose={() => setDetailsCustomer(null)} />
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { icon: <Users className="h-4 w-4" />, label: "Customers", value: customers.length, color: "text-blue-400", glow: "rgba(59,130,246,0.12)" },
                    { icon: <IndianRupee className="h-4 w-4" />, label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, color: "text-amber-400", glow: "rgba(245,158,11,0.12)" },
                    { icon: <ShoppingBag className="h-4 w-4" />, label: "Total Orders", value: totalOrders, color: "text-emerald-400", glow: "rgba(52,211,153,0.12)" },
                    { icon: <Ban className="h-4 w-4" />, label: "Banned Users", value: bannedCount, color: "text-red-400", glow: "rgba(239,68,68,0.12)" },
                ].map((s) => (
                    <div key={s.label} className="relative rounded-2xl overflow-hidden px-4 py-4 flex items-center gap-3" style={glass}>
                        <div className="pointer-events-none absolute -top-4 -right-4 w-16 h-16 rounded-full blur-2xl" style={{ background: s.glow }} />
                        <div className={`flex-shrink-0 p-2.5 rounded-xl border border-white/[0.07] ${s.color}`} style={{ background: "rgba(255,255,255,0.04)" }}>
                            {s.icon}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5 truncate">{s.label}</p>
                            <p className={`text-xl font-black tabular-nums ${s.color}`}>{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Podium */}
            {top3.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <Trophy className="h-4 w-4 text-amber-400" />
                        </div>
                        <p className="text-sm font-bold text-white">Top Customers</p>
                        <span className="text-[11px] text-zinc-600 border border-white/[0.06] rounded-lg px-2 py-0.5" style={{ background: "rgba(255,255,255,0.02)" }}>
                            award bonus points or manage access
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {top3.map((c) => (
                            <PodiumCard key={c.email} customer={c} onAward={awardPoints} onBan={toggleBan} awarding={awarding} banning={banning} onDetails={setDetailsCustomer} />
                        ))}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="relative rounded-2xl overflow-hidden" style={glass}>
                <div className="pointer-events-none absolute -top-12 -left-12 h-36 w-36 rounded-full bg-amber-500/[0.05] blur-3xl" />
                <div className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-blue-500/[0.04] blur-3xl" />

                {/* Table header */}
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-white/[0.06]"
                    style={{ background: "rgba(255,255,255,0.015)" }}>
                    <div className="flex-shrink-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-white">All Customers</p>
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-400/25">{filteredAll.length}</span>
                            {bannedCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20">{bannedCount} banned</span>
                            )}
                        </div>
                        <p className="text-[11px] text-zinc-600 mt-0.5">
                            Sorted by {sortBy === "totalSpent" ? "total spend" : sortBy === "orderCount" ? "order count" : "brownie points"}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                        <div className="relative flex-1 sm:w-48">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers…"
                                className="w-full h-8 pl-8 pr-3 rounded-xl text-xs text-white placeholder:text-zinc-600 bg-white/[0.06] border border-white/[0.10] focus:outline-none focus:border-amber-400/50 transition-all" />
                        </div>
                        <div className="flex items-center gap-1.5 px-2 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                            <span className="text-[10px] text-zinc-500 font-semibold">Show</span>
                            <div className="flex gap-0.5">
                                {PAGE_SIZE_OPTIONS.map((size) => (
                                    <button key={size} onClick={() => setPageSize(size)}
                                        className={`px-2 h-6 rounded-lg text-[10px] font-bold transition-all duration-200 ${pageSize === size ? "bg-amber-500 text-zinc-950 shadow-[0_2px_8px_rgba(245,158,11,0.35)]" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]"}`}>
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-0.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                            {(["totalSpent", "orderCount", "browniePoints"] as const).map((s) => (
                                <button key={s} onClick={() => setSortBy(s)}
                                    className={`px-2.5 h-6 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${sortBy === s ? "bg-amber-500 text-zinc-950 shadow-[0_2px_10px_rgba(245,158,11,0.3)]" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]"}`}>
                                    {s === "totalSpent" ? "Spend" : s === "orderCount" ? "Orders" : "Points"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full" style={{ minWidth: 820 }}>
                        <thead>
                            <tr className="border-b border-white/[0.05]">
                                {["Rank", "Customer", "Tier", "Orders", "Spent", "Points", "Last Order", "Actions"].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((c, i) => {
                                const tier = getTier(c.browniePoints);
                                const isTop3 = c.rank <= 3;
                                const podium = PODIUM_CONFIG.find((p) => p.rank === c.rank);
                                const isAwarding = awarding === c.email;
                                const isBanning = banning === c.email;
                                return (
                                    <tr key={c.email}
                                        className={`border-b border-white/[0.03] transition-colors hover:bg-white/[0.03] ${i % 2 !== 0 ? "bg-white/[0.01]" : ""} ${c.isBanned ? "opacity-50" : ""}`}>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {isTop3
                                                ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold"
                                                    style={{ background: podium?.pillBg, color: podium?.pillText, border: `1px solid ${podium?.pillBorder}` }}>
                                                    <Crown className="h-2.5 w-2.5" />#{c.rank}
                                                </span>
                                                : <span className="text-xs font-bold text-zinc-600">#{c.rank}</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold text-zinc-300 flex-shrink-0 border border-white/[0.07]"
                                                    style={{ background: "rgba(255,255,255,0.05)" }}>
                                                    {initials(c.name)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <p className="text-xs font-semibold text-white leading-tight">{c.name}</p>
                                                        {c.isBanned && (
                                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/15 text-red-400 border border-red-500/20 whitespace-nowrap">BANNED</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-zinc-600 truncate max-w-[140px]">{c.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tier.bg} ${tier.border} ${tier.color}`}>
                                                {tier.emoji} {tier.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-semibold text-zinc-300 tabular-nums">{c.orderCount}</span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-xs font-black text-amber-400 tabular-nums">₹{c.totalSpent.toLocaleString("en-IN")}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-12 rounded-full overflow-hidden flex-shrink-0" style={{ background: "rgba(255,255,255,0.06)" }}>
                                                    <div className="h-full rounded-full bg-amber-500/60 transition-all" style={{ width: `${Math.min(100, (c.browniePoints / 500) * 100)}%` }} />
                                                </div>
                                                <span className="text-xs font-semibold text-amber-400/80 tabular-nums">{c.browniePoints}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-xs text-zinc-500">{timeAgo(c.lastOrderAt)}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 flex-nowrap">
                                                <button onClick={() => awardPoints(c.email, 10)} disabled={isAwarding || c.isBanned}
                                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 active:scale-95 transition-all disabled:opacity-30 whitespace-nowrap">
                                                    {isAwarding ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Plus className="h-3 w-3" />10</>}
                                                </button>
                                                <button onClick={() => awardPoints(c.email, -10)} disabled={isAwarding || c.browniePoints < 10 || c.isBanned}
                                                    className="flex items-center justify-center w-7 h-7 rounded-lg font-bold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 hover:bg-zinc-500/20 active:scale-95 transition-all disabled:opacity-30">
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <button onClick={() => toggleBan(c.email, !c.isBanned)} disabled={isBanning}
                                                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all active:scale-95 disabled:opacity-40 whitespace-nowrap ${c.isBanned ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"}`}>
                                                    {isBanning ? <Loader2 className="h-3 w-3 animate-spin" /> : c.isBanned ? <><CheckCircle className="h-3 w-3" />Unban</> : <><Ban className="h-3 w-3" />Ban</>}
                                                </button>
                                                <button onClick={() => setDetailsCustomer(c)}
                                                    className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.10] text-zinc-400 hover:text-white hover:bg-white/[0.09] active:scale-95 transition-all"
                                                    title="View details">
                                                    <Info className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredAll.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-12 w-12 rounded-2xl mb-3 flex items-center justify-center border border-white/[0.07]" style={{ background: "rgba(255,255,255,0.03)" }}>
                                <Search className="h-5 w-5 text-zinc-600" />
                            </div>
                            <p className="text-zinc-500 text-sm font-medium">No customers found</p>
                            <p className="text-zinc-700 text-xs mt-1">Try adjusting your search</p>
                        </div>
                    )}

                    {filteredAll.length > 0 && totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.05] bg-white/[0.01]">
                            <p className="text-[11px] text-zinc-500">
                                Showing{" "}
                                <span className="text-zinc-300 font-semibold">{(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filteredAll.length)}</span>
                                {" "}of{" "}
                                <span className="text-zinc-300 font-semibold">{filteredAll.length}</span> customers
                            </p>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.09] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                                    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((p, idx) =>
                                        p === "..." ? (
                                            <span key={`ellipsis-${idx}`} className="text-zinc-600 text-xs px-1">…</span>
                                        ) : (
                                            <button key={p} onClick={() => setCurrentPage(p as number)}
                                                className={`h-7 min-w-[28px] px-2 rounded-lg text-[11px] font-bold transition-all duration-200 ${safePage === p ? "bg-amber-500 text-zinc-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]" : "bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.09]"}`}>
                                                {p}
                                            </button>
                                        )
                                    )}
                                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.09] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {customers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="h-14 w-14 rounded-2xl mb-4 flex items-center justify-center border border-white/[0.07]" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <Users className="h-6 w-6 text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 font-medium">No customers yet</p>
                    <p className="text-zinc-700 text-xs mt-1">Orders will appear here once placed</p>
                </div>
            )}
        </div>
    );
}