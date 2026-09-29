"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { signOut } from "next-auth/react";
import {
  IconDashboard,
  IconDoor,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { NavMain } from "./nav-main";
import { RoomlyHeader } from "./roomly-header";

export function AppSidebar() {
  const data = [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Room",
      url: "/room",
      icon: IconDoor,
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
        <RoomlyHeader />
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
