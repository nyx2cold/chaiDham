// hooks/useCafeStatus.ts
"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export function useCafeStatus() {
    const [isOpen, setIsOpen] = useState<boolean | null>(null);

    useEffect(() => {
        axios
            .get("/api/cafe/status")
            .then((res) => setIsOpen(res.data.isOpen))
            .catch(() => setIsOpen(false));

        // Poll every 30 seconds so customers see status changes without a refresh
        const id = setInterval(() => {
            axios
                .get("/api/cafe/status")
                .then((res) => setIsOpen(res.data.isOpen))
                .catch(() => {});
        }, 30_000);

        return () => clearInterval(id);
    }, []);

    return { isOpen, isLoading: isOpen === null };
}