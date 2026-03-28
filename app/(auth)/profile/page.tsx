'use client'
import React from 'react'
import { signOut } from "next-auth/react";

const ProfilePage = () => {
    return (
        <div>
            {/* ...existing profile content... */}
            <button onClick={() => signOut()}>Log Out</button>
        </div>
    );
}

export default ProfilePage