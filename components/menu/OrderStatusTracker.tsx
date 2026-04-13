"use client";

import { useEffect, useState } from "react";
import { ChefHat, Clock, CheckCircle2, PackageCheck, Loader2, X } from "lucide-react";
import axios from "axios";

type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";

interface Props {
    orderId: string;
    initialStatus?: OrderStatus;
    onDismiss?: () => void;
}

const STEPS: {
    status: OrderStatus;
    label: string;
    sub: string;
    icon: React.ReactNode;
}[] = [
        { status: "pending", label: "Order Placed", sub: "Waiting for kitchen to accept", icon: <Clock className="h-5 w-5" /> },
        { status: "preparing", label: "Cooking Started", sub: "Your food is being prepared", icon: <ChefHat className="h-5 w-5" /> },
        { status: "ready", label: "Ready to Collect", sub: "Come pick up your order!", icon: <PackageCheck className="h-5 w-5" /> },
        { status: "completed", label: "Completed", sub: "Enjoy your meal! 🍵", icon: <CheckCircle2 className="h-5 w-5" /> },
    ];

const STATUS_INDEX: Record<OrderStatus, number> = {
    pending: 0, preparing: 1, ready: 2, completed: 3, cancelled: -1,
};

export function OrderStatusTracker({ orderId, initialStatus = "pending", onDismiss }: Props) {
    const [status, setStatus] = useState<OrderStatus>(initialStatus);
    const currentIndex = STATUS_INDEX[status] ?? 0;

    // Poll every 5 seconds for status updates
    useEffect(() => {
        async function poll() {
            try {
                const res = await axios.get(`/api/orders/${orderId}`);
                const newStatus: OrderStatus = res.data.order?.status;
                if (newStatus) setStatus(newStatus);
            } catch { /* ignore */ }
        }

        poll();
        const id = setInterval(poll, 5000);
        return () => clearInterval(id);
    }, [orderId]);

    if (status === "cancelled") {
        return (
            <div className="relative rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-red-500/[0.06] backdrop-blur-xl
                    border border-red-500/20 rounded-2xl" />
                <div className="relative flex items-center justify-between px-5 py-4">
                    <div>
                        <p className="text-sm font-bold text-red-400">Order Cancelled</p>
                        <p className="text-xs text-red-400/60 mt-0.5">Please contact the café for help.</p>
                    </div>
                    {onDismiss && (
                        <button onClick={onDismiss} className="text-zinc-600 hover:text-zinc-300 transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="relative rounded-2xl overflow-hidden">

            {/* Glass shell */}
            <div className="absolute inset-0 rounded-2xl
                bg-gradient-to-b from-white/[0.08] to-white/[0.03]
                backdrop-blur-2xl border border-white/[0.10]
                shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.10)]" />

            {/* Amber glow */}
            <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2
                h-24 w-48 rounded-full bg-amber-500/15 blur-3xl" />

            <div className="relative px-5 py-5">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl
                            bg-amber-500/15 border border-amber-500/25
                            shadow-[0_0_16px_rgba(245,158,11,0.15)]">
                            {status === "preparing"
                                ? <Loader2 className="h-4 w-4 text-amber-400 animate-spin" />
                                : <ChefHat className="h-4 w-4 text-amber-400" />
                            }
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">
                                Order #{orderId.slice(-6).toUpperCase()}
                            </p>
                            <p className="text-[11px] text-zinc-500">Updates every 5 seconds</p>
                        </div>
                    </div>
                    {onDismiss && (
                        <button onClick={onDismiss}
                            className="flex h-7 w-7 items-center justify-center rounded-lg
                                text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.08] transition-colors">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Steps */}
                <div className="space-y-2">
                    {STEPS.map((step, i) => {
                        const isDone = i < currentIndex;
                        const isActive = i === currentIndex;

                        return (
                            <div key={step.status} className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm
                                transition-all duration-500
                                ${isActive
                                    ? "bg-amber-500/10 border-amber-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_20px_rgba(245,158,11,0.08)]"
                                    : isDone
                                        ? "bg-emerald-500/[0.07] border-emerald-400/20"
                                        : "bg-white/[0.02] border-white/[0.05]"
                                }`}>

                                {/* Circle */}
                                <div className={`
                                    flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border
                                    transition-all duration-500
                                    ${isActive
                                        ? "bg-amber-500/20 border-amber-400/50 text-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.3)]"
                                        : isDone
                                            ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-400"
                                            : "bg-white/[0.04] border-white/[0.08] text-zinc-700"
                                    }`}>
                                    {isDone
                                        ? <CheckCircle2 className="h-4 w-4" />
                                        : isActive
                                            ? <span className="animate-pulse">{step.icon}</span>
                                            : step.icon
                                    }
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-bold transition-colors duration-300
                                        ${isActive ? "text-amber-300" : isDone ? "text-emerald-400" : "text-zinc-700"}`}>
                                        {step.label}
                                    </p>
                                    <p className={`text-[10px] mt-0.5 transition-colors duration-300
                                        ${isActive ? "text-zinc-400" : isDone ? "text-zinc-600" : "text-zinc-800"}`}>
                                        {step.sub}
                                    </p>
                                </div>

                                {isActive && <Loader2 className="h-3.5 w-3.5 text-amber-400 animate-spin flex-shrink-0" />}
                                {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />}
                            </div>
                        );
                    })}
                </div>

                {/* Status message */}
                <p className={`mt-4 text-center text-[11px] font-medium transition-all duration-300
                    ${status === "pending" ? "text-zinc-600" : ""}
                    ${status === "preparing" ? "text-amber-500/70 animate-pulse" : ""}
                    ${status === "ready" ? "text-emerald-400 font-bold" : ""}
                    ${status === "completed" ? "text-zinc-500" : ""}
                `}>
                    {status === "pending" && "⏳ Waiting for kitchen to accept your order…"}
                    {status === "preparing" && "🍵 Your order is being freshly prepared!"}
                    {status === "ready" && "✅ Your order is ready — please come collect it!"}
                    {status === "completed" && "🎉 Thanks for visiting ChaiDham!"}
                </p>
            </div>
        </div>
    );
}