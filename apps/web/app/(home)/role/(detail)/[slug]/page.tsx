"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useSetPermission } from "@/features/permissions/use-permissions";
import { useRoleDetail } from "@/features/roles/use-roles";
import { IconDeviceFloppy, IconRotate } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoleDetail() {
  const { slug: roleSlug } = useParams<{ slug: string }>();
  const { roles, permissions, isLoading, error, isError } = useRoleDetail();
  const { mutate, isPending } = useSetPermission(roleSlug);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const role = roles?.data.find((e) => e.slug == roleSlug);

  useEffect(() => {
    if (role) {
      setChecked(new Set(role.permissions));
    }
  }, [role]);

  const hasFormChange =
    !!role &&
    (checked.size !== role.permissions.length ||
      Array.from(checked).some((p) => !role.permissions.includes(p)));

  function toggleChecked(permission: string) {
    setChecked((value) => {
      const newValue = new Set(value);
      newValue.has(permission) ?
        newValue.delete(permission)
      : newValue.add(permission);
      return newValue;
    });
  }

  function save() {
    mutate({ permissions: Array.from(checked) });
  }
  return (
    <>
      <div className="flex flex-col gap-2">
        {permissions?.data.map((permission) => (
          <FieldGroup key={permission.slug}>
            <Field orientation={"horizontal"}>
              <Checkbox
                id={permission.slug}
                name={permission.name}
                checked={checked.has(permission.slug)}
                onCheckedChange={() => toggleChecked(permission.slug)}
              />
              <FieldContent>
                <FieldLabel htmlFor={permission.slug}>
                  {permission.name}
                </FieldLabel>
                <FieldDescription>{permission.description}</FieldDescription>
              </FieldContent>
            </Field>
          </FieldGroup>
        ))}
      </div>
      {hasFormChange && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/80 bg-background/95 p-3 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4">
            <span className="text-xs text-muted-foreground">
              Perubahan belum disimpan.
            </span>
            <div className="flex gap-2">
              <Button
                variant={"outline"}
                size="sm"
                onClick={() => role && setChecked(new Set(role.permissions))}
                disabled={isPending}
              >
                <IconRotate className="size-3.5" /> Batal
              </Button>
              <Button size="sm" onClick={() => save()} disabled={isPending}>
                <IconDeviceFloppy className="size-3.5" />{" "}
                {isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
