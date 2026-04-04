"use client";

import { createContext, useContext, useState, useCallback } from "react";

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
    orderId: string;
    customer: string;
    items: string[];
    total: number;
    receivedAt: string;
    read: boolean;
    accepted: boolean;
}

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

// ── Context ───────────────────────────────────────────────────────────────────

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
    const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [alertOrder, setAlertOrder] = useState<IncomingOrder | null>(null);
    const [alertNotifId, setAlertNotifId] = useState<string | null>(null);

    const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
        setOrders((prev) =>
            prev.map((o) => o.id === orderId
                ? { ...o, status, estimatedMins: status !== "pending" ? 0 : o.estimatedMins }
                : o
            )
        );

        try {
            await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
        } catch {
            // optimistic update already applied
        }
    }, []);

    const acceptOrder = useCallback(async (notifId: string) => {
        const notif = notifications.find((n) => n.id === notifId);
        if (!notif) return;

        setNotifications((prev) =>
            prev.map((n) => n.id === notifId ? { ...n, accepted: true, read: true } : n)
        );

        await updateOrderStatus(notif.orderId, "preparing");

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

export function useOrders() {
    const ctx = useContext(OrdersContext);
    if (!ctx) throw new Error("useOrders must be used inside <OrdersProvider>");
    return ctx;
}