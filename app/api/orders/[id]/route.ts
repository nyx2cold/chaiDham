// app/api/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbconnect";
import OrderModel from "@/model/order";
import UserModel from "@/model/user";

const VALID_TRANSITIONS: Record<string, string[]> = {
    pending: ["preparing", "cancelled"],
    preparing: ["ready"],
    ready: ["completed"],
    completed: [],
    cancelled: [],
};

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;
        const { status } = await req.json();

        const order = await OrderModel.findById(id);
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const allowed = VALID_TRANSITIONS[order.status] ?? [];
        if (!allowed.includes(status)) {
            return NextResponse.json(
                { error: `Cannot transition from ${order.status} → ${status}` },
                { status: 400 }
            );
        }

        order.status = status;
        await order.save();

        // ── Award brownie points only on completion ───────────────────────────
        if (status === "completed") {
            const allOrders = await OrderModel.find({
                "customer.email": order.customer.email,
                status: "completed",
            });
            const totalSpent = allOrders.reduce((sum, o) => sum + o.total, 0);
            const correctPoints = Math.floor(totalSpent / 10);

            await UserModel.findOneAndUpdate(
                { email: order.customer.email },
                { $set: { browniePoints: correctPoints } }
            );
            console.log(`[orders] points updated → ${order.customer.email} | ${correctPoints} pts`);
        }

        return NextResponse.json({ success: true, order });
    } catch (err) {
        console.error("[PATCH /api/orders/[id]]", err);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;

        const order = await OrderModel.findById(id).lean();
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, order });
    } catch (err) {
        console.error("[GET /api/orders/[id]]", err);
        return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
    }
}