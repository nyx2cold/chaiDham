import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    // We can add custom properties to the `session` object by declaring them here

    interface User {
        _id: string;
        isVerified: boolean;
        isAcceptingOrders: boolean;  
        username?: string;
        role: "admin" | "user";      
    }

    // This is the session object that will be returned to the client. We can add custom properties to it by declaring them here. We are adding the user's id, verification status, order acceptance status, username, and role to the session object. This way, we can access these properties on the client side when we call useSession() or getSession() from next-auth. For example, we can check if the user is an admin or not and show different UI based on that. We can also check if the user is verified or not and show a message to verify their account if they are not verified.
    interface Session {
        user: {
            _id: string;
            isVerified: boolean;
            isAcceptingOrders: boolean;  
            username?: string;
            role: "admin" | "user";      
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
    }
}