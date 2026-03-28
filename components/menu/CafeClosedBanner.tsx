// components/menu/CafeClosedBanner.tsx
"use client";

import { UtensilsCrossed } from "lucide-react";

export function CafeClosedBanner() {
    return (
        <div className="relative overflow-hidden rounded-2xl mb-6
            border border-red-500/25 bg-red-500/[0.07] backdrop-blur-sm
            shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_24px_rgba(239,68,68,0.08)]">

            {/* Ambient glow */}
            <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28
                rounded-full bg-red-500/15 blur-3xl" />

            <div className="relative flex items-center gap-4 px-5 py-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center
                    rounded-xl bg-red-500/15 border border-red-500/25">
                    <UtensilsCrossed className="h-5 w-5 text-red-400" />
                </div>
                <div>
                    <p className="text-sm font-bold text-red-300">
                        ChaiDham is currently closed
                    </p>
                    <p className="text-xs text-red-400/70 mt-0.5">
                        We're not accepting orders right now. Check back soon!
                    </p>
                </div>
                <div className="ml-auto flex-shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                        bg-red-500/15 border border-red-500/25 text-red-400 text-[11px] font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                        Closed
                    </span>
                </div>
            </div>
        </div>
    );
}