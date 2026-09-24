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
import { NavUser } from "./nav-user";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function AppSidebar() {
  const router = useRouter();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup />

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              variant={"outline"}
              onClick={() => router.push("/role")}
            >
              Roles
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          logout={async () => {
            await signOut({ redirectTo: "/login" });
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
