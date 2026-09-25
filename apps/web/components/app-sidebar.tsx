"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IconDashboard, IconUsers } from "@tabler/icons-react";
import { NavMain } from "./nav-main";

export function AppSidebar() {
  const data = [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Role",
      url: "/role",
      icon: IconUsers,
    },
  ];

  return (
    <Sidebar collapsible="icon">
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
