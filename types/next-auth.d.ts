import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface User {
        _id: string;
        isVerified: boolean;
        isAcceptingOrders: boolean;
        username?: string;
        role: "admin" | "user";
        isBanned: boolean;
    }

    interface Session {
        user: {
            _id: string;
            isVerified: boolean;
            isAcceptingOrders: boolean;
            username?: string;
            role: "admin" | "user";
            isBanned: boolean;
        } & DefaultSession['user']
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        _id: string;
        isVerified: boolean;
        isAcceptingOrders: boolean;
        username?: string;
        role: "admin" | "user";
        isBanned: boolean;
    }
}