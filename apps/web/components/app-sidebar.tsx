"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/lib/stores/auth-store";
import { IconDoor, IconUser } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "./mode-toggle";
import { NavUser } from "./nav-user";

export function AppSidebar() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={user}
          logout={() => {
            clearAuth();
            router.push("/login");
          }}
        />
        {/* <SidebarMenuButton
              onClick={() => {
                clearAuth();
                router.push("/login");
              }}
            >
              <IconDoor /> Logout <ModeToggle />
            </SidebarMenuButton> */}
      </SidebarFooter>
    </Sidebar>
  );
}
