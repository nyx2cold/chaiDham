// context/OrdersContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";

// ── Types ─────────────────────────────────────────────────────────────────────

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

export interface Notification {
    id: string;
    orderId: string;        // links back to the Order
    customer: string;
    items: string[];
    total: number;
    receivedAt: string;
    read: boolean;
    accepted: boolean;
}

// ── Incoming socket shape ─────────────────────────────────────────────────────

export interface IncomingOrder {
    id: string;
    customer: string;
    items: { name: string; qty: number }[] | string[];
    total: number;
    type: "dine-in" | "takeaway";
    placedAt: string;
    estimatedMins?: number;
}

// ── Context shape ─────────────────────────────────────────────────────────────

interface OrdersContextValue {
    orders: Order[];
    notifications: Notification[];
    alertOrder: IncomingOrder | null;
    alertNotifId: string | null;

    updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
    acceptOrder: (notifId: string) => Promise<void>;
    dismissAlert: () => void;
    markAllRead: () => void;
}

// ── Mock seed data ────────────────────────────────────────────────────────────

const MOCK_ORDERS: Order[] = [
    { id: "#1042", customer: "Rahul S.", items: ["Masala Chai x2", "Samosa x3"], total: 115, type: "dine-in", status: "preparing", placedAt: "11:24 AM", estimatedMins: 6 },
    { id: "#1041", customer: "Priya M.", items: ["Classic Maggi", "Lemon Soda"], total: 70, type: "takeaway", status: "ready", placedAt: "11:20 AM", estimatedMins: 0 },
    { id: "#1040", customer: "Amit K.", items: ["Special Thali"], total: 120, type: "dine-in", status: "completed", placedAt: "11:10 AM", estimatedMins: 0 },
    { id: "#1039", customer: "Sneha R.", items: ["Adrak Chai x2", "Bread Pakora"], total: 80, type: "dine-in", status: "pending", placedAt: "11:28 AM", estimatedMins: 10 },
    { id: "#1038", customer: "Dev P.", items: ["Cheese Maggi", "Coca Cola"], total: 85, type: "takeaway", status: "completed", placedAt: "11:05 AM", estimatedMins: 0 },
    { id: "#1037", customer: "Kavya T.", items: ["Masala Chai"], total: 20, type: "dine-in", status: "cancelled", placedAt: "10:55 AM", estimatedMins: 0 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function flattenItems(items: IncomingOrder["items"]): string[] {
    return items.map((i) => (typeof i === "string" ? i : `${i.name} x${i.qty}`));
}

function playAlarm() {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const beep = (t: number, freq: number, dur: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = "sine";
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.4, t + 0.05);
            gain.gain.linearRampToValueAtTime(0, t + dur);
            osc.start(t);
            osc.stop(t + dur);
        };
        beep(ctx.currentTime + 0.00, 880, 0.18);
        beep(ctx.currentTime + 0.22, 1100, 0.18);
        beep(ctx.currentTime + 0.44, 1320, 0.28);
        beep(ctx.currentTime + 0.85, 880, 0.18);
        beep(ctx.currentTime + 1.07, 1100, 0.18);
        beep(ctx.currentTime + 1.29, 1320, 0.28);
    } catch { /* silently ignore */ }
}

// ── Context ───────────────────────────────────────────────────────────────────

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({
    children,
    muted = false,
}: {
    children: React.ReactNode;
    muted?: boolean;
}) {
    const socket = useSocket();
    const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [alertOrder, setAlertOrder] = useState<IncomingOrder | null>(null);
    const [alertNotifId, setAlertNotifId] = useState<string | null>(null);

    // ── Socket: new order arrives ─────────────────────────────────────────────
    useEffect(() => {
        socket.emit("join:admin");

        socket.on("new:order", (incoming: IncomingOrder) => {
            const notifId = `notif-${Date.now()}`;
            const flatItems = flattenItems(incoming.items);

            // 1. Add to orders table
            const newOrder: Order = {
                id: incoming.id,
                customer: incoming.customer,
                items: flatItems,
                total: incoming.total,
                type: incoming.type,
                placedAt: incoming.placedAt,
                estimatedMins: incoming.estimatedMins ?? 10,
                status: "pending",
            };
            setOrders((prev) => [newOrder, ...prev]);

            // 2. Add notification
            setNotifications((prev) => [
                {
                    id: notifId,
                    orderId: incoming.id,
                    customer: incoming.customer,
                    items: flatItems,
                    total: incoming.total,
                    receivedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
                    read: false,
                    accepted: false,
                },
                ...prev,
            ]);

            // 3. Show fullscreen alert
            setAlertOrder(incoming);
            setAlertNotifId(notifId);

            // 4. Play alarm
            if (!muted) playAlarm();
        });

        // Sync status updates from other admin sessions
        socket.on("order:status", ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
            setOrders((prev) =>
                prev.map((o) => o.id === orderId ? { ...o, status, estimatedMins: status !== "pending" ? 0 : o.estimatedMins } : o)
            );
        });

        return () => {
            socket.off("new:order");
            socket.off("order:status");
        };
    }, [socket, muted]);

    // ── Update order status (table action buttons + accept from notification) ──
    const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
        // Optimistic update
        setOrders((prev) =>
            prev.map((o) => o.id === orderId ? { ...o, status, estimatedMins: status !== "pending" ? 0 : o.estimatedMins } : o)
        );

        try {
            await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
        } catch { /* optimistic update already applied */ }
    }, []);

    // ── Accept from notification (sets status → preparing + marks notif) ──────
    const acceptOrder = useCallback(async (notifId: string) => {
        const notif = notifications.find((n) => n.id === notifId);
        if (!notif) return;

        // Update notification state
        setNotifications((prev) =>
            prev.map((n) => n.id === notifId ? { ...n, accepted: true, read: true } : n)
        );

        // Update order status in the table
        await updateOrderStatus(notif.orderId, "preparing");

        // Dismiss the fullscreen alert if it matches
        setAlertOrder(null);
        setAlertNotifId(null);
    }, [notifications, updateOrderStatus]);

    const dismissAlert = useCallback(() => {
        setAlertOrder(null);
        setAlertNotifId(null);
    }, []);

    const markAllRead = useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }, []);

    return (
        <OrdersContext.Provider value={{
            orders,
            notifications,
            alertOrder,
            alertNotifId,
            updateOrderStatus,
            acceptOrder,
            dismissAlert,
            markAllRead,
        }}>
            {children}
        </OrdersContext.Provider>
    );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useOrders() {
    const ctx = useContext(OrdersContext);
    if (!ctx) throw new Error("useOrders must be used inside <OrdersProvider>");
    return ctx;
}