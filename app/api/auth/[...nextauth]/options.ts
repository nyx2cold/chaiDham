import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/user";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "Credentials",
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "Enter your email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "******",
        },
      },

      async authorize(credentials: any): Promise<any> {
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { userName: credentials.identifier },
            ],
          });

          if (!user) {
            throw new Error("No user found with this email/username");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your email before logging in");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error("Incorrect password");
          }
        } catch (err: any) {
          throw new Error(err.message || "Authentication failed");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, populate token from user object
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingOrders = user.isAcceptingOrders;
        token.username = (user as any).userName;
        token.role = user.role;
        token.isBanned = (user as any).isBanned ?? false;
      }

      // On every token refresh, re-fetch isBanned from DB
      // so bans take effect immediately without requiring re-login
      if (token._id) {
        try {
          await dbConnect();
          const freshUser = await UserModel.findById(token._id)
            .select("isBanned")
            .lean() as any;
          if (freshUser) {
            token.isBanned = freshUser.isBanned ?? false;
          }
        } catch (err) {
          console.error("[jwt callback] Failed to refresh isBanned:", err);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingOrders = token.isAcceptingOrders;
        session.user.username = token.username;
        session.user.role = token.role;
        session.user.isBanned = token.isBanned;
      }
      return session;
    },
  },

  pages: {
    signIn: "/sign-in",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};