import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbconnect";
import OrderModel from "@/model/order";
import UserModel from "@/model/user";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Aggregate orders per customer email
        const orderStats = await OrderModel.aggregate([
            { $match: { status: { $in: ["completed", "pending", "preparing", "ready"] } } },
            {
                $group: {
                    _id: "$customer.email",
                    name: { $first: "$customer.name" },
                    totalSpent: { $sum: "$total" },
                    orderCount: { $sum: 1 },
                    lastOrderAt: { $max: "$createdAt" },
                },
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 50 },
        ]);


        // Pull browniePoints from User model for each customer
        const emails = orderStats.map((s) => s._id);
        const users = await UserModel.find(
            { email: { $in: emails } },
            { email: 1, browniePoints: 1, createdAt: 1, isBanned: 1, phone: 1 }
        ).lean();

        const userMap = new Map(users.map((u) => [u.email, u]));

        const customers = orderStats.map((s, i) => {
            const user = userMap.get(s._id);
            return {
                rank: i + 1,
                email: s._id,
                name: s.name,
                phone: (user as any)?.phone ?? null,
                totalSpent: s.totalSpent,
                orderCount: s.orderCount,
                lastOrderAt: s.lastOrderAt,
                browniePoints: (user as any)?.browniePoints ?? 0,
                memberSince: (user as any)?.createdAt ?? null,
                isBanned: (user as any)?.isBanned ?? false,
            };
        });

        return NextResponse.json({ success: true, customers });
    } catch (err) {
        console.error("[GET /api/admin/customers]", err);
        return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
    }
}
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { email, isBanned } = await req.json();

        if (!email || typeof isBanned !== "boolean") {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const user = await UserModel.findOneAndUpdate(
            { email },
            { $set: { isBanned } },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, isBanned: user.isBanned });
    } catch (err) {
        console.error("[PUT /api/admin/customers]", err);
        return NextResponse.json({ error: "Failed to update ban status" }, { status: 500 });
    }
}
// PATCH — admin awards bonus points to a customer
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { email, points } = await req.json();

        if (!email || typeof points !== "number") {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const user = await UserModel.findOneAndUpdate(
            { email },
            { $inc: { browniePoints: points } },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            browniePoints: user.browniePoints,
        });
    } catch (err) {
        console.error("[PATCH /api/admin/customers]", err);
        return NextResponse.json({ error: "Failed to award points" }, { status: 500 });
    }


}