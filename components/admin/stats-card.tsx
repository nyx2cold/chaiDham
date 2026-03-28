"use client";

import { TrendingUp, TrendingDown, ShoppingBag, IndianRupee, Users, Clock } from "lucide-react";

const STATS = [
    {
        label: "Today's Revenue",
        value: "₹4,280",
        change: "+12.5%",
        up: true,
        sub: "vs yesterday",
        icon: <IndianRupee className="h-4 w-4" />,
        color: "amber",
    },
    {
        label: "Total Orders",
        value: "38",
        change: "+8",
        up: true,
        sub: "since yesterday",
        icon: <ShoppingBag className="h-4 w-4" />,
        color: "blue",
    },
    {
        label: "Avg. Order Value",
        value: "₹112",
        change: "-4.2%",
        up: false,
        sub: "vs last week",
        icon: <TrendingUp className="h-4 w-4" />,
        color: "green",
    },
    {
        label: "Avg. Wait Time",
        value: "8 min",
        change: "-2 min",
        up: true,
        sub: "faster than usual",
        icon: <Clock className="h-4 w-4" />,
        color: "purple",
    },
];

const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", icon: "bg-amber-500/20 text-amber-400" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-400", icon: "bg-blue-500/20 text-blue-400" },
    green: { bg: "bg-green-500/10", text: "text-green-400", icon: "bg-green-500/20 text-green-400" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-400", icon: "bg-purple-500/20 text-purple-400" },
};

export function StatsCards() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((stat) => {
                const c = colorMap[stat.color];
                return (
                    <div
                        key={stat.label}
                        className="relative rounded-2xl border border-white/[0.07] bg-zinc-900/50 p-4 overflow-hidden"
                    >
                        {/* Subtle glow blob */}
                        <div className={`absolute -top-4 -right-4 h-16 w-16 rounded-full blur-2xl opacity-30 ${c.bg}`} />

                        <div className="flex items-start justify-between mb-3">
                            <p className="text-xs font-medium text-zinc-500">{stat.label}</p>
                            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${c.icon}`}>
                                {stat.icon}
                            </div>
                        </div>

                        <p className="text-2xl font-bold text-white tabular-nums">{stat.value}</p>

                        <div className="flex items-center gap-1.5 mt-1.5">
                            <span className={`flex items-center gap-0.5 text-xs font-semibold ${stat.up ? "text-green-400" : "text-red-400"
                                }`}>
                                {stat.up
                                    ? <TrendingUp className="h-3 w-3" />
                                    : <TrendingDown className="h-3 w-3" />
                                }
                                {stat.change}
                            </span>
                            <span className="text-xs text-zinc-600">{stat.sub}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}