import { Suspense } from "react";
import ProfileClient from "./ProfileClient";

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-zinc-950">
                <div className="h-8 w-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
            </div>
        }>
            <ProfileClient />
        </Suspense>
    );
}