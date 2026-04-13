// This page is used to get the orders from the database
import { useState, useEffect, useCallback } from "react";
import { Order, OrderStatus } from "./userOrders";

export function useAdminOrders(pollInterval = 5000) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = useCallback(async (filter = "all") => {
    try {
      const url = filter !== "all"
        ? `/api/orders?status=${filter}`
        : `/api/orders`;

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      // Match your API response: { success: true, orders: [...] }
      const incoming: Order[] = data.orders ?? [];

      setOrders((prev) =>
        JSON.stringify(prev) !== JSON.stringify(incoming) ? incoming : prev
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");

      // Optimistic update — don't wait for next poll
      setOrders((prev) =>
        prev.map((o) => o._id === orderId ? { ...o, status } : o)
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(null);
    }
  }, []);

  const changeFilter = useCallback((filter: string) => {
    setStatusFilter(filter);
    setLoading(true);
    fetchOrders(filter);
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders(statusFilter);
    const id = setInterval(() => fetchOrders(statusFilter), pollInterval);
    return () => clearInterval(id);
  }, [fetchOrders, pollInterval, statusFilter]);

  return {
    orders, loading, updating,
    statusFilter, changeFilter,
    updateStatus, refetch: fetchOrders,
  };
}