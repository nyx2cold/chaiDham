"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    Bell, X, ChefHat, Clock, ShoppingBag, UtensilsCrossed,
    Bike, CheckCircle2, Volume2, VolumeX, Loader2,
} from "lucide-react";
import axios from "axios";

// ── Types ─────────────────────────────────────────────────────────────────────

interface IncomingOrder {
    _id: string;
    customerName: string;
    items: { name: string; qty: number; price: number }[];
    total: number;
    type: "dine-in" | "takeaway";
    status: string;
    createdAt: string;
}

interface Notification {
    id: string;
    order: IncomingOrder;
    receivedAt: string;
    read: boolean;
    accepted: boolean;
}

// ── Alarm (Web Audio API — no external file needed) ───────────────────────────

function playAlarm() {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const beep = (start: number, freq: number, dur: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = "sine";
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.35, start + 0.05);
            gain.gain.linearRampToValueAtTime(0, start + dur);
            osc.start(start);
            osc.stop(start + dur);
        };
        beep(ctx.currentTime + 0.00, 880, 0.18);
        beep(ctx.currentTime + 0.22, 1100, 0.18);
        beep(ctx.currentTime + 0.44, 1320, 0.28);
        beep(ctx.currentTime + 0.85, 880, 0.18);
        beep(ctx.currentTime + 1.07, 1100, 0.18);
        beep(ctx.currentTime + 1.29, 1320, 0.28);
    } catch { /* blocked by browser */ }
}

// ── Fullscreen new-order alert ────────────────────────────────────────────────

