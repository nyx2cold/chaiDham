import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbconnect";
import OrderModel from "@/model/order";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const { id } = await params;
        const order = await OrderModel.findById(id).lean();
        if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

        return NextResponse.json({ success: true, order });
    } catch (err) {
        console.error("[GET /api/orders/:id]", err);
        return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
    }
}

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

        const validStatuses = ["pending", "preparing", "ready", "completed", "cancelled"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const order = await OrderModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).lean();

        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        return NextResponse.json({ success: true, order });
    } catch (err) {
        console.error("[PATCH /api/orders/:id]", err);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}