"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { signOut } from "next-auth/react";
import {
  IconDashboard,
  IconDoorEnter,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { NavMain } from "./nav-main";
import Link from "next/link";

export function AppSidebar() {
  const data = [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "User",
      url: "/user",
      icon: IconUser,
    },
    {
      title: "Role",
      url: "/role",
      icon: IconUsers,
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <IconDoorEnter className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Roomly</span>
                <span className="truncate text-xs">Hotel & Stays</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data} />
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