function NewOrderAlert({
    order, onAccept, onDismiss, loading,
}: {
    order: IncomingOrder;
    onAccept: () => void;
    onDismiss: () => void;
    loading: boolean;
}) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md">
            {/* Pulse rings */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-[480px] w-[480px] rounded-full bg-amber-500/8 animate-ping [animation-duration:1.6s]" />
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-[280px] w-[280px] rounded-full bg-amber-500/12 animate-ping [animation-duration:1.2s]" />
            </div>

            {/* Card */}
            <div className="relative w-full max-w-md mx-4 rounded-3xl overflow-hidden
                bg-gradient-to-b from-white/[0.10] to-white/[0.04] backdrop-blur-2xl
                border border-white/[0.15]
                shadow-[0_32px_80px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.15),0_0_0_1px_rgba(245,158,11,0.15)]">

                <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

                <div className="px-6 pt-6 pb-4 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full
                        bg-amber-500/20 border-2 border-amber-400/50
                        shadow-[0_0_40px_rgba(245,158,11,0.4)] animate-pulse">
                        <ShoppingBag className="h-9 w-9 text-amber-400" />
                    </div>
                    <p className="text-[11px] font-bold text-amber-400 uppercase tracking-[0.2em] mb-1">
                        New Order Received
                    </p>
                    <h2 className="text-2xl font-black text-white tracking-tight">{order.customerName}</h2>
                    <p className="text-xs text-zinc-500 mt-1">
                        {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                </div>

                <div className="mx-4 mb-4 rounded-2xl bg-white/[0.05] border border-white/[0.08]
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] divide-y divide-white/[0.05]">

                    <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-zinc-500 font-medium">Order type</span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                            text-[11px] font-bold border backdrop-blur-sm
                            ${order.type === "dine-in"
                                ? "bg-sky-500/15 text-sky-300 border-sky-400/30"
                                : "bg-violet-500/15 text-violet-300 border-violet-400/30"
                            }`}>
                            {order.type === "dine-in"
                                ? <><UtensilsCrossed className="h-3 w-3" />Dine In</>
                                : <><Bike className="h-3 w-3" />Takeaway</>}
                        </span>
                    </div>

                    <div className="px-4 py-3">
                        <p className="text-xs text-zinc-500 font-medium mb-2">Items ordered</p>
                        <div className="space-y-1">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="h-1 w-1 rounded-full bg-amber-500 flex-shrink-0" />
                                        <span className="text-xs text-zinc-200 font-medium">
                                            {item.name} × {item.qty}
                                        </span>
                                    </div>
                                    <span className="text-xs text-zinc-500">₹{item.price * item.qty}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-zinc-500 font-medium">Total</span>
                        <span className="text-lg font-black text-white [text-shadow:0_0_20px_rgba(245,158,11,0.4)]">
                            ₹{order.total}
                        </span>
                    </div>
                </div>

                <div className="flex gap-3 px-4 pb-6">
                    <button
                        onClick={onDismiss}
                        disabled={loading}
                        className="flex-1 py-3 rounded-2xl text-sm font-bold
                            bg-white/[0.06] text-zinc-400 border border-white/[0.08]
                            hover:bg-white/[0.10] hover:text-zinc-200 backdrop-blur-sm
                            disabled:opacity-40 transition-all duration-150 active:scale-95"
                    >
                        Dismiss
                    </button>
                    <button
                        onClick={onAccept}
                        disabled={loading}
                        className="flex-[2] py-3 rounded-2xl text-sm font-black
                            bg-amber-500 text-zinc-950
                            shadow-[0_4px_24px_rgba(245,158,11,0.5)]
                            hover:bg-amber-400 hover:shadow-[0_4px_32px_rgba(245,158,11,0.7)]
                            disabled:opacity-60 transition-all duration-150 active:scale-95"
                    >
                        {loading
                            ? <span className="flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />Accepting…
                            </span>
                            : <span className="flex items-center justify-center gap-2">
                                <ChefHat className="h-4 w-4" />Accept & Start Cooking
                            </span>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Notification drawer ───────────────────────────────────────────────────────

function NotificationDrawer({
    notifications, onClose, onAccept,
}: {
    notifications: Notification[];
    onClose: () => void;
    onAccept: (notifId: string, orderId: string) => void;
}) {
    const unread = notifications.filter((n) => !n.read).length;

    return (
        <>
            <div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="fixed right-0 top-0 bottom-0 z-[90] w-full max-w-sm flex flex-col
                bg-gradient-to-b from-white/[0.08] to-white/[0.04] backdrop-blur-2xl
                border-l border-white/[0.10]
                shadow-[-16px_0_48px_rgba(0,0,0,0.5),inset_1px_0_0_rgba(255,255,255,0.08)]">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4
                    border-b border-white/[0.06] bg-gradient-to-r from-white/[0.04] to-transparent">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl
                            bg-amber-500/15 border border-amber-500/25">
                            <Bell className="h-4 w-4 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Notifications</p>
                            {unread > 0 && (
                                <p className="text-[10px] text-amber-400 font-semibold">{unread} new</p>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-xl
                            text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto py-3 px-3 space-y-2 scrollbar-none">
                    {notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                            <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/[0.08]
                                flex items-center justify-center">
                                <Bell className="h-5 w-5 text-zinc-700" />
                            </div>
                            <p className="text-sm font-medium text-zinc-600">No notifications yet</p>
                            <p className="text-xs text-zinc-700">New orders will appear here</p>
                        </div>
                    )}

                    {notifications.map((n) => (
                        <div key={n.id} className={`relative rounded-2xl p-4 border backdrop-blur-sm transition-all duration-200
                            ${!n.read
                                ? "bg-amber-500/[0.07] border-amber-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                                : "bg-white/[0.03] border-white/[0.06]"
                            }`}>

                            {!n.read && (
                                <span className="absolute top-3.5 right-3.5 h-2 w-2 rounded-full bg-amber-400
                                    shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                            )}

                            <div className="flex items-start gap-3 mb-3">
                                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border
                                    ${n.accepted ? "bg-emerald-500/15 border-emerald-400/30" : "bg-amber-500/15 border-amber-400/30"}`}>
                                    {n.accepted
                                        ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        : <ShoppingBag className="h-4 w-4 text-amber-400" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white truncate">{n.order.customerName}</p>
                                    <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">
                                        {n.order.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-3 w-3 text-zinc-600" />
                                    <span className="text-[10px] text-zinc-500">{n.receivedAt}</span>
                                </div>
                                <span className="text-xs font-black text-white [text-shadow:0_0_12px_rgba(245,158,11,0.3)]">
                                    ₹{n.order.total}
                                </span>
                            </div>

                            {n.accepted ? (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                                    bg-emerald-500/10 border border-emerald-400/20">
                                    <ChefHat className="h-3 w-3 text-emerald-400" />
                                    <span className="text-[11px] font-bold text-emerald-400">Cooking started</span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => onAccept(n.id, n.order._id)}
                                    className="w-full py-2 rounded-xl text-[11px] font-black
                                        bg-amber-500 text-zinc-950
                                        shadow-[0_2px_12px_rgba(245,158,11,0.4)]
                                        hover:bg-amber-400 hover:shadow-[0_2px_20px_rgba(245,158,11,0.6)]
                                        active:scale-95 transition-all duration-150"
                                >
                                    Accept Order
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="px-4 py-3 border-t border-white/[0.06]">
                    <p className="text-center text-[10px] text-zinc-700 font-medium">
                        Polls every 5s · {notifications.length} total
                    </p>
                </div>
            </div>
        </>
    );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function OrderNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [alertOrder, setAlertOrder] = useState<IncomingOrder | null>(null);
    const [alertNotifId, setAlertNotifId] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [muted, setMuted] = useState(false);
    const [accepting, setAccepting] = useState(false);
    const seenIds = useRef<Set<string>>(new Set());

    const hasUnread = notifications.some((n) => !n.read);
    const unreadCount = notifications.filter((n) => !n.read).length;

    // ── Poll every 5 seconds for new pending orders ──
    useEffect(() => {
        async function poll() {
            try {
                const res = await axios.get("/api/orders?status=pending");
                const orders: IncomingOrder[] = res.data.orders ?? [];

                orders.forEach((order) => {
                    if (seenIds.current.has(order._id)) return;
                    seenIds.current.add(order._id);

                    const notifId = `notif-${order._id}`;
                    const receivedAt = new Date().toLocaleTimeString("en-IN", {
                        hour: "2-digit", minute: "2-digit",
                    });

                    setNotifications((prev) => [
                        { id: notifId, order, receivedAt, read: false, accepted: false },
                        ...prev,
                    ]);

                    // Show alert only if none is already visible
                    setAlertOrder((prev) => prev ?? order);
                    setAlertNotifId((prev) => prev ?? notifId);

                    if (!muted) playAlarm();
                });
            } catch { /* ignore */ }
        }

        poll();
        const id = setInterval(poll, 5000);
        return () => clearInterval(id);
    }, [muted]);

    const acceptOrder = useCallback(async (notifId: string, orderId: string) => {
        setAccepting(true);
        try {
            await axios.patch(`/api/orders/${orderId}`, { status: "preparing" });
            seenIds.current.add(orderId); // prevent re-alerting
            setNotifications((prev) =>
                prev.map((n) => n.id === notifId ? { ...n, accepted: true, read: true } : n)
            );
            setAlertOrder(null);
            setAlertNotifId(null);
        } catch { /* keep open on error */ }
        finally { setAccepting(false); }
    }, []);

    const dismissAlert = useCallback(() => {
        setAlertOrder(null);
        setAlertNotifId(null);
    }, []);

    const openDrawer = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setDrawerOpen(true);
    };

    return (
        <>
            <div className="flex items-center gap-1.5">
                {/* Mute toggle */}
                <button
                    onClick={() => setMuted((m) => !m)}
                    title={muted ? "Unmute" : "Mute alerts"}
                    className="flex h-8 w-8 items-center justify-center rounded-lg
                        border border-white/[0.08] bg-white/[0.03]
                        text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.07]
                        transition-all duration-150"
                >
                    {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                </button>

                {/* Bell */}
                <button
                    onClick={openDrawer}
                    className="relative flex h-8 w-8 items-center justify-center rounded-lg
                        border border-white/[0.08] bg-white/[0.03]
                        text-zinc-400 hover:text-white hover:bg-white/[0.07]
                        transition-all duration-150
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
                >
                    <Bell className={`h-4 w-4 ${hasUnread ? "[animation:wiggle_0.5s_ease-in-out_2]" : ""}`} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1
                            flex h-4 w-4 items-center justify-center
                            rounded-full bg-amber-500 text-[9px] font-black text-zinc-950
                            shadow-[0_0_8px_rgba(245,158,11,0.7)]">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </button>
            </div>

            {alertOrder && alertNotifId && (
                <NewOrderAlert
                    order={alertOrder}
                    loading={accepting}
                    onAccept={() => acceptOrder(alertNotifId, alertOrder._id)}
                    onDismiss={dismissAlert}
                />
            )}

            {drawerOpen && (
                <NotificationDrawer
                    notifications={notifications}
                    onClose={() => setDrawerOpen(false)}
                    onAccept={acceptOrder}
                />
            )}

            <style>{`
                @keyframes wiggle {
                    0%,100%{transform:rotate(0deg)}
                    20%{transform:rotate(-15deg)}
                    40%{transform:rotate(15deg)}
                    60%{transform:rotate(-10deg)}
                    80%{transform:rotate(10deg)}
                }
            `}</style>
        </>
    );
}