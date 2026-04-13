import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/user";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userName, email, password,phone } = body;  // fixed: UserName → userName

    // Check if username already taken by verified user
    const existingUserVerifiedByUsername = await UserModel.findOne({
      userName,                                  // fixed: UserName → userName
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        { success: false, message: "Username is already taken." },
        { status: 400 }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpire = new Date(Date.now() + 3600000); // 1 hour
    

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          { success: false, message: "User already exists with this email." },
          { status: 400 }
        );
      } else {
        // Update unverified user with new credentials
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.userName = userName;  // fixed: UserName → userName
        existingUserByEmail.phone = phone;
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpire = verifyCodeExpire;
        await existingUserByEmail.save();
      }
    } else {
      // Create brand new user
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new UserModel({
        userName,                  // fixed: UserName → userName
        email,
        password: hashedPassword,
        phone,
        role: "user",              // added role
        verifyCode,
        verifyCodeExpire,
        isVerified: false,
        isAcceptingOrders: false,  // fixed: removed isAcceptingMessages & messages[]
      });

      await newUser.save();
    }

    // Send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      userName,                   // fixed: UserName → userName
      verifyCode
    );

    if (!emailResponse.success) {
      return Response.json(
        { success: false, message: emailResponse.message },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User registered successfully. Please verify your email.",
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Sign-up error:", error);
    return Response.json(
      { success: false, message: "Error occurred during sign-up." },
      { status: 500 }
    );
  }
}