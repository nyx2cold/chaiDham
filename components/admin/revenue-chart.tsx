"use client";

import { useEffect, useState } from "react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from "recharts";
import { Loader2, TrendingUp } from "lucide-react";

interface DayData {
    day: string; date: string; revenue: number; orders: number;
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-white/[0.1] bg-zinc-900/95 px-3 py-2.5 shadow-xl backdrop-blur">
            <p className="text-[11px] font-semibold text-zinc-400 mb-1.5">{label}</p>
            <div className="flex items-center gap-1.5 mb-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span className="text-xs font-black text-amber-400">
                    ₹{(payload[0]?.value ?? 0).toLocaleString("en-IN")}
                </span>
            </div>
            <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                <span className="text-xs text-zinc-400">{payload[1]?.value ?? 0} orders</span>
            </div>
        </div>
    );
}

export function RevenueChart() {
    const [data, setData] = useState<DayData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/analytics")
            .then((r) => r.json())
            .then((d) => { if (d.success) setData(d.weeklyChart); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
    const totalOrders = data.reduce((s, d) => s + d.orders, 0);
    const peakDay = data.reduce((best, d) => d.revenue > best.revenue ? d : best, data[0]);

    useEffect(() => {
        const refetch = () => {
            fetch("/api/analytics")
                .then((r) => r.json())
                .then((d) => {
                    if (d.success) {
                        setData(d.weeklyChart);
                    }
                })
                .catch(console.error);
        };

        window.addEventListener("order-status-changed", refetch);
        return () => window.removeEventListener("order-status-changed", refetch);
    }, []);

    return (
        <div className="rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
                <div>
                    <p className="text-sm font-bold text-white">Weekly Revenue</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Last 7 days</p>
                </div>
                {!loading && (
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-lg font-black text-amber-400 tabular-nums">
                                ₹{totalRevenue.toLocaleString("en-IN")}
                            </p>
                            <p className="text-[11px] text-zinc-500">{totalOrders} orders total</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Peak day callout */}
            {!loading && peakDay && peakDay.revenue > 0 && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl
          bg-amber-500/[0.07] border border-amber-500/[0.15]">
                    <TrendingUp className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                    <p className="text-[11px] text-zinc-400">
                        Peak day was <span className="text-amber-400 font-bold">{peakDay.day}</span> with{" "}
                        <span className="text-white font-bold">₹{peakDay.revenue.toLocaleString("en-IN")}</span>
                    </p>
                </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 mb-3">
                <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />Revenue
                </span>
                <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <span className="h-2 w-2 rounded-full bg-zinc-600" />Orders
                </span>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-[200px]">
                    <Loader2 className="h-5 w-5 text-zinc-600 animate-spin" />
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                        <defs>
                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                            </linearGradient>
                            <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#71717a" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#71717a" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.04)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="day"
                            tick={{ fill: "#52525b", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: "#52525b", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: "rgba(245,158,11,0.15)", strokeWidth: 1 }}
                        />
                        <Area
                            type="monotone" dataKey="revenue"
                            stroke="#f59e0b" strokeWidth={2}
                            fill="url(#revGrad)" dot={false}
                            activeDot={{ r: 4, fill: "#f59e0b", strokeWidth: 0 }}
                        />
                        <Area
                            type="monotone" dataKey="orders"
                            stroke="#52525b" strokeWidth={1.5}
                            fill="url(#ordGrad)" dot={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}