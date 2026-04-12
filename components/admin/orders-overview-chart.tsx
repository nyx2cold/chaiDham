"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Loader2 } from "lucide-react";

interface StatusBreakdown {
    pending: number; preparing: number; ready: number;
    completed: number; cancelled: number;
}

const STATUS_CONFIG = [
    { key: "completed", label: "Completed", color: "#22c55e" },
    { key: "preparing", label: "Preparing", color: "#f59e0b" },
    { key: "pending", label: "Pending", color: "#71717a" },
    { key: "ready", label: "Ready", color: "#3b82f6" },
    { key: "cancelled", label: "Cancelled", color: "#ef4444" },
];

function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const total = payload[0].payload.total;
    const pct = total > 0
        ? ((payload[0].value / total) * 100).toFixed(1)
        : "0";
    return (
        // position: relative so it never overlaps the SVG centre
        <div className="rounded-xl border border-white/[0.1] bg-zinc-900/95 px-3 py-2 shadow-xl pointer-events-none">
            <p className="text-xs font-bold text-white">{payload[0].name}</p>
            <p className="text-sm font-black" style={{ color: payload[0].payload.color }}>
                {payload[0].value} orders
            </p>
            <p className="text-[11px] text-zinc-500">{pct}% of total</p>
        </div>
    );
}

// Renders the total count in the donut hole via recharts customised label
function CentreLabel({
    viewBox, total,
}: {
    viewBox?: { cx: number; cy: number };
    total: number;
}) {
    if (!viewBox) return null;
    const { cx, cy } = viewBox;
    return (
        <g>
            <text
                x={cx} y={cy - 6}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white font-black"
                style={{ fontSize: 22, fontWeight: 900 }}
            >
                {total}
            </text>
            <text
                x={cx} y={cy + 14}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: 11, fill: "#71717a" }}
            >
                total
            </text>
        </g>
    );
}

export function OrdersOverviewChart() {
    const [breakdown, setBreakdown] = useState<StatusBreakdown | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/analytics")
            .then((r) => r.json())
            .then((d) => { if (d.success) setBreakdown(d.statusBreakdown); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const total = breakdown
        ? Object.values(breakdown).reduce((s, v) => s + v, 0)
        : 0;

    const data = STATUS_CONFIG
        .map((s) => ({
            name: s.label,
            value: breakdown?.[s.key as keyof StatusBreakdown] ?? 0,
            color: s.color,
            total,
        }))
        .filter((d) => d.value > 0);

    const pieData = data.length > 0
        ? data
        : [{ name: "No orders", value: 1, color: "#27272a", total: 0 }];

    const completedCount = breakdown?.completed ?? 0;
    const completionRate = total > 0
        ? Math.round((completedCount / total) * 100)
        : 0;

    return (
        <div className="rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-5 flex flex-col h-full">
            <div className="mb-4">
                <p className="text-sm font-bold text-white">Order Status</p>
                <p className="text-xs text-zinc-500 mt-0.5">All-time breakdown</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center flex-1 min-h-[200px]">
                    <Loader2 className="h-5 w-5 text-zinc-600 animate-spin" />
                </div>
            ) : (
                <>
                    {/* Donut — taller container so the ring breathes */}
                    <div className="relative w-full" style={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart
                                // push tooltip well outside the ring
                                margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
                            >
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={58}
                                    outerRadius={82}
                                    paddingAngle={data.length > 1 ? 3 : 0}
                                    dataKey="value"
                                    strokeWidth={0}
                                    startAngle={90}
                                    endAngle={-270}
                                    // renders total in the hole — no overlapping HTML needed
                                    labelLine={false}
                                    label={
                                        data.length > 0
                                            ? (props: any) => (
                                                <CentreLabel viewBox={props.viewBox} total={total} />
                                            )
                                            : undefined
                                    }
                                >
                                    {pieData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>

                                {data.length > 0 && (
                                    <Tooltip
                                        content={<CustomTooltip />}
                                        // offset pushes tooltip away from cursor / ring centre
                                        offset={16}
                                        allowEscapeViewBox={{ x: true, y: true }}
                                        position={{ y: -10 }}   // always render above the ring
                                    />
                                )}
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Completion rate */}
                    {total > 0 && (
                        <div className="mb-4 px-1">
                            <div className="flex justify-between text-[11px] mb-1">
                                <span className="text-zinc-500">Completion rate</span>
                                <span className="font-bold text-emerald-400">{completionRate}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                                    style={{ width: `${completionRate}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Legend */}
                    <div className="space-y-2.5 mt-auto">
                        {total === 0 ? (
                            <p className="text-center text-xs text-zinc-600 py-3">No orders yet</p>
                        ) : (
                            STATUS_CONFIG.map((s) => {
                                const count = breakdown?.[s.key as keyof StatusBreakdown] ?? 0;
                                const pct = total > 0 ? (count / total) * 100 : 0;
                                return (
                                    <div key={s.key} className="flex items-center gap-2">
                                        <span
                                            className="h-2 w-2 rounded-full flex-shrink-0"
                                            style={{ background: s.color }}
                                        />
                                        <span className="text-xs text-zinc-400 flex-1">{s.label}</span>
                                        <div className="w-16 h-1 rounded-full bg-zinc-800 overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{ width: `${pct}%`, background: s.color }}
                                            />
                                        </div>
                                        <span
                                            className="text-xs font-bold tabular-nums w-5 text-right"
                                            style={{ color: count > 0 ? s.color : "#3f3f46" }}
                                        >
                                            {count}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </>
            )}
        </div>
    );
}