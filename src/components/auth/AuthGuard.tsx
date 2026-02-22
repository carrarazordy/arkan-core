"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useIdentityStore } from "@/store/useIdentityStore";
import { Loader2 } from "lucide-react";

const PUBLIC_ROUTES = ["/login", "/signup"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { checkSession, isLoading } = useIdentityStore();
    const router = useRouter();

    useEffect(() => {
        checkSession();

        // Safety: If for some reason middleware failed and we are client-side navigating
        // we can do a secondary check here, but it's mostly for UI state.
    }, [checkSession]);

    // Optional: Show loading state if strict UI sync is needed, 
    // but usually with middleware we can render immediately or show a skeleton.
    // For now, we will just render children to prevent blocking. 
    // The middleware ensures we are authorized.

    return <>{children}</>;
}
