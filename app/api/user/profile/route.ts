import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/user";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const user = await UserModel.findOne(
            { email: (session.user as any).email },
            { password: 0, verifyCode: 0, resetCode: 0 }  // strip sensitive fields
        ).lean();

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user: {
                userName: user.userName,       // ✅ matches schema exactly
                email: user.email,
                phone: user.phone,
                createdAt: user.createdAt,
                browniePoints: user.browniePoints,
            },
        });
    } catch (err) {
        console.error("[GET /api/user/profile]", err);
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const { userName, phone, email, currentPassword, newPassword } = await req.json();

        const user = await UserModel.findOne({ email: (session.user as any).email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // ── Basic field updates ───────────────────────────────────────────────
        if (userName && userName !== user.userName) {
            // check uniqueness
            const taken = await UserModel.findOne({ userName, _id: { $ne: user._id } });
            if (taken) {
                return NextResponse.json({ error: "Username already taken" }, { status: 409 });
            }
            user.userName = userName;
        }

        if (phone) user.phone = phone;

        // ── Email change ──────────────────────────────────────────────────────
        if (email && email !== user.email) {
            const taken = await UserModel.findOne({ email, _id: { $ne: user._id } });
            if (taken) {
                return NextResponse.json({ error: "Email already in use" }, { status: 409 });
            }
            user.email = email;
        }

        // ── Password change ───────────────────────────────────────────────────
        if (currentPassword && newPassword) {
            const valid = await bcrypt.compare(currentPassword, user.password);
            if (!valid) {
                return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
            }
            if (newPassword.length < 6) {
                return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();

        return NextResponse.json({
            success: true,
            user: {
                userName: user.userName,
                email: user.email,
                phone: user.phone,
                createdAt: user.createdAt,
                browniePoints: user.browniePoints,
            },
        });
    } catch (err) {
        console.error("[PATCH /api/user/profile]", err);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}