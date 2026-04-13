"use client";

import { useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import axios from "axios";
import { useCart } from "@/context/cartContext";
import { OrderStatusTracker } from "@/components/menu/OrderStatusTracker";

interface Props {
    orderType: "dine-in" | "takeaway";
}

export function CheckoutButton({ orderType }: Props) {
    const { cartItems, cartTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleCheckout() {
        if (cartItems.length === 0) return;
        setLoading(true);
        setError(null);

        try {
            const res = await axios.post("/api/orders", {
                items: cartItems.map((item) => ({
                    name: item.name,
                    qty: item.quantity,
                    price: item.price,
                })),
                total: cartTotal,
                type: orderType,
            });

            setOrderId(res.data.orderId);
            clearCart(); // empty cart after successful order
        } catch (err: any) {
            setError(
                err?.response?.data?.error ?? "Failed to place order. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    // ── After order placed — show tracker instead of button ──
    if (orderId) {
        return (
            <div className="mt-4">
                <OrderStatusTracker
                    orderId={orderId}
                    initialStatus="pending"
                    onDismiss={() => setOrderId(null)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {error && (
                <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-400 font-medium">{error}</p>
                </div>
            )}

            <button
                onClick={handleCheckout}
                disabled={loading || cartItems.length === 0}
                className="
                    w-full py-3.5 rounded-2xl text-sm font-black
                    bg-amber-500 text-zinc-950
                    shadow-[0_4px_20px_rgba(245,158,11,0.4)]
                    hover:bg-amber-400 hover:shadow-[0_4px_28px_rgba(245,158,11,0.6)]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    active:scale-[0.98] transition-all duration-150
                "
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Placing Order…
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        Proceed to Checkout · ₹{cartTotal}
                    </span>
                )}
            </button>
        </div>
    );
}