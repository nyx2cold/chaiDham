"use client";

import { useEffect, useState } from "react";
import {
    TrendingUp, TrendingDown, ShoppingBag,
    IndianRupee, BarChart2, Clock, Loader2,
} from "lucide-react";



interface AnalyticsStats {
    todayRevenue: number;
    todayCount: number;
    revenueChange: string | null;
    orderChange: number;
    avgOrderValue: number;
    avgChange: string | null;
}

interface StatusBreakdown {
    pending: number;
    preparing: number;
    ready: number;
    completed: number;
    cancelled: number;
}

const colorMap: Record<string, { glow: string; icon: string }> = {
    amber: { glow: "bg-amber-500/10", icon: "bg-amber-500/15  text-amber-400" },
    blue: { glow: "bg-blue-500/10", icon: "bg-blue-500/15   text-blue-400" },
    green: { glow: "bg-emerald-500/10", icon: "bg-emerald-500/15 text-emerald-400" },
    orange: { glow: "bg-orange-500/10", icon: "bg-orange-500/15 text-orange-400" },
};

function StatCard({
    label, value, changeLabel, up, sub, icon, color, loading,
}: {
    label: string; value: string; changeLabel: string;
    up: boolean; sub: string; icon: React.ReactNode;
    color: string; loading: boolean;
}) {
    const c = colorMap[color];
    return (
        <div className="relative rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-5 overflow-hidden">
            <div className={`pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-40 ${c.glow}`} />
            <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-zinc-500 tracking-wide">{label}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${c.icon}`}>
                    {icon}
                </div>
            </div>
            {loading ? (
                <div className="flex items-center gap-2 h-9">
                    <Loader2 className="h-4 w-4 text-zinc-600 animate-spin" />
                    <span className="text-zinc-600 text-sm">Loading…</span>
                </div>
            ) : (
                <>
                    <p className="text-3xl font-black text-white tabular-nums tracking-tight">{value}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                        <span className={`flex items-center gap-0.5 text-xs font-bold ${up ? "text-emerald-400" : "text-red-400"}`}>
                            {up
                                ? <TrendingUp className="h-3 w-3" />
                                : <TrendingDown className="h-3 w-3" />}
                            {changeLabel}
                        </span>
                        <span className="text-xs text-zinc-600">{sub}</span>
                    </div>
                </>
            )}
        </div>
    );
}

export function StatsCards() {
    const [stats, setStats] = useState<AnalyticsStats | null>(null);
    const [breakdown, setBreakdown] = useState<StatusBreakdown | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/analytics")
            .then((r) => r.json())
            .then((d) => {
                if (d.success) {
                    setStats(d.stats);
                    setBreakdown(d.statusBreakdown);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const revenueChangeNum = parseFloat(stats?.revenueChange ?? "0");
    const avgChangeNum = parseFloat(stats?.avgChange ?? "0");
    const pendingNow = breakdown?.pending ?? 0;
    // orders needing attention = pending + preparing
    const activeOrders = (breakdown?.pending ?? 0) + (breakdown?.preparing ?? 0);

    const cards = [
        {
            label: "Today's Revenue",
            value: stats ? `₹${stats.todayRevenue.toLocaleString("en-IN")}` : "—",
            changeLabel: stats?.revenueChange != null
                ? `${revenueChangeNum >= 0 ? "+" : ""}${stats.revenueChange}%`
                : "No data yet",
            up: revenueChangeNum >= 0,
            sub: "vs yesterday",
            icon: <IndianRupee className="h-4 w-4" />,
            color: "amber",
        },
        {
            label: "Orders Today",
            value: stats ? String(stats.todayCount) : "—",
            changeLabel: stats
                ? `${stats.orderChange >= 0 ? "+" : ""}${stats.orderChange} orders`
                : "No data yet",
            up: (stats?.orderChange ?? 0) >= 0,
            sub: "vs yesterday",
            icon: <ShoppingBag className="h-4 w-4" />,
            color: "blue",
        },
        {
            label: "Avg. Order Value",
            value: stats ? `₹${stats.avgOrderValue.toLocaleString("en-IN")}` : "—",
            changeLabel: stats?.avgChange != null
                ? `${avgChangeNum >= 0 ? "+" : ""}${stats.avgChange}%`
                : "No data yet",
            up: avgChangeNum >= 0,
            sub: "vs last week",
            icon: <BarChart2 className="h-4 w-4" />,
            color: "green",
        },
        {
            label: "Pending Orders",
            value: breakdown ? String(pendingNow) : "—",
            changeLabel: breakdown
                ? `${activeOrders} active`
                : "No data yet",
            up: pendingNow === 0,
            sub: "need attention",
            icon: <Clock className="h-4 w-4" />,
            color: "orange",
        },
    ];

    useEffect(() => {
        const refetch = () => {
            fetch("/api/analytics")
                .then((r) => r.json())
                .then((d) => {
                    if (d.success) {
                        setStats(d.stats);
                        setBreakdown(d.statusBreakdown);

                    }
                })
                .catch(console.error);
        };

        window.addEventListener("order-status-changed", refetch);
        return () => window.removeEventListener("order-status-changed", refetch);
    }, []);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
                <StatCard key={card.label} {...card} loading={loading} />
            ))}
        </div>
    );
}