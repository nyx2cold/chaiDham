"use client";

import { LayoutDashboard, ShoppingBag, UtensilsCrossed, BarChart3, Bell } from "lucide-react";
import type { AdminTab } from "@/app/dashboard/page";

const TABS: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    // { key: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
    { key: "orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" /> },
    { key: "menu", label: "Menu", icon: <UtensilsCrossed className="h-4 w-4" /> },
    { key: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
];

interface Props {
    activeTab: AdminTab;
    onTabChange: (tab: AdminTab) => void;
}

export function AdminHeader({ activeTab, onTabChange }: Props) {
    return (
        <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-zinc-950/90 backdrop-blur-xl">
            <div className="flex h-14 items-center justify-between px-4 md:px-6">

                {/* Left: title */}
                <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500">
                        <LayoutDashboard className="h-3.5 w-3.5 text-zinc-950" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white leading-none">Admin Dashboard</p>
                        <p className="text-[11px] text-zinc-500 leading-none mt-0.5">ChaiDham</p>
                    </div>
                </div>

                {/* Center: tabs */}
                <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => onTabChange(tab.key)}
                            className={`flex items-center gap-2 px-3 h-7 rounded-lg text-xs font-semibold transition-all duration-200 ${activeTab === tab.key
                                ? "bg-amber-500 text-zinc-950 shadow-[0_1px_8px_rgba(245,158,11,0.3)]"
                                : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05]"
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Mobile tabs */}
                <nav className="flex md:hidden items-center gap-1">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => onTabChange(tab.key)}
                            className={`flex items-center justify-center h-8 w-8 rounded-lg text-xs transition-all duration-200 ${activeTab === tab.key
                                ? "bg-amber-500 text-zinc-950"
                                : "text-zinc-500 hover:text-zinc-200"
                                }`}
                        >
                            {tab.icon}
                        </button>
                    ))}
                </nav>

                {/* Right: notifications */}
                <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-white transition-colors">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-500" />
                </button>
            </div>
        </header>
    );
}