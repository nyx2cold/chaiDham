// app/api/cafe/status/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbconnect";
import CafeSettings from "@/model/CafeSettings";


// ── GET — anyone can read the status (used by menu page) ──────────────────────
export async function GET() {
    try {
        await dbConnect();
        const settings = await (CafeSettings as any).getInstance();
        return NextResponse.json({ isOpen: settings.isOpen });
    } catch {
        return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
    }
}

// ── PATCH — only admins can toggle ───────────────────────────────────────────
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { isOpen } = await req.json();

        if (typeof isOpen !== "boolean") {
            return NextResponse.json({ error: "isOpen must be a boolean" }, { status: 400 });
        }

        const settings = await (CafeSettings as any).getInstance();
        settings.isOpen = isOpen;
        await settings.save();

        return NextResponse.json({ isOpen: settings.isOpen });
    } catch {
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}