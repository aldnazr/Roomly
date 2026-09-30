"use client";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { RouteBreadcrumb } from "@/components/route-breadcrumb";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b border-border/70 bg-background/60 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2" />
            <RouteBreadcrumb />
          </div>
          <ModeToggle />
        </header>
        <div className="flex-1 overflow-y-auto">
          <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
