import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbconnect";
import OrderModel from "@/model/order";
import UserModel from "@/model/user";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const user = session.user as any;
        const userId = user._id ?? user.id;

        const orders = await OrderModel
            .find({ "customer.userId": userId.toString() })
            .sort({ createdAt: -1 })
            .lean();

        const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

        // Find favourite item
        const itemCount: Record<string, number> = {};
        orders.forEach((o) => {
            o.items.forEach((i: any) => {
                itemCount[i.name] = (itemCount[i.name] ?? 0) + i.quantity;
            });
        });
        const favoriteItem = Object.entries(itemCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

        // Add this after fetching orders
        const dbUser = await UserModel.findById(userId.toString())
            .select("browniePoints createdAt")
            .lean();

        return NextResponse.json({
            success: true,
            orders,
            stats: {
                totalOrders: orders.length,
                totalSpent,
                favoriteItem,
                browniePoints: (dbUser as any)?.browniePoints ?? 0,
                memberSince: (dbUser as any)?.createdAt,
            },
        });


    } catch (err) {
        console.error("[GET /api/orders/my]", err);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}