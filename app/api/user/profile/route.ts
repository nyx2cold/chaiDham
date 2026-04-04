import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/user";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const user = session.user as any;
        const { userName, email, phone } = await req.json();

        const dbUser = await UserModel.findById(user._id ?? user.id);
        if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        if (userName) dbUser.userName = userName;
        if (email) dbUser.email = email;
        if (phone) dbUser.phone = phone;

        await dbUser.save();
        return NextResponse.json({ success: true, message: "Profile updated" });
    } catch (err: any) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return NextResponse.json({ error: `${field} already taken` }, { status: 400 });
        }
        console.error("[PATCH /api/user/profile]", err);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}