"use client";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";
import { useRoles } from "@/features/roles/use-roles";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

export default function RolePage() {
  const { isLoading, isError, error, data } = useRoles();
  const roles = data?.data;

  return (
    <>
      {roles &&
        roles.map((role) => (
          <Item
            variant={"outline"}
            key={role.slug}
            render={
              <Link href={`/role/${role.slug}`}>
                <ItemContent>
                  <ItemTitle>{role.name}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <IconArrowRight className="size-4" />
                </ItemActions>
              </Link>
            }
          ></Item>
        ))}
    </>
  );
}
