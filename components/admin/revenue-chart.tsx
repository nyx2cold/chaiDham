"use client";

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const data = [
    { day: "Mon", revenue: 2400, orders: 18 },
    { day: "Tue", revenue: 1800, orders: 14 },
    { day: "Wed", revenue: 3200, orders: 26 },
    { day: "Thu", revenue: 2800, orders: 22 },
    { day: "Fri", revenue: 4100, orders: 34 },
    { day: "Sat", revenue: 5200, orders: 42 },
    { day: "Sun", revenue: 4280, orders: 38 },
];

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-white/[0.1] bg-zinc-900 px-3 py-2 shadow-xl">
            <p className="text-xs font-semibold text-zinc-400 mb-1">{label}</p>
            <p className="text-sm font-bold text-amber-400">₹{payload[0]?.value?.toLocaleString()}</p>
            <p className="text-xs text-zinc-500">{payload[1]?.value} orders</p>
        </div>
    );
}

export function RevenueChart() {
    return (
        <div className="rounded-2xl border border-white/[0.07] bg-zinc-900/50 p-5">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <p className="text-sm font-bold text-white">Weekly Revenue</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Last 7 days</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />Revenue
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-zinc-600" />Orders
                    </span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#71717a" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#71717a" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
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
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(245,158,11,0.2)", strokeWidth: 1 }} />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        fill="url(#revGrad)"
                        dot={false}
                        activeDot={{ r: 4, fill: "#f59e0b", strokeWidth: 0 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="orders"
                        stroke="#52525b"
                        strokeWidth={1.5}
                        fill="url(#ordGrad)"
                        dot={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}