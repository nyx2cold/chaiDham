"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { OrdersTable } from "@/components/admin/orders-table";
import { MenuManager } from "@/components/admin/menu-manager";
import { OrdersOverviewChart } from "@/components/admin/orders-overview-chart";
import { Bell, LayoutDashboard, ShoppingBag, UtensilsCrossed, BarChart3 } from "lucide-react";
import { StatsCards } from "@/components/admin/stats-card";

export type AdminTab = "overview" | "orders" | "menu" | "analytics";

const TAB_META: Record<AdminTab, { label: string; icon: React.ReactNode; sub: string }> = {
  overview: { label: "Overview", icon: <LayoutDashboard className="h-4 w-4" />, sub: "Your café at a glance" },
  orders: { label: "Orders", icon: <ShoppingBag className="h-4 w-4" />, sub: "Monitor and manage orders" },
  menu: { label: "Menu", icon: <UtensilsCrossed className="h-4 w-4" />, sub: "Add, edit & toggle items" },
  analytics: { label: "Analytics", icon: <BarChart3 className="h-4 w-4" />, sub: "Revenue and order trends" },
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as AdminTab) ?? "overview";

  const meta = TAB_META[tab] ?? TAB_META.overview;

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 64)",
        "--header-height": "calc(var(--spacing) * 14)",
      } as React.CSSProperties}
    >

      <SidebarInset className="bg-black min-h-screen">

        {/* ── Top bar ── */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between
          border-b border-white/[0.05] bg-zinc-950/90 backdrop-blur-xl px-4 md:px-6">

          <div className="flex items-center gap-3">
            {/* Mobile sidebar trigger */}
            <SidebarTrigger className="text-zinc-500 hover:text-white md:hidden" />

            {/* Page title */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/25">
                <span className="text-amber-400">{meta.icon}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">{meta.label}</p>
                <p className="hidden sm:block text-[11px] text-zinc-500 leading-none mt-0.5">{meta.sub}</p>
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full
              border border-green-500/20 bg-green-500/5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] font-medium text-green-400">Live</span>
            </div>

            {/* Notifications */}
            <button className="relative flex h-8 w-8 items-center justify-center rounded-lg
              border border-white/[0.08] bg-white/[0.03]
              text-zinc-400 hover:text-white hover:bg-white/[0.07]
              transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
            </button>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex flex-col gap-6 p-4 md:p-6">

          {tab === "overview" && (
            <>
              <StatsCards />
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2"><RevenueChart /></div>
                <div className="xl:col-span-1"><OrdersOverviewChart /></div>
              </div>
              <OrdersTable compact />
            </>
          )}

          {tab === "orders" && <OrdersTable />}

          {tab === "menu" && <MenuManager />}

          {tab === "analytics" && (
            <>
              <StatsCards />
              <RevenueChart />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <OrdersOverviewChart />
              </div>
            </>
          )}

        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}