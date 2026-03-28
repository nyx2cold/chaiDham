// components/admin/OrdersTable.tsx
"use client";

import { useState } from "react";
import { Clock, CheckCircle2, ChefHat, XCircle, Search, Sparkles } from "lucide-react";

export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";

export interface Order {
    id: string;
    customer: string;
    items: string[];
    total: number;
    type: "dine-in" | "takeaway";
    status: OrderStatus;
    placedAt: string;
    estimatedMins: number;
}

const STATUS_CONFIG: Record<OrderStatus, {
    label: string;
    textColor: string;
    glowColor: string;
    borderColor: string;
    bgGlass: string;
    icon: React.ReactNode;
}> = {
    pending: {
        label: "Pending",
        textColor: "text-zinc-300",
        glowColor: "shadow-zinc-500/20",
        borderColor: "border-zinc-500/30",
        bgGlass: "bg-zinc-500/10 backdrop-blur-sm",
        icon: <Clock className="h-3 w-3" />,
    },
    preparing: {
        label: "Preparing",
        textColor: "text-amber-300",
        glowColor: "shadow-amber-500/30",
        borderColor: "border-amber-400/40",
        bgGlass: "bg-amber-500/10 backdrop-blur-sm",
        icon: <ChefHat className="h-3 w-3" />,
    },
    ready: {
        label: "Ready",
        textColor: "text-emerald-300",
        glowColor: "shadow-emerald-500/30",
        borderColor: "border-emerald-400/40",
        bgGlass: "bg-emerald-500/10 backdrop-blur-sm",
        icon: <CheckCircle2 className="h-3 w-3" />,
    },
    completed: {
        label: "Completed",
        textColor: "text-zinc-500",
        glowColor: "shadow-zinc-700/20",
        borderColor: "border-zinc-700/40",
        bgGlass: "bg-zinc-700/10 backdrop-blur-sm",
        icon: <CheckCircle2 className="h-3 w-3" />,
    },
    cancelled: {
        label: "Cancelled",
        textColor: "text-red-400",
        glowColor: "shadow-red-500/20",
        borderColor: "border-red-500/30",
        bgGlass: "bg-red-500/10 backdrop-blur-sm",
        icon: <XCircle className="h-3 w-3" />,
    },
};

const STATUS_ORDER: OrderStatus[] = ["pending", "preparing", "ready", "completed", "cancelled"];

interface Props {
    compact?: boolean;
    // ── Lifted-state props (optional — falls back to internal mock data if not provided) ──
    orders?: Order[];
    onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
}

const MOCK_ORDERS: Order[] = [
    { id: "#1042", customer: "Rahul S.", items: ["Masala Chai x2", "Samosa x3"], total: 115, type: "dine-in", status: "preparing", placedAt: "11:24 AM", estimatedMins: 6 },
    { id: "#1041", customer: "Priya M.", items: ["Classic Maggi", "Lemon Soda"], total: 70, type: "takeaway", status: "ready", placedAt: "11:20 AM", estimatedMins: 0 },
    { id: "#1040", customer: "Amit K.", items: ["Special Thali"], total: 120, type: "dine-in", status: "completed", placedAt: "11:10 AM", estimatedMins: 0 },
    { id: "#1039", customer: "Sneha R.", items: ["Adrak Chai x2", "Bread Pakora"], total: 80, type: "dine-in", status: "pending", placedAt: "11:28 AM", estimatedMins: 10 },
    { id: "#1038", customer: "Dev P.", items: ["Cheese Maggi", "Coca Cola"], total: 85, type: "takeaway", status: "completed", placedAt: "11:05 AM", estimatedMins: 0 },
    { id: "#1037", customer: "Kavya T.", items: ["Masala Chai"], total: 20, type: "dine-in", status: "cancelled", placedAt: "10:55 AM", estimatedMins: 0 },
];

export function OrdersTable({ compact, orders: externalOrders, onStatusChange }: Props) {
    // Internal state only used when no external orders are passed (standalone mode)
    const [internalOrders, setInternalOrders] = useState<Order[]>(MOCK_ORDERS);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

    // Use external orders if provided, otherwise fall back to internal state
    const orders = externalOrders ?? internalOrders;

    function updateStatus(id: string, status: OrderStatus) {
        if (onStatusChange) {
            // Notify parent — parent owns the state
            onStatusChange(id, status);
        } else {
            // Standalone mode — update internal state directly
            setInternalOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
        }
    }

    const filtered = orders.filter((o) => {
        const matchSearch =
            o.customer.toLowerCase().includes(search.toLowerCase()) ||
            o.id.includes(search);
        const matchStatus = statusFilter === "all" || o.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const displayed = compact ? filtered.slice(0, 5) : filtered;

    return (
        <div className="relative rounded-2xl overflow-hidden">

            {/* Glassmorphic shell */}
            <div className="
                absolute inset-0 rounded-2xl
                bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.05]
                backdrop-blur-2xl
                border border-white/[0.10]
                shadow-[0_8px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-1px_0_rgba(0,0,0,0.3)]
            " />

            <div className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-amber-600/8 blur-3xl" />

            <div className="relative">

                {/* ── Header ── */}
                <div className="
                    flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3
                    px-5 py-4
                    border-b border-white/[0.06]
                    bg-gradient-to-r from-white/[0.04] to-transparent
                ">
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-white tracking-tight">
                                {compact ? "Recent Orders" : "All Orders"}
                            </p>
                            <span className="
                                inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md
                                text-[10px] font-bold text-amber-300
                                bg-amber-500/15 border border-amber-400/25
                                backdrop-blur-sm
                            ">
                                <Sparkles className="h-2.5 w-2.5" />
                                {filtered.length}
                            </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Live kitchen feed</p>
                    </div>

                    {!compact && (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-52">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search orders…"
                                    className="
                                        w-full h-8 pl-8 pr-3 rounded-xl text-xs text-white
                                        placeholder:text-zinc-600
                                        bg-white/[0.06] backdrop-blur-sm
                                        border border-white/[0.10]
                                        shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
                                        focus:outline-none focus:border-amber-400/50 focus:bg-white/[0.09]
                                        transition-all duration-200
                                    "
                                />
                            </div>

                            <div className="
                                flex gap-0.5 p-1 rounded-xl
                                bg-white/[0.04] backdrop-blur-sm
                                border border-white/[0.08]
                            ">
                                {(["all", ...STATUS_ORDER] as const).slice(0, 5).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className={`
                                            px-2.5 h-6 rounded-lg text-[10px] font-bold transition-all duration-200
                                            ${statusFilter === s
                                                ? "bg-amber-500 text-zinc-950 shadow-[0_2px_12px_rgba(245,158,11,0.4)] scale-[1.02]"
                                                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]"
                                            }
                                        `}
                                    >
                                        {s === "all" ? "All" : STATUS_CONFIG[s].label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Table ── */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/[0.05]">
                                {["Order", "Customer", "Items", "Total", "Type", "Status", "Time", "Action"].map((h) => (
                                    <th key={h} className="
                                        px-4 py-3 text-left
                                        text-[10px] font-bold text-zinc-600 uppercase tracking-widest
                                    ">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {displayed.map((order, i) => {
                                const sc = STATUS_CONFIG[order.status];
                                return (
                                    <tr
                                        key={order.id}
                                        className={`
                                            border-b border-white/[0.03]
                                            transition-all duration-200
                                            hover:bg-white/[0.04]
                                            group
                                            ${i % 2 !== 0 ? "bg-white/[0.015]" : ""}
                                        `}
                                    >
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-black text-amber-400 font-mono tracking-tight group-hover:text-amber-300 transition-colors">
                                                {order.id}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-semibold text-zinc-200">{order.customer}</span>
                                        </td>
                                        <td className="px-4 py-3 max-w-[160px]">
                                            <span className="text-xs text-zinc-500 line-clamp-1">{order.items.join(", ")}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-black tabular-nums text-white [text-shadow:0_0_20px_rgba(245,158,11,0.3)]">
                                                ₹{order.total}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`
                                                inline-flex px-2 py-0.5 rounded-lg
                                                text-[10px] font-bold backdrop-blur-sm border shadow-sm
                                                ${order.type === "dine-in"
                                                    ? "bg-sky-500/10 text-sky-300 border-sky-400/25"
                                                    : "bg-violet-500/10 text-violet-300 border-violet-400/25"
                                                }
                                            `}>
                                                {order.type === "dine-in" ? "Dine In" : "Takeaway"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`
                                                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                                                text-[10px] font-bold border backdrop-blur-sm shadow-sm
                                                ${sc.bgGlass} ${sc.textColor} ${sc.borderColor} ${sc.glowColor}
                                            `}>
                                                {sc.icon}
                                                {sc.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-xs text-zinc-400 tabular-nums">{order.placedAt}</p>
                                                {order.estimatedMins > 0 && (
                                                    <p className="text-[10px] text-amber-400 font-semibold mt-0.5 [text-shadow:0_0_10px_rgba(245,158,11,0.5)]">
                                                        ~{order.estimatedMins} min
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {order.status === "pending" && (
                                                <button onClick={() => updateStatus(order.id, "preparing")} className="px-3 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-400/30 backdrop-blur-sm hover:bg-amber-500/25 hover:border-amber-400/50 active:scale-95 transition-all duration-150">
                                                    Accept
                                                </button>
                                            )}
                                            {order.status === "preparing" && (
                                                <button onClick={() => updateStatus(order.id, "ready")} className="px-3 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 backdrop-blur-sm hover:bg-emerald-500/25 hover:border-emerald-400/50 active:scale-95 transition-all duration-150">
                                                    Mark Ready
                                                </button>
                                            )}
                                            {order.status === "ready" && (
                                                <button onClick={() => updateStatus(order.id, "completed")} className="px-3 py-1 rounded-lg text-[11px] font-bold bg-white/[0.07] text-zinc-300 border border-white/[0.12] backdrop-blur-sm hover:bg-white/[0.12] hover:text-white active:scale-95 transition-all duration-150">
                                                    Complete
                                                </button>
                                            )}
                                            {(order.status === "completed" || order.status === "cancelled") && (
                                                <span className="text-xs text-zinc-700">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {displayed.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="h-12 w-12 rounded-2xl mb-3 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] flex items-center justify-center">
                            <Search className="h-5 w-5 text-zinc-600" />
                        </div>
                        <p className="text-zinc-500 text-sm font-medium">No orders found</p>
                        <p className="text-zinc-700 text-xs mt-1">Try adjusting your filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}