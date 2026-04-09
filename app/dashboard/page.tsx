"use client";

import { useSearchParams } from "next/navigation";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { OrdersTable } from "@/components/admin/orders-table";
import { MenuManager } from "@/components/admin/menu-manager";
import { OrdersOverviewChart } from "@/components/admin/orders-overview-chart";
import { StatsCards } from "@/components/admin/stats-card";
import {
  Bell, LayoutDashboard, ShoppingBag, UtensilsCrossed,
  BarChart3, Users, Tag, Truck, ClipboardList, TrendingUp,
  FileText, Settings, HelpCircle, Search,
} from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";

// ── Tab types ─────────────────────────────────────────────────────────────────

export type AdminTab =
  | "orders" | "menu" | "analytics"
  | "customers" | "categories" | "order-tracking" | "reports"
  | "revenue" | "data-library" | "settings" | "notifications"
  | "help" | "search";

const TAB_META: Record<AdminTab, { label: string; icon: React.ReactNode; sub: string }> = {
  orders: { label: "Orders", icon: <ShoppingBag className="h-4 w-4" />, sub: "Monitor and manage orders" },
  menu: { label: "Menu", icon: <UtensilsCrossed className="h-4 w-4" />, sub: "Add, edit & toggle items" },
  analytics: { label: "Analytics", icon: <BarChart3 className="h-4 w-4" />, sub: "Revenue and order trends" },
  customers: { label: "Customers", icon: <Users className="h-4 w-4" />, sub: "Manage your customers" },
  categories: { label: "Categories", icon: <Tag className="h-4 w-4" />, sub: "Manage menu categories" },
  "order-tracking": { label: "Order Tracking", icon: <Truck className="h-4 w-4" />, sub: "Track live orders" },
  reports: { label: "Reports", icon: <ClipboardList className="h-4 w-4" />, sub: "View detailed reports" },
  revenue: { label: "Revenue", icon: <TrendingUp className="h-4 w-4" />, sub: "Revenue breakdown" },
  "data-library": { label: "Data Library", icon: <FileText className="h-4 w-4" />, sub: "Manage your data" },
  settings: { label: "Settings", icon: <Settings className="h-4 w-4" />, sub: "App settings" },
  notifications: { label: "Notifications", icon: <Bell className="h-4 w-4" />, sub: "Your notifications" },
  help: { label: "Get Help", icon: <HelpCircle className="h-4 w-4" />, sub: "Support & documentation" },
  search: { label: "Search", icon: <Search className="h-4 w-4" />, sub: "Search everything" },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as AdminTab) ?? "orders";
  const meta = TAB_META[tab] ?? TAB_META.orders;

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 64)",
        "--header-height": "calc(var(--spacing) * 14)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />

      <SidebarInset className="bg-zinc-950 min-h-screen">

        {/* ── Top bar ── */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between
          border-b border-white/[0.05] bg-zinc-950/90 backdrop-blur-xl px-4 md:px-6">

          <div className="flex items-center gap-3">
            {/* Mobile sidebar trigger */}
            <SidebarTrigger className="text-zinc-500 hover:text-white" />

            {/* Page title */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg
                bg-amber-500/15 border border-amber-500/25">
                <span className="text-amber-400">{meta.icon}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">{meta.label}</p>
                <p className="hidden sm:block text-[11px] text-zinc-500 leading-none mt-0.5">
                  {meta.sub}
                </p>
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full
              border border-green-500/20 bg-green-500/5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] font-medium text-green-400">Live</span>
            </div> */}

            {/* <button className="relative flex h-8 w-8 items-center justify-center rounded-lg
              border border-white/[0.08] bg-white/[0.03]
              text-zinc-400 hover:text-white hover:bg-white/[0.07] transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
            </button> */}
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex flex-col gap-6 p-4 md:p-6">

          {/* ── Core tabs ── */}
          {/* {tab === "overview" && (
            <>
              <StatsCards />
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2"><RevenueChart /></div>
                <div className="xl:col-span-1"><OrdersOverviewChart /></div>
              </div>
              <OrdersTable compact />
            </>
          )} */}

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

          {/* ── Manage tabs — placeholder pages ── */}
          {(["customers", "categories", "order-tracking", "reports", "revenue",
            "data-library", "settings", "notifications", "help", "search"] as AdminTab[])
            .includes(tab) && (
              <PlaceholderPage meta={meta} />
            )}

        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

// ── Placeholder for pages not yet built ───────────────────────────────────────

function PlaceholderPage({ meta }: { meta: { label: string; icon: React.ReactNode; sub: string } }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl
        bg-amber-500/10 border border-amber-500/20 text-amber-400">
        {meta.icon && <span className="scale-150">{meta.icon}</span>}
      </div>
      <div>
        <h2 className="text-xl font-bold text-white">{meta.label}</h2>
        <p className="text-sm text-zinc-500 mt-1">{meta.sub}</p>
      </div>
      <p className="text-xs text-zinc-600 border border-white/[0.06] rounded-lg px-4 py-2 bg-white/[0.02]">
        This page is under construction
      </p>
    </div>
  );
}