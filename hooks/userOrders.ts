import { useState, useEffect, useCallback } from "react";

export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";

export interface OrderItem {
  menuItemId:    string;
  name:          string;
  price:         number;
  quantity:      number;
  orderDetails?: string;
}

export interface Order {
  _id:           string;
  orderNumber:   number;
  customer: {
    userId: string;
    name:   string;
    email:  string;
  };
  items:         OrderItem[];
  total:         number;
  type:          "dine-in" | "takeaway";
  status:        OrderStatus;
  createdAt:     string;
  updatedAt:     string;
}

export function useOrders(pollInterval = 8000) {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders/my", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      // Match your API response: { success: true, orders: [...] }
      const incoming: Order[] = data.orders ?? [];

      setOrders((prev) =>
        JSON.stringify(prev) !== JSON.stringify(incoming) ? incoming : prev
      );
      setError(null);
    } catch {
      setError("Could not load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, pollInterval);
    return () => clearInterval(id);
  }, [fetchOrders, pollInterval]);

  return { orders, loading, error, refetch: fetchOrders };
}