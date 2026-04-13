// app/api/analytics/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbconnect";
import OrderModel from "@/model/order";

function startOfDay(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function dayOffset(d: Date, n: number) {
    const copy = startOfDay(d);
    copy.setDate(copy.getDate() + n);
    return copy;
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const now = new Date();
        const todayStart = startOfDay(now);
        const yesterdayStart = dayOffset(now, -1);
        const weekStart = dayOffset(now, -6);

        // ── Status breakdown ──
        const statusAgg = await OrderModel.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        const statusBreakdown: Record<string, number> = {
            pending: 0, preparing: 0, ready: 0, completed: 0, cancelled: 0,
        };
        for (const row of statusAgg) {
            if (row._id in statusBreakdown) statusBreakdown[row._id] = row.count;
        }

        // ── Today (completed orders only for revenue) ──
        const [todayAgg] = await OrderModel.aggregate([
            { $match: { createdAt: { $gte: todayStart }, status: "completed" } },
            { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } },
        ]);
        const todayRevenue = todayAgg?.revenue ?? 0;
        const todayCount = todayAgg?.count ?? 0;

        // ── Yesterday for delta ──
        const [yestAgg] = await OrderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: yesterdayStart, $lt: todayStart },
                    status: "completed",
                },
            },
            { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } },
        ]);
        const yestRevenue = yestAgg?.revenue ?? 0;
        const yestCount = yestAgg?.count ?? 0;

        const revenueChange =
            yestRevenue > 0
                ? (((todayRevenue - yestRevenue) / yestRevenue) * 100).toFixed(1)
                : null;
        const orderChange = todayCount - yestCount;

        // ── Avg order value ──
        const avgOrderValue =
            todayCount > 0 ? Math.round(todayRevenue / todayCount) : 0;

        const [weekAvgAgg] = await OrderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: weekStart, $lt: todayStart },
                    status: "completed",
                },
            },
            { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } },
        ]);
        const weekAvg =
            (weekAvgAgg?.count ?? 0) > 0
                ? weekAvgAgg.revenue / weekAvgAgg.count
                : 0;
        const avgChange =
            weekAvg > 0
                ? (((avgOrderValue - weekAvg) / weekAvg) * 100).toFixed(1)
                : null;

        // ── Weekly chart — last 7 days ──
        const dailyAgg = await OrderModel.aggregate([
            { $match: { createdAt: { $gte: weekStart }, status: "completed" } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                    revenue: { $sum: "$total" },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dailyMap = new Map(dailyAgg.map((r) => [r._id as string, r]));

        const weeklyChart = Array.from({ length: 7 }, (_, i) => {
            const d = dayOffset(now, i - 6);
            const key = d.toISOString().slice(0, 10);
            const row = dailyMap.get(key);
            return {
                day: DAY_LABELS[d.getDay()],
                date: key,
                revenue: row?.revenue ?? 0,
                orders: row?.orders ?? 0,
            };
        });

        return NextResponse.json({
            success: true,
            statusBreakdown,
            stats: {
                todayRevenue,
                todayCount,
                revenueChange,
                orderChange,
                avgOrderValue,
                avgChange,
            },
            weeklyChart,
        });
    } catch (err) {
        console.error("[GET /api/analytics]", err);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}