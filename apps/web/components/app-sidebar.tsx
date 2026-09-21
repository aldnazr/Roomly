"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { signOut } from "next-auth/react";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          // user={user}
          logout={() => {
            signOut({ redirectTo: "/login" });
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
