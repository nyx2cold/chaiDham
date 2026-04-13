import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/user";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { email } = await request.json();

    if (!email) {
      return Response.json(
        { success: false, message: "Email is required." },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return Response.json(
        { success: false, message: "User is already verified." },
        { status: 400 }
      );
    }

    // Generate new code and expiry
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpire = new Date(Date.now() + 3600000); // 1 hour

    user.verifyCode = verifyCode;
    user.verifyCodeExpire = verifyCodeExpire;
    await user.save();

    const emailResponse = await sendVerificationEmail(
      email,
      user.userName,
      verifyCode
    );

    if (!emailResponse.success) {
      return Response.json(
        { success: false, message: emailResponse.message },
        { status: 500 }
      );
    }

    return Response.json(
      { success: true, message: "Verification code resent successfully." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Resend code error:", error);
    return Response.json(
      { success: false, message: "Error resending verification code." },
      { status: 500 }
    );
  }
}