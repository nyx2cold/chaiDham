// components/admin/orders-table.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Clock, CheckCircle2, ChefHat, XCircle, Search, Sparkles,
    X, UtensilsCrossed, Loader2, RefreshCw, ChevronLeft, ChevronRight,
} from "lucide-react";

export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";

export interface Order {
    _id: string;
    orderNumber: number;
    customer: { name: string; email: string };
    items: { name: string; quantity: number; price: number; orderDetails?: string }[];
    total: number;
    type: "dine-in" | "takeaway";
    status: OrderStatus;
    createdAt: string;
}

const STATUS_CONFIG: Record<OrderStatus, {
    label: string;
    textColor: string;
    borderColor: string;
    bgGlass: string;
    icon: React.ReactNode;
}> = {
    pending: {
        label: "Pending",
        textColor: "text-zinc-300",
        borderColor: "border-zinc-500/30",
        bgGlass: "bg-zinc-500/10",
        icon: <Clock className="h-3 w-3" />,
    },
    preparing: {
        label: "Preparing",
        textColor: "text-amber-300",
        borderColor: "border-amber-400/40",
        bgGlass: "bg-amber-500/10",
        icon: <ChefHat className="h-3 w-3" />,
    },
    ready: {
        label: "Ready",
        textColor: "text-emerald-300",
        borderColor: "border-emerald-400/40",
        bgGlass: "bg-emerald-500/10",
        icon: <CheckCircle2 className="h-3 w-3" />,
    },
    completed: {
        label: "Completed",
        textColor: "text-zinc-500",
        borderColor: "border-zinc-700/40",
        bgGlass: "bg-zinc-700/10",
        icon: <CheckCircle2 className="h-3 w-3" />,
    },
    cancelled: {
        label: "Cancelled",
        textColor: "text-red-400",
        borderColor: "border-red-500/30",
        bgGlass: "bg-red-500/10",
        icon: <XCircle className="h-3 w-3" />,
    },
};

const STATUS_ORDER: OrderStatus[] = ["pending", "preparing", "ready", "completed", "cancelled"];
const PAGE_SIZE_OPTIONS = [10, 15, 20, 50];

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

interface Props { compact?: boolean; }

export function OrdersTable({ compact }: Props) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchOrders = useCallback(async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const res = await fetch("/api/orders");
            const data = await res.json();
            if (data.success) {
                setOrders((prev) => {
                    const prevIds = new Set(prev.map((o) => o._id));
                    const incoming: Order[] = data.orders;
                    const brandNew = incoming
                        .filter((o) => !prevIds.has(o._id) && o.status === "pending")
                        .map((o) => o._id);
                    if (brandNew.length > 0) {
                        setNewOrderIds((s) => new Set([...s, ...brandNew]));
                        setTimeout(() => {
                            setNewOrderIds((s) => {
                                const next = new Set(s);
                                brandNew.forEach((id) => next.delete(id));
                                return next;
                            });
                        }, 6000);
                    }
                    return incoming;
                });
            }
        } catch {
            // silently fail on background polls
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        const id = setInterval(() => fetchOrders(true), 5000);
        return () => clearInterval(id);
    }, [fetchOrders]);

    // Reset to page 1 when filters/page size change
    useEffect(() => { setCurrentPage(1); }, [search, statusFilter, pageSize]);

    async function updateStatus(orderId: string, status: OrderStatus) {
        setUpdatingId(orderId);
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (data.success) {
                setOrders((prev) =>
                    prev.map((o) => (o._id === orderId ? { ...o, status } : o))
                );
                if (selectedOrder?._id === orderId) {
                    setSelectedOrder((o) => o ? { ...o, status } : o);
                }
            }
        } catch {
            alert("Failed to update order status.");
        } finally {
            setUpdatingId(null);
        }
    }

    function openDrawer(order: Order) {
        setSelectedOrder(order);
        setDrawerOpen(true);
    }

    const filtered = orders.filter((o) => {
        const matchSearch =
            o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
            String(o.orderNumber).includes(search);
        const matchStatus = statusFilter === "all" || o.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paginated = compact
        ? filtered.slice(0, 5)
        : filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

    return (
        <>
            {/* ── Table ── */}
            <div className="relative rounded-2xl overflow-hidden">
                <div className="absolute inset-0 rounded-2xl
                    bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.05]
                    backdrop-blur-2xl border border-white/[0.10]
                    shadow-[0_8px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.10)]" />
                <div className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-amber-600/[0.08] blur-3xl" />

                <div className="relative">
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3
                        px-5 py-4 border-b border-white/[0.06] bg-gradient-to-r from-white/[0.04] to-transparent">
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-white tracking-tight">
                                    {compact ? "Recent Orders" : "All Orders"}
                                </p>
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md
                                    text-[10px] font-bold text-amber-300
                                    bg-amber-500/15 border border-amber-400/25">
                                    <Sparkles className="h-2.5 w-2.5" />
                                    {filtered.length}
                                </span>
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full
                                    bg-green-500/10 border border-green-500/20
                                    text-[10px] font-medium text-green-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                                    Live
                                </span>
                            </div>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                                Polling every 5s · {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                        </div>

                        {!compact && (
                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => fetchOrders()}
                                    className="flex h-8 w-8 items-center justify-center rounded-xl
                                        bg-white/[0.05] border border-white/[0.08]
                                        text-zinc-400 hover:text-white hover:bg-white/[0.09] transition-colors"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                </button>

                                <div className="relative flex-1 sm:w-52">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search orders…"
                                        className="w-full h-8 pl-8 pr-3 rounded-xl text-xs text-white
                                            placeholder:text-zinc-600
                                            bg-white/[0.06] border border-white/[0.10]
                                            focus:outline-none focus:border-amber-400/50 focus:bg-white/[0.09]
                                            transition-all duration-200"
                                    />
                                </div>

                                {/* Page size selector */}
                                <div className="flex items-center gap-1.5 px-2 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                                    <span className="text-[10px] text-zinc-500 font-semibold">Show</span>
                                    <div className="flex gap-0.5">
                                        {PAGE_SIZE_OPTIONS.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setPageSize(size)}
                                                className={`px-2 h-6 rounded-lg text-[10px] font-bold transition-all duration-200
                                                    ${pageSize === size
                                                        ? "bg-amber-500 text-zinc-950 shadow-[0_2px_8px_rgba(245,158,11,0.35)]"
                                                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]"
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-0.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                                    {(["all", ...STATUS_ORDER] as const).map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setStatusFilter(s)}
                                            className={`px-2.5 h-6 rounded-lg text-[10px] font-bold transition-all duration-200
                                                ${statusFilter === s
                                                    ? "bg-amber-500 text-zinc-950 shadow-[0_2px_12px_rgba(245,158,11,0.4)]"
                                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]"
                                                }`}
                                        >
                                            {s === "all" ? "All" : STATUS_CONFIG[s].label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Loading */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20 gap-2 text-zinc-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Loading orders…</span>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/[0.05]">
                                            {["Order", "Customer", "Items", "Total", "Type", "Status", "Time", "Action"].map((h) => (
                                                <th key={h} className="px-4 py-3 text-left
                                                    text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginated.map((order, i) => {
                                            const sc = STATUS_CONFIG[order.status];
                                            const isNew = newOrderIds.has(order._id);
                                            const isUpdating = updatingId === order._id;
                                            return (
                                                <tr
                                                    key={order._id}
                                                    onClick={() => openDrawer(order)}
                                                    className={`border-b border-white/[0.03] transition-all duration-300
                                                        hover:bg-white/[0.04] cursor-pointer group
                                                        ${i % 2 !== 0 ? "bg-white/[0.015]" : ""}
                                                        ${isNew ? "bg-amber-500/[0.06] border-l-2 border-l-amber-500/60" : ""}
                                                    `}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs font-black text-amber-400 font-mono group-hover:text-amber-300 transition-colors">
                                                                #{order.orderNumber}
                                                            </span>
                                                            {isNew && (
                                                                <span className="px-1 py-0.5 rounded text-[9px] font-bold
                                                                    bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                                    NEW
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-xs font-semibold text-zinc-200">
                                                            {order.customer.name}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 max-w-[160px]">
                                                        <span className="text-xs text-zinc-500 line-clamp-1">
                                                            {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                                                        </span>
                                                        {order.items.some((i) => i.orderDetails) && (
                                                            <span className="flex items-center gap-1 mt-0.5 text-[10px] text-amber-400/70 font-medium">
                                                                <span>📝</span> has notes
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-xs font-black tabular-nums text-white">
                                                            ₹{order.total}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex px-2 py-0.5 rounded-lg
                                                            text-[10px] font-bold border
                                                            ${order.type === "dine-in"
                                                                ? "bg-sky-500/10 text-sky-300 border-sky-400/25"
                                                                : "bg-violet-500/10 text-violet-300 border-violet-400/25"
                                                            }`}>
                                                            {order.type === "dine-in" ? "Dine In" : "Takeaway"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                                                            text-[10px] font-bold border
                                                            ${sc.bgGlass} ${sc.textColor} ${sc.borderColor}`}>
                                                            {sc.icon}
                                                            {sc.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-xs text-zinc-400 tabular-nums">
                                                            {formatTime(order.createdAt)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                        {isUpdating ? (
                                                            <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                                                        ) : (
                                                            <>
                                                                {order.status === "pending" && (
                                                                    <button
                                                                        onClick={() => updateStatus(order._id, "preparing")}
                                                                        className="px-3 py-1 rounded-lg text-[11px] font-bold
                                                                            bg-amber-500/15 text-amber-300 border border-amber-400/30
                                                                            hover:bg-amber-500/25 active:scale-95 transition-all duration-150"
                                                                    >
                                                                        Accept
                                                                    </button>
                                                                )}
                                                                {order.status === "preparing" && (
                                                                    <button
                                                                        onClick={() => updateStatus(order._id, "ready")}
                                                                        className="px-3 py-1 rounded-lg text-[11px] font-bold
                                                                            bg-emerald-500/15 text-emerald-300 border border-emerald-400/30
                                                                            hover:bg-emerald-500/25 active:scale-95 transition-all duration-150"
                                                                    >
                                                                        Mark Ready
                                                                    </button>
                                                                )}
                                                                {order.status === "ready" && (
                                                                    <button
                                                                        onClick={() => updateStatus(order._id, "completed")}
                                                                        className="px-3 py-1 rounded-lg text-[11px] font-bold
                                                                            bg-white/[0.07] text-zinc-300 border border-white/[0.12]
                                                                            hover:bg-white/[0.12] active:scale-95 transition-all duration-150"
                                                                    >
                                                                        Complete
                                                                    </button>
                                                                )}
                                                                {(order.status === "completed" || order.status === "cancelled") && (
                                                                    <span className="text-xs text-zinc-700">—</span>
                                                                )}
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {paginated.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="h-12 w-12 rounded-2xl mb-3 bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                                        <Search className="h-5 w-5 text-zinc-600" />
                                    </div>
                                    <p className="text-zinc-500 text-sm font-medium">No orders found</p>
                                    <p className="text-zinc-700 text-xs mt-1">Try adjusting your filters</p>
                                </div>
                            ) : (
                                /* ── Pagination footer ── */
                                !compact && totalPages > 1 && (
                                    <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.05] bg-white/[0.01]">
                                        <p className="text-[11px] text-zinc-500">
                                            Showing <span className="text-zinc-300 font-semibold">{(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)}</span> of <span className="text-zinc-300 font-semibold">{filtered.length}</span> orders
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                disabled={safePage === 1}
                                                className="flex h-7 w-7 items-center justify-center rounded-lg
                                                    bg-white/[0.05] border border-white/[0.08]
                                                    text-zinc-400 hover:text-white hover:bg-white/[0.09]
                                                    disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            >
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
                                                        <button
                                                            key={p}
                                                            onClick={() => setCurrentPage(p as number)}
                                                            className={`h-7 min-w-[28px] px-2 rounded-lg text-[11px] font-bold transition-all duration-200
                                                                ${safePage === p
                                                                    ? "bg-amber-500 text-zinc-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                                                                    : "bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.09]"
                                                                }`}
                                                        >
                                                            {p}
                                                        </button>
                                                    )
                                                )}

                                            <button
                                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                                disabled={safePage === totalPages}
                                                className="flex h-7 w-7 items-center justify-center rounded-lg
                                                    bg-white/[0.05] border border-white/[0.08]
                                                    text-zinc-400 hover:text-white hover:bg-white/[0.09]
                                                    disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            >
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ── Order Detail Drawer ── */}
            <div
                onClick={() => setDrawerOpen(false)}
                className={`fixed inset-0 z-50 transition-all duration-300
                    ${drawerOpen ? "opacity-100 pointer-events-auto bg-black/50 backdrop-blur-sm" : "opacity-0 pointer-events-none"}`}
            />

            <aside className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col
                transition-transform duration-300 ease-in-out
                ${drawerOpen ? "translate-x-0" : "translate-x-full"}
                bg-zinc-950/80 backdrop-blur-2xl
                border-l border-white/[0.07]
                shadow-[-8px_0_32px_rgba(0,0,0,0.4)]`}
            >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <div className="pointer-events-none absolute -top-10 right-0 h-32 w-32 rounded-full bg-amber-500/[0.07] blur-3xl" />

                {selectedOrder && (
                    <>
                        {/* Drawer header */}
                        <div className="flex items-center justify-between px-5 py-4
                            border-b border-white/[0.06] bg-white/[0.02] shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl
                                    bg-amber-500/15 border border-amber-500/25">
                                    <UtensilsCrossed className="h-4 w-4 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">
                                        Order #{selectedOrder.orderNumber}
                                    </p>
                                    <p className="text-[11px] text-zinc-500">
                                        {formatTime(selectedOrder.createdAt)} · {selectedOrder.type === "dine-in" ? "Dine In" : "Takeaway"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDrawerOpen(false)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg
                                    border border-white/[0.08] bg-white/[0.04]
                                    text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Scrollable body */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

                            <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] px-4 py-3 space-y-1">
                                <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">Customer</p>
                                <p className="text-sm font-semibold text-white">{selectedOrder.customer.name}</p>
                                <p className="text-xs text-zinc-500">{selectedOrder.customer.email}</p>
                            </div>

                            <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] px-4 py-3">
                                <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-2">Status</p>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                    text-xs font-bold border
                                    ${STATUS_CONFIG[selectedOrder.status].bgGlass}
                                    ${STATUS_CONFIG[selectedOrder.status].textColor}
                                    ${STATUS_CONFIG[selectedOrder.status].borderColor}`}>
                                    {STATUS_CONFIG[selectedOrder.status].icon}
                                    {STATUS_CONFIG[selectedOrder.status].label}
                                </span>
                            </div>

                            <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] overflow-hidden">
                                <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold px-4 pt-3 pb-2">
                                    Items Ordered
                                </p>
                                <div className="divide-y divide-white/[0.05]">
                                    {selectedOrder.items.map((item, i) => (
                                        <div key={i} className="px-4 py-2.5">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-white font-medium">
                                                        {item.name}
                                                        <span className="text-zinc-500 font-normal ml-1">×{item.quantity}</span>
                                                    </p>
                                                </div>
                                                <span className="text-xs font-semibold text-amber-400 shrink-0">
                                                    ₹{item.price * item.quantity}
                                                </span>
                                            </div>
                                            {item.orderDetails && (
                                                <div className="flex items-start gap-1.5 mt-1.5 px-2.5 py-1.5 rounded-lg
                    bg-amber-500/[0.07] border border-amber-500/[0.15]">
                                                    <span className="text-[11px] text-amber-400/80 shrink-0 mt-px">📝</span>
                                                    <p className="text-[11px] text-amber-300/80 italic leading-snug">
                                                        {item.orderDetails}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between px-4 py-3 border-t border-white/[0.06] bg-white/[0.02]">
                                    <span className="text-sm font-bold text-white">Total</span>
                                    <span className="text-sm font-black text-amber-400">₹{selectedOrder.total}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action footer */}
                        <div className="px-4 pt-3 pb-5 border-t border-white/[0.06] bg-white/[0.015] shrink-0 space-y-2">
                            {updatingId === selectedOrder._id ? (
                                <div className="flex items-center justify-center py-3 gap-2 text-zinc-400">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm">Updating…</span>
                                </div>
                            ) : (
                                <>
                                    {selectedOrder.status === "pending" && (
                                        <>
                                            <button
                                                onClick={() => updateStatus(selectedOrder._id, "preparing")}
                                                className="w-full py-3 rounded-xl font-bold text-sm text-zinc-950
                                                    bg-amber-500 hover:bg-amber-400
                                                    shadow-[0_0_14px_rgba(245,158,11,0.25)]
                                                    active:scale-[0.99] transition-all duration-150"
                                            >
                                                ✅ Accept Order
                                            </button>
                                            <button
                                                onClick={() => updateStatus(selectedOrder._id, "cancelled")}
                                                className="w-full py-2.5 rounded-xl font-semibold text-sm
                                                    text-red-400 border border-red-500/25 bg-red-500/[0.07]
                                                    hover:bg-red-500/[0.14] active:scale-[0.99] transition-all duration-150"
                                            >
                                                ✕ Reject Order
                                            </button>
                                        </>
                                    )}
                                    {selectedOrder.status === "preparing" && (
                                        <button
                                            onClick={() => updateStatus(selectedOrder._id, "ready")}
                                            className="w-full py-3 rounded-xl font-bold text-sm
                                                text-emerald-950 bg-emerald-400 hover:bg-emerald-300
                                                shadow-[0_0_14px_rgba(52,211,153,0.2)]
                                                active:scale-[0.99] transition-all duration-150"
                                        >
                                            🍵 Mark as Ready
                                        </button>
                                    )}
                                    {selectedOrder.status === "ready" && (
                                        <button
                                            onClick={() => updateStatus(selectedOrder._id, "completed")}
                                            className="w-full py-3 rounded-xl font-bold text-sm
                                                text-white bg-white/[0.08] border border-white/[0.12]
                                                hover:bg-white/[0.14] active:scale-[0.99] transition-all duration-150"
                                        >
                                            ✓ Mark as Completed
                                        </button>
                                    )}
                                    {(selectedOrder.status === "completed" || selectedOrder.status === "cancelled") && (
                                        <p className="text-center text-xs text-zinc-600 py-2">
                                            This order is {selectedOrder.status}.
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </aside>
        </>
    );
}