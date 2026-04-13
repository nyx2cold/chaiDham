"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2, ShoppingBag, ChevronUp } from "lucide-react";
import type { CartItem } from "@/context/cartContext";

interface CartBarProps {
    cartItems: CartItem[];
    cartCount: number;
    cartTotal: number;
    drawerOpen: boolean;
    setDrawerOpen: (open: boolean) => void;
    clearCart: () => void;
    setItemNotes?: (notes: Record<string, string>) => void;
    setExpandedNotes?: (expanded: Record<string, boolean>) => void;
}

export default function CartBar({
    cartItems,
    cartCount,
    cartTotal,
    drawerOpen,
    setDrawerOpen,
    clearCart,
    setItemNotes,
    setExpandedNotes,
}: CartBarProps) {
    const [mounted, setMounted] = useState(false);
    const [animState, setAnimState] = useState<"enter" | "idle" | "bounce" | "exit">("enter");
    const [badgePop, setBadgePop] = useState(false);
    const [priceKey, setPriceKey] = useState(0);

    const prevCountRef = useRef(cartCount);
    const prevTotalRef = useRef(cartTotal);
    const bounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wasEmptyRef = useRef(cartItems.length === 0);

    useEffect(() => setMounted(true), []);

    // Animate on cart change
    useEffect(() => {
        if (!mounted) return;

        const countChanged = prevCountRef.current !== cartCount;
        const totalChanged = prevTotalRef.current !== cartTotal;

        if (countChanged || totalChanged) {
            if (countChanged) {
                setBadgePop(false);
                requestAnimationFrame(() => setBadgePop(true));
                setTimeout(() => setBadgePop(false), 400);
            }

            if (totalChanged) {
                setPriceKey((k) => k + 1);
            }

            if (prevCountRef.current > 0 && cartCount > 0) {
                if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current);
                setAnimState("bounce");
                bounceTimerRef.current = setTimeout(() => setAnimState("idle"), 500);
            }

            prevCountRef.current = cartCount;
            prevTotalRef.current = cartTotal;
        }
    }, [cartCount, cartTotal, mounted]);

    // Drawer interactions
    useEffect(() => {
        if (!mounted) return;
        if (drawerOpen) {
            setAnimState("exit");
        } else if (cartCount > 0) {
            setAnimState("enter");
            setTimeout(() => setAnimState("idle"), 300);
        }
    }, [drawerOpen, mounted]);

    // First item added
    useEffect(() => {
        if (!mounted) return;
        if (wasEmptyRef.current && cartItems.length > 0) {
            setAnimState("enter");
            setTimeout(() => setAnimState("idle"), 300);
        }
        wasEmptyRef.current = cartItems.length === 0;
    }, [cartItems.length, mounted]);

    if (!mounted || cartItems.length === 0) return null;

    const animClass = {
        enter: "[animation:cartSlideUp_0.35s_ease-out_forwards]",
        idle: "",
        bounce: "[animation:cartBounce_0.4s_ease]",
        exit: "[animation:cartSlideDown_0.2s_ease-in_forwards] pointer-events-none",
    }[animState];

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
            <div className={animClass}>
                <div
                    className="
          relative flex items-center gap-3 px-4 py-3
          rounded-[20px] overflow-hidden
          border border-white/[0.20]
          shadow-[0_12px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)]
        "
                    style={{
                        background: "rgba(24,24,27,0.8)", // 🔥 more solid
                        backdropFilter: "blur(12px) saturate(140%)",
                        WebkitBackdropFilter: "blur(12px) saturate(140%)",
                    }}
                >
                    {/* Subtle amber tint */}
                    <div
                        className="absolute inset-0 rounded-[20px] pointer-events-none"
                        style={{
                            background:
                                "linear-gradient(125deg, rgba(235, 174, 18, 0.08) 0%, rgba(245,158,11,0.03) 60%, rgba(180,83,9,0.06) 100%)",
                        }}
                    />

                    {/* Highlight line */}
                    <div
                        className="absolute top-0 left-4 h-px pointer-events-none"
                        style={{
                            width: "40%",
                            background:
                                "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                        }}
                    />

                    {/* Left side */}
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="flex items-center gap-3 flex-1 text-left active:scale-[0.98] transition-transform relative z-10"
                    >
                        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-300/25 shrink-0">
                            <ShoppingBag className="w-4 h-4 text-amber-200" />
                        </span>

                        <span className="flex flex-col min-w-0">
                            <span className="flex items-center gap-2 text-[13px] font-semibold text-white/95">
                                <span
                                    className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full
                  bg-amber-400/30 border border-amber-300/35 text-[11px] font-bold text-amber-100
                  ${badgePop ? "animate-[countPop_0.35s_ease]" : ""}`}
                                >
                                    {cartCount}
                                </span>
                                <span className="text-white/80">item{cartCount !== 1 ? "s" : ""}</span>
                            </span>

                            <span
                                key={priceKey}
                                className="text-[11px] text-white/60 mt-[2px] animate-[priceFade_0.25s_ease]"
                            >
                                ₹{cartTotal.toFixed(0)} · Tap to view cart
                            </span>
                        </span>

                        <ChevronUp className="w-3.5 h-3.5 text-white/30 ml-auto" />
                    </button>

                    {/* Divider */}
                    <div className="w-px h-7 bg-white/10" />

                    {/* Clear button */}
                    <button
                        onClick={() => {
                            clearCart();
                            setItemNotes?.({});
                            setExpandedNotes?.({});
                        }}
                        className="
            flex items-center gap-1.5 px-3 py-[7px] rounded-[11px]
            bg-red-500/20 border border-red-400/30
            text-red-200 text-[12px] font-semibold
            hover:bg-red-500/30 hover:text-red-100
            active:scale-95 transition-all
          "
                    >
                        <Trash2 className="w-[13px] h-[13px]" />
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
}