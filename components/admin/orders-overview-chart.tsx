"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
    { name: "Completed", value: 28, color: "#22c55e" },
    { name: "Preparing", value: 6, color: "#f59e0b" },
    { name: "Pending", value: 4, color: "#71717a" },
];

function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-white/[0.1] bg-zinc-900 px-3 py-2 shadow-xl">
            <p className="text-xs font-bold text-white">{payload[0].name}</p>
            <p className="text-sm font-bold" style={{ color: payload[0].payload.color }}>
                {payload[0].value} orders
            </p>
        </div>
    );
}

export function OrdersOverviewChart() {
    const total = data.reduce((s, d) => s + d.value, 0);

    return (
        <div className="rounded-2xl border border-white/[0.07] bg-zinc-900/50 p-5 h-full">
            <div className="mb-4">
                <p className="text-sm font-bold text-white">Order Status</p>
                <p className="text-xs text-zinc-500 mt-0.5">Today's breakdown</p>
            </div>

            <div className="relative flex justify-center">
                <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                        >
                            {data.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-2xl font-bold text-white">{total}</p>
                    <p className="text-[11px] text-zinc-500">total</p>
                </div>
            </div>

            <div className="mt-3 space-y-2">
                {data.map((d) => (
                    <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                            <span className="text-xs text-zinc-400">{d.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-20 h-1 rounded-full bg-zinc-800 overflow-hidden">
                                <div
                                    className="h-full rounded-full"
                                    style={{ width: `${(d.value / total) * 100}%`, background: d.color }}
                                />
                            </div>
                            <span className="text-xs font-semibold text-white tabular-nums w-4">{d.value}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}