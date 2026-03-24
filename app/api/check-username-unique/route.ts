import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/user";
import { z } from "zod";
import { userNameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
  username: userNameValidation,
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const queryParam = { username: searchParams.get("username") };

    // Validate username with Zod
    const result = UsernameQuerySchema.safeParse(queryParam);

    if (!result.success) {
      const usernameErrors =
        result.error.format().username?._errors ?? ["Invalid username"];

      return Response.json(
        {
          success: false,
          message: usernameErrors.join(", "),
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    // Check if username is taken by a verified user
    const existingVerifiedUser = await UserModel.findOne({
      userName: username,   // fixed: UserName → userName
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken.",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is available.",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error checking username:", error);
    return Response.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}