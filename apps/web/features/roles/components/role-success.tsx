import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Role } from "@/features/roles/types";
import {
  IconArrowUpRight,
  IconBriefcase,
  IconHeadset,
  IconIdBadge2,
  IconKey,
  IconShieldLock,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";

const roleIcons = {
  guest: IconUser,
  staff: IconHeadset,
  manager: IconBriefcase,
  admin: IconShieldLock,
};

export function RoleSuccess({ roles }: { roles: Role[] }) {
  if (roles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Belum ada role</CardTitle>
          <CardDescription>
            Role yang tersedia akan tampil di area ini.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <ItemGroup className="grid gap-4 md:grid-cols-2">
      {roles.map((role, index) => {
        const RoleIcon =
          roleIcons[role.slug.toLowerCase() as keyof typeof roleIcons] ??
          IconIdBadge2;

        return (
          <Card
            key={role.slug}
            className="animate-in rounded-4xl bg-muted/50 p-1 ring-1 ring-foreground/5 fade-in slide-in-from-bottom-4 animation-duration-700 fill-mode-[both] [animation-timing-function:cubic-bezier(0.22,1,0.36,1)]"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <Item
              className="min-h-44 items-start rounded-[calc(2rem-4px)] bg-card p-5 transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              render={<Link href={`/role/${role.slug}`} />}
            >
              <ItemMedia
                variant="icon"
                className="size-11 rounded-full transition-none duration-50 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/item:rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10"
              >
                <RoleIcon
                  className="size-5"
                  stroke={1.5}
                  aria-hidden="true"
                />
              </ItemMedia>
              <ItemContent className="min-w-0 gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <ItemTitle className="font-heading text-base">
                    {role.name}
                  </ItemTitle>
                  <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground ring-1 ring-foreground/5">
                    {role.slug}
                  </span>
                </div>
                <ItemDescription className="line-clamp-2 leading-5">
                  {role.description}
                </ItemDescription>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <IconKey
                    className="size-3.5"
                    stroke={1.5}
                    aria-hidden="true"
                  />
                  <span>{role.permissions.length} permission</span>
                </div>
              </ItemContent>
              <ItemActions className="self-center">
                <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-[transform,color,background-color,border-radius] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/item:text-background group-hover/item:bg-primary">
                  <IconArrowUpRight
                    className="size-4"
                    aria-hidden="true"
                  />
                </span>
              </ItemActions>
            </Item>
          </Card>
        );
      })}
    </ItemGroup>
  );
}