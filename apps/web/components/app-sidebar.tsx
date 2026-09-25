"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { signOut } from "next-auth/react";
import { IconDashboard, IconDoorEnter, IconUsers } from "@tabler/icons-react";
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
      title: "Role",
      url: "/role",
      icon: IconUsers,
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/70 p-3.5">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <IconDoorEnter className="size-4" aria-hidden="true" />
          </span>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-heading text-base font-semibold tracking-tight text-sidebar-foreground">
              Roomly
            </span>
            <span className="truncate text-xs text-muted-foreground">
              Hotel & Stays
            </span>
          </div>
        </Link>
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
