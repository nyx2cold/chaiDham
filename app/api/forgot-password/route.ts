import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/user";
import { sendPasswordResetEmail } from "@/helpers/sendPasswordResetEmail";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    const user = await UserModel.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user || !user.isVerified) {
      return Response.json(
        { success: true, message: "If this email exists, a reset code has been sent." },
        { status: 200 }
      );
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetCode = resetCode;
    user.resetCodeExpire = resetCodeExpire;
    await user.save();

    const emailResponse = await sendPasswordResetEmail(email, user.userName, resetCode);

    if (!emailResponse.success) {
      return Response.json(
        { success: false, message: emailResponse.message },
        { status: 500 }
      );
    }

    return Response.json(
      { success: true, message: "If this email exists, a reset code has been sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return Response.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}