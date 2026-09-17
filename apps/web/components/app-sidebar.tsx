"use client";

import {
  Sidebar,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/lib/stores/auth-store";
import { IconDoor, IconUser } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export function AppSidebar() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();

  return (
    <Sidebar>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <IconUser /> Username
            </SidebarMenuButton>
            <SidebarMenuButton
              onClick={() => {
                clearAuth();
                router.push("/login");
              }}
            >
              <IconDoor /> Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
