"use client";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";
import { useRoles } from "@/features/roles/use-roles";
import { IconArrowNarrowRight, IconArrowRight } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

export default function RolePage() {
  const { isLoading, isError, error, data } = useRoles();
  const roleList = data?.data;

  return (
    <>
      {roleList &&
        roleList.map((e) => (
          <Item
            variant={"outline"}
            key={e.slug}
            render={
              <a>
                <ItemContent>
                  <ItemTitle>{e.name}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <IconArrowRight className="size-4" />
                </ItemActions>
              </a>
            }
          ></Item>
        ))}
    </>
  );
}
