"use client"

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useRouter } from "next/navigation";

export default function Home() {
    const clearAuth = useAuthStore((state) => state.clearAuth)
    const router = useRouter()

    return <div>
        <Button
            onClick={() => {
                clearAuth()
                router.refresh()
            }
            }
        >Logout
        </Button>
    </div>
}