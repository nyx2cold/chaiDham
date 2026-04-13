import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/user";

export async function POST(request: Request) {
  try {
    await dbConnect();

   const { email, code } = await request.json();
console.log("Received email:", email);  // ← add this
console.log("Received code:", code);

const user = await UserModel.findOne({ email });
console.log("Found user:", user);       // ← add this
    if (!user) {
      return Response.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date() < user.verifyCodeExpire;

    if (!isCodeNotExpired) {
      return Response.json(
        { success: false, message: "Verification code has expired. Please sign up again." },
        { status: 400 }
      );
    }

    if (!isCodeValid) {
      return Response.json(
        { success: false, message: "Incorrect verification code." },
        { status: 400 }
      );
    }

    user.isVerified = true;
    await user.save();

    return Response.json(
      { success: true, message: "Email verified successfully. Please sign in." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error verifying code:", error);
    return Response.json(
      { success: false, message: "Error verifying code." },
      { status: 500 }
    );
  }
}