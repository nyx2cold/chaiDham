// app/dashboard/page.tsx
import { Suspense } from "react";
import AdminDashboardClient from "./AdminDashboardClient";

export default function AdminDashboardPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-zinc-950">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                    <p className="text-sm text-zinc-500">Loading dashboard...</p>
                </div>
            </div>
        }>
            <AdminDashboardClient />
        </Suspense>
    );
}