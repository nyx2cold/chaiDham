import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbconnect";
import OrderModel from "@/model/order";
import UserModel from "@/model/user";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const email = (session.user as any).email;

        // Fetch all orders for this user, newest first
        const orders = await OrderModel
            .find({ "customer.email": email })
            .sort({ createdAt: -1 })
            .lean();

        // ── Compute stats ──────────────────────────────────────────────────────
        const completedOrders = orders.filter((o) => o.status === "completed");

        const totalSpent = completedOrders.reduce((s, o) => s + o.total, 0);

        // Favorite item — most ordered by quantity across completed orders
        const itemCount: Record<string, number> = {};
        for (const order of completedOrders) {
            for (const item of order.items as any[]) {
                itemCount[item.name] = (itemCount[item.name] ?? 0) + item.quantity;
            }
        }
        const favoriteItem = Object.entries(itemCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

        // Brownie points — always fetch fresh from UserModel
        const user = await UserModel.findOne({ email }, { browniePoints: 1 }).lean();
        const browniePoints = (user as any)?.browniePoints ?? 0;

        return NextResponse.json({
            success: true,
            orders,
            stats: {
                totalOrders: orders.length,
                totalSpent,
                favoriteItem,
                browniePoints,
            },
        });
    } catch (err) {
        console.error("[GET /api/orders/my]", err);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}