import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/user";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email, code, newPassword } = await request.json();

    const user = await UserModel.findOne({ email });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    if (!user.resetCode || !user.resetCodeExpire) {
      return Response.json(
        { success: false, message: "No reset request found. Please request a new code." },
        { status: 400 }
      );
    }

    if (new Date() > user.resetCodeExpire) {
      return Response.json(
        { success: false, message: "Reset code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (user.resetCode !== String(code)) {
      return Response.json(
        { success: false, message: "Incorrect reset code." },
        { status: 400 }
      );
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetCode = null;
    user.resetCodeExpire = null;
    await user.save();

    return Response.json(
      { success: true, message: "Password reset successfully. Please sign in." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return Response.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}