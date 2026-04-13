import { transporter } from "@/lib/nodemailer";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetCode: string
): Promise<ApiResponse> {
  try {
    await transporter.sendMail({
      from: `"ChaiDham" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Reset your password | ChaiDham",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hey ${username}, reset your password 🔐</h2>
          <p>Use the code below to reset your password:</p>
          <div style="
            background: #f4f4f4;
            padding: 20px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            border-radius: 8px;
            margin: 20px 0;
          ">
            ${resetCode}
          </div>
          <p>This code expires in <strong>15 minutes</strong>.</p>
          <p>If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    return { success: true, message: "Password reset email sent successfully" };
  } catch (error) {
    console.error("Error sending reset email:", error);
    return { success: false, message: "Failed to send password reset email" };
  }
}