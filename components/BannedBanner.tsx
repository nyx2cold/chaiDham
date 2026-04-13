"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Ban } from "lucide-react";

export function BannedBanner() {
    const { data: session } = useSession();
    const isBanned = (session?.user as any)?.isBanned;

    if (!isBanned) return null;


    return (
        <div className="sticky top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-3 px-4 py-3"
            style={{
                background: "linear-gradient(90deg,rgba(239,68,68,0.95),rgba(185,28,28,0.95))",
                backdropFilter: "blur(12px)",
                borderBottom: "1px solid rgba(239,68,68,0.4)",
                boxShadow: "0 4px 24px rgba(239,68,68,0.3)",
            }}>
            <Ban className="h-4 w-4 text-white flex-shrink-0" />
            <p className="text-sm font-bold text-white text-center">
                Your account has been blacklisted. You are not allowed to place orders.
                Contact support if you think this is a mistake.
            </p>
        </div>
    );
}