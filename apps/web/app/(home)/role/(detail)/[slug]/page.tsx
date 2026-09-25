"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useRoleDetail } from "@/features/roles/use-roles";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoleDetail() {
  const { slug: roleSlug } = useParams<{ slug: string }>();
  const { permissions, roles, isLoading, isError, error } = useRoleDetail();

  const role = roles?.data.find((e) => e.slug === roleSlug);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (role) {
      setChecked(new Set(role.permissions));
    }
  }, [role]);

  function toggle(slug: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }

  return (
    <>
      {permissions?.data.map((permission) => (
        <FieldGroup key={permission.slug}>
          <Field orientation={"horizontal"}>
            <Checkbox
              id={permission.slug}
              name={permission.name}
              checked={checked.has(permission.slug)}
              onCheckedChange={() => toggle(permission.slug)}
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
    </>
  );
}
