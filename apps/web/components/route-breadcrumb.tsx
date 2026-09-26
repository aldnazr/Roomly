"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { roleKeys } from "@/features/roles/use-roles";
import { RoleResponse } from "@/features/roles/types";
import { userKeys } from "@/features/users/use-users";
import { UserResponse } from "@/features/users/types";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const STATIC_LABELS: Record<string, string> = {
  user: "User",
  role: "Role",
  create: "Create User",
};

function humanize(segment: string): string {
  const decoded = decodeURIComponent(segment).replace(/[-_]/g, " ");
  return decoded.charAt(0).toUpperCase() + decoded.slice(1);
}

export function RouteBreadcrumb() {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const segments = pathname.split("/").filter(Boolean);

  const resolveLabel = (segment: string, prevSegment?: string): string => {
    if (STATIC_LABELS[segment]) return STATIC_LABELS[segment];

    if (prevSegment === "role") {
      const cachedRoles = queryClient.getQueryData<RoleResponse>(
        roleKeys.list(),
      );
      const match = cachedRoles?.data.find((r) => r.slug === segment);
      if (match?.name) return match.name;
    }

    if (prevSegment === "user") {
      const cachedUsers = queryClient.getQueryData<UserResponse>(
        userKeys.list(),
      );
      const match = cachedUsers?.data.find((u) => String(u.id) === segment);
      if (match?.name || match?.username) return match.name || match.username;
    }

    return humanize(segment);
  };

  const items = [
    {
      href: "/",
      label: "Dashboard",
      isLast: segments.length === 0,
    },
    ...segments.map((seg, idx) => ({
      href: "/" + segments.slice(0, idx + 1).join("/"),
      label: resolveLabel(seg, segments[idx - 1]),
      isLast: idx === segments.length - 1,
    })),
  ];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, idx) => (
          <React.Fragment key={item.href}>
            {idx > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.isLast ?
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              : <BreadcrumbLink render={<Link href={item.href} />}>
                  {item.label}
                </BreadcrumbLink>
              }
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
