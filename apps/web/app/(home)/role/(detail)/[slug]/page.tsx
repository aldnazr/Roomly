"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { usePermission } from "@/features/permissions/user-permissions";

export default function RoleDetail() {
  const { isLoading, isError, error, data } = usePermission();
  return (
    <>
      {data?.data.map((permission) => (
        <FieldGroup>
          <Field>
            <Checkbox id={permission.slug} name={permission.slug} />
            <FieldLabel htmlFor={permission.slug}>{permission.name}</FieldLabel>
          </Field>
        </FieldGroup>
      ))}
    </>
  );
}
