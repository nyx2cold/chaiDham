"use client";

import { useState } from "react";
import { Clock, CheckCircle2, ChefHat, XCircle, Search, Filter } from "lucide-react";

export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";

interface Order {
    id: string;
    customer: string;
    items: string[];
    total: number;
    type: "dine-in" | "takeaway";
    status: OrderStatus;
    placedAt: string;
    estimatedMins: number;
}

const MOCK_ORDERS: Order[] = [
    { id: "#1042", customer: "Rahul S.", items: ["Masala Chai x2", "Samosa x3"], total: 115, type: "dine-in", status: "preparing", placedAt: "11:24 AM", estimatedMins: 6 },
    { id: "#1041", customer: "Priya M.", items: ["Classic Maggi", "Lemon Soda"], total: 70, type: "takeaway", status: "ready", placedAt: "11:20 AM", estimatedMins: 0 },
    { id: "#1040", customer: "Amit K.", items: ["Special Thali"], total: 120, type: "dine-in", status: "completed", placedAt: "11:10 AM", estimatedMins: 0 },
    { id: "#1039", customer: "Sneha R.", items: ["Adrak Chai x2", "Bread Pakora"], total: 80, type: "dine-in", status: "pending", placedAt: "11:28 AM", estimatedMins: 10 },
    { id: "#1038", customer: "Dev P.", items: ["Cheese Maggi", "Coca Cola"], total: 85, type: "takeaway", status: "completed", placedAt: "11:05 AM", estimatedMins: 0 },
    { id: "#1037", customer: "Kavya T.", items: ["Masala Chai"], total: 20, type: "dine-in", status: "cancelled", placedAt: "10:55 AM", estimatedMins: 0 },
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pending: { label: "Pending", color: "text-zinc-400", bg: "bg-zinc-800", icon: <Clock className="h-3 w-3" /> },
    preparing: { label: "Preparing", color: "text-amber-400", bg: "bg-amber-500/15", icon: <ChefHat className="h-3 w-3" /> },
    ready: { label: "Ready", color: "text-green-400", bg: "bg-green-500/15", icon: <CheckCircle2 className="h-3 w-3" /> },
    completed: { label: "Completed", color: "text-zinc-500", bg: "bg-zinc-800/80", icon: <CheckCircle2 className="h-3 w-3" /> },
    cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-500/10", icon: <XCircle className="h-3 w-3" /> },
};

const STATUS_ORDER: OrderStatus[] = ["pending", "preparing", "ready", "completed", "cancelled"];

interface Props { compact?: boolean }

export function OrdersTable({ compact }: Props) {
    const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

    const filtered = orders.filter((o) => {
        const matchSearch =
            o.customer.toLowerCase().includes(search.toLowerCase()) ||
            o.id.includes(search);
        const matchStatus = statusFilter === "all" || o.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const displayed = compact ? filtered.slice(0, 5) : filtered;

    function updateStatus(id: string, status: OrderStatus) {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    }

    return (
        <div className="rounded-2xl border border-white/[0.07] bg-zinc-900/50 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-white/[0.05]">
                <div>
                    <p className="text-sm font-bold text-white">
                        {compact ? "Recent Orders" : "All Orders"}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">{filtered.length} orders</p>
                </div>

                {!compact && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 sm:w-48">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search orders…"
                                className="w-full h-8 pl-8 pr-3 rounded-lg text-xs
                  bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-zinc-600
                  focus:outline-none focus:border-amber-500/40 transition-all"
                            />
                        </div>

                        {/* Status filter */}
                        <div className="flex gap-1 p-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                            {(["all", ...STATUS_ORDER] as const).slice(0, 5).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-2.5 h-7 rounded-md text-[11px] font-semibold transition-all ${statusFilter === s
                                            ? "bg-amber-500 text-zinc-950"
                                            : "text-zinc-500 hover:text-zinc-300"
                                        }`}
                                >
                                    {s === "all" ? "All" : STATUS_CONFIG[s].label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/[0.04]">
                            {["Order", "Customer", "Items", "Total", "Type", "Status", "Time", "Action"].map((h) => (
                                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
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
                                    className={`border-b border-white/[0.03] transition-colors hover:bg-white/[0.02] ${i % 2 === 0 ? "" : "bg-white/[0.01]"
                                        }`}
                                >
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-bold text-amber-400 font-mono">{order.id}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-medium text-white">{order.customer}</span>
                                    </td>
                                    <td className="px-4 py-3 max-w-[160px]">
                                        <span className="text-xs text-zinc-400 line-clamp-1">{order.items.join(", ")}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-bold text-white tabular-nums">₹{order.total}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold ${order.type === "dine-in"
                                                ? "bg-blue-500/10 text-blue-400"
                                                : "bg-purple-500/10 text-purple-400"
                                            }`}>
                                            {order.type === "dine-in" ? "Dine In" : "Takeaway"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${sc.bg} ${sc.color}`}>
                                            {sc.icon}
                                            {sc.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-xs text-zinc-400">{order.placedAt}</p>
                                            {order.estimatedMins > 0 && (
                                                <p className="text-[10px] text-amber-400">~{order.estimatedMins} min left</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {order.status === "pending" && (
                                            <button
                                                onClick={() => updateStatus(order.id, "preparing")}
                                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                                            >
                                                Accept
                                            </button>
                                        )}
                                        {order.status === "preparing" && (
                                            <button
                                                onClick={() => updateStatus(order.id, "ready")}
                                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                                            >
                                                Mark Ready
                                            </button>
                                        )}
                                        {order.status === "ready" && (
                                            <button
                                                onClick={() => updateStatus(order.id, "completed")}
                                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
                                            >
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
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-zinc-500 text-sm">No orders found</p>
                </div>
            )}
        </div>
    );
}