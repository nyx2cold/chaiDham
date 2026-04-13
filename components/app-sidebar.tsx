"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    LayoutDashboard, ShoppingBag, UtensilsCrossed, BarChart3,
    Users, Settings, LogOut, Bell, Tag, ClipboardList,
    TrendingUp, Home, Shield, FileText, Truck, Search,
    HelpCircle, MoreHorizontal,
} from "lucide-react";
import {
    Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
    SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import React from "react";

// ── Nav config ────────────────────────────────────────────────────────────────



const MANAGE_NAV = [
    { label: "Customers", href: "/dashboard?tab=customers", icon: Users, tabKey: "customers" },
    // { label: "Categories", href: "/dashboard?tab=categories", icon: Tag, tabKey: "categories" },
    // { label: "Order Tracking", href: "/dashboard?tab=order-tracking", icon: Truck, tabKey: "order-tracking" },
    // { label: "Reports", href: "/dashboard?tab=reports", icon: ClipboardList, tabKey: "reports" },
    // { label: "Revenue", href: "/dashboard?tab=revenue", icon: TrendingUp, tabKey: "revenue" },
];

// const DOCS_NAV = [
//     { label: "Data Library", href: "/dashboard?tab=data-library", icon: FileText, tabKey: "data-library" },
// ];

const BOTTOM_NAV = [
    { label: "Settings", href: "/profile", icon: Settings, tabKey: "settings" },
    // { label: "Notifications", href: "/dashboard?tab=notifications", icon: Bell, badge: "3", tabKey: "notifications" },
    { label: "Get Help", href: "/dashboard?tab=help", icon: HelpCircle, tabKey: "help" },
    // { label: "Search", href: "/dashboard?tab=search", icon: Search, tabKey: "search" },
    // { label: "Back to Site", href: "/", icon: Home, exact: true },
];

// ── Helper ────────────────────────────────────────────────────────────────────

function getInitials(name?: string | null): string {
    if (!name) return "A";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── Nav item ──────────────────────────────────────────────────────────────────

function NavItem({
    href, icon: Icon, label, badge, exact, tabKey,
}: {
    href: string;
    icon: React.ElementType;
    label: string;
    badge?: string;
    exact?: boolean;
    tabKey?: string;
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get("tab");

    let isActive = false;
    if (exact) {
        // Exact match: pathname must match and no tab param (for Overview & Back to Site)
        isActive = href === "/"
            ? pathname === "/"
            : pathname === "/dashboard" && !currentTab;
    } else if (tabKey) {
        isActive = pathname === "/dashboard" && currentTab === tabKey;
    } else {
        isActive = pathname === href;
    }

    return (
        <SidebarMenuItem className="list-none">
            <Link
                href={href}
                className={[
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium",
                    "transition-all duration-150 w-full outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50",
                    isActive
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/12"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] border border-transparent",
                ].join(" ")}
            >
                <Icon
                    className={[
                        "h-4 w-4 flex-shrink-0 transition-colors",
                        isActive ? "text-amber-400" : "text-zinc-500",
                    ].join(" ")}
                />
                <span className="flex-1 truncate">{label}</span>
                {badge && (
                    <span
                        className={[
                            "flex h-4 min-w-[16px] items-center justify-center rounded-full px-1.5",
                            "text-[10px] font-bold tabular-nums leading-none",
                            isActive
                                ? "bg-amber-500/30 text-amber-300"
                                : "bg-zinc-700 text-zinc-300",
                        ].join(" ")}
                    >
                        {badge}
                    </span>
                )}
                {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                )}
            </Link>
        </SidebarMenuItem>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [pendingCount, setPendingCount] = React.useState<number>(0);

    React.useEffect(() => {
        async function fetchPending() {
            const res = await fetch("/api/orders?status=pending");
            const data = await res.json();
            setPendingCount(data.count); // adjust based on your API response shape
        }
        fetchPending();
    }, []);


    const MAIN_NAV = [
        // { label: "Overview", href: "/dashboard", icon: LayoutDashboard, exact: true },
        { label: "Orders", href: "/dashboard?tab=orders", icon: ShoppingBag, badge: pendingCount > 0 ? String(pendingCount) : undefined, tabKey: "orders" },
        { label: "Menu", href: "/dashboard?tab=menu", icon: UtensilsCrossed, tabKey: "menu" },
        { label: "Analytics", href: "/dashboard?tab=analytics", icon: BarChart3, tabKey: "analytics" },
        { label: "Back to site", href: "/", icon: Home, exact: true },

    ];
    const { data: session } = useSession();

    const displayName = (session?.user as any)?.username ?? session?.user?.name ?? "Admin";
    const displayEmail = (session?.user as any)?.email ?? session?.user?.email ?? "admin@chaidham.com";
    const initials = getInitials(displayName);

    return (
        <Sidebar variant="inset" {...props} className="border-r border-white/[0.06] bg-zinc-950">

            {/* ── Logo ── */}
            <SidebarHeader className="px-4 py-4 border-b border-white/[0.06]">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg
            bg-amber-500 shadow-lg shadow-amber-900/40
            group-hover:bg-amber-400 transition-all duration-200">
                        <UtensilsCrossed className="h-4 w-4 text-zinc-950" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white leading-none">
                            Chai<span className="text-amber-500">Dham</span>
                        </p>
                        <p className="text-[10px] text-zinc-500 leading-none mt-0.5 font-medium uppercase tracking-wider">
                            Admin Panel
                        </p>
                    </div>
                </Link>
            </SidebarHeader>

            {/* ── Nav ── */}
            <SidebarContent className="px-3 py-3 flex flex-col gap-1 overflow-y-auto scrollbar-none">

                {/* Main */}
                <SidebarGroup className="p-0">
                    <SidebarMenu className="gap-0.5 flex flex-col">
                        {MAIN_NAV.map((item) => <NavItem key={item.label} {...item} />)}
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarSeparator className="bg-white/[0.06] my-2" />

                {/* Manage */}
                <SidebarGroup className="p-0">
                    <SidebarGroupLabel className="px-3 mb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        Manage
                    </SidebarGroupLabel>
                    <SidebarMenu className="gap-0.5 flex flex-col">
                        {MANAGE_NAV.map((item) => <NavItem key={item.label} {...item} />)}
                    </SidebarMenu>
                </SidebarGroup>


                {/* Documents */}
                {/* <SidebarGroup className="p-0">
                    <SidebarGroupLabel className="px-3 mb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        Documents
                    </SidebarGroupLabel>
                    <SidebarMenu className="gap-0.5 flex flex-col">
                        {DOCS_NAV.map((item) => <NavItem key={item.label} {...item} />)}
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarSeparator className="bg-white/[0.06] my-2" /> */}

                {/* Bottom */}
                <SidebarGroup className="p-0">
                    <SidebarMenu className="gap-0.5 flex flex-col">
                        {BOTTOM_NAV.map((item) => <NavItem key={item.label} {...item} />)}
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarSeparator className="bg-white/[0.06] my-2" />


            </SidebarContent>

            {/* ── Footer / User ── */}
            <SidebarFooter className="border-t border-white/[0.06] p-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5
              border border-white/[0.08] bg-white/[0.04]
              hover:bg-white/[0.08] hover:border-white/[0.14]
              transition-all duration-150 group outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40">
                            <Avatar className="h-8 w-8 flex-shrink-0 border border-amber-500/40">
                                <AvatarFallback className="bg-amber-500 text-zinc-950 text-xs font-bold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-xs font-semibold text-white leading-none truncate">{displayName}</p>
                                <p className="text-[10px] text-zinc-400 leading-none mt-1 truncate">{displayEmail}</p>
                            </div>
                            <MoreHorizontal className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0 group-hover:text-zinc-300 transition-colors" />
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        side="top" align="start" sideOffset={10}
                        className="w-64 rounded-2xl border border-zinc-800 bg-zinc-900 p-0 shadow-2xl shadow-black/60 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-4 pt-4 pb-3">
                            <div className="inline-flex items-center gap-1.5 mb-3 px-2 py-1 rounded-lg
                bg-red-500/15 border border-red-500/25 text-red-400 text-[11px] font-bold tracking-widest">
                                <Shield className="h-3 w-3" />
                                ADMIN
                            </div>
                            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">
                                Signed in as
                            </p>
                            <p className="text-sm font-bold text-white truncate">{displayEmail}</p>
                        </div>

                        <div className="h-px bg-zinc-800" />

                        {/* Items */}
                        <div className="p-2 space-y-0.5">
                            <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 text-zinc-200 font-medium
                cursor-pointer outline-none focus:bg-zinc-800 focus:text-white transition-colors">
                                <Link href="/" className="flex items-center gap-3">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800">
                                        <Home className="h-3.5 w-3.5 text-amber-400" />
                                    </div>
                                    Back to Site
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 text-zinc-200 font-medium
                cursor-pointer outline-none focus:bg-zinc-800 focus:text-white transition-colors">
                                <Link href="/profile" className="flex items-center gap-3">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800">
                                        <Users className="h-3.5 w-3.5 text-amber-400" />
                                    </div>
                                    Profile
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 text-zinc-200 font-medium
                cursor-pointer outline-none focus:bg-zinc-800 focus:text-white transition-colors">
                                <Link href="/dashboard?tab=settings" className="flex items-center gap-3">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800">
                                        <Settings className="h-3.5 w-3.5 text-amber-400" />
                                    </div>
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                        </div>

                        <div className="h-px bg-zinc-800" />

                        {/* Sign out */}
                        <div className="p-2">
                            <DropdownMenuItem
                                onClick={() => signOut({ callbackUrl: "/sign-in" })}
                                className="rounded-xl px-3 py-2.5 font-medium cursor-pointer outline-none
                  text-red-400 focus:bg-red-500/10 focus:text-red-300 transition-colors"
                            >
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 mr-3 flex-shrink-0">
                                    <LogOut className="h-3.5 w-3.5 text-red-400" />
                                </div>
                                Sign out
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Admin badge */}
                <div className="flex items-center justify-center mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
            bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold tracking-wider">
                        <span className="h-1 w-1 rounded-full bg-red-400 animate-pulse" />
                        ADMIN
                    </span>
                </div>
            </SidebarFooter>

        </Sidebar>
    );
}