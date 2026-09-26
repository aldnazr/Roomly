"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRoles } from "@/features/roles/use-roles";
import { UserCreatePayload } from "@/features/users/types";
import { useUserCreate } from "@/features/users/use-users";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, SyntheticEvent } from "react";

export default function UserUpdate() {
  const { userId } = useParams<{ userId: string }>();
  const { mutate, isPending } = useUserCreate();
  const { data: listRole } = useRoles();
  const router = useRouter();

  const roleItems =
    listRole?.data.map((item) => ({
      label: item.name,
      value: item.slug,
    })) ?? [];

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: UserCreatePayload = {
      username: String(formData.get("username")),
      email: String(formData.get("email")),
      password: String(formData.get("password")),
      role: String(formData.get("role")),
    };
    mutate(data, {
      onSuccess: () => {
        router.push("/user");
      },
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <FieldSet>
          <FieldLegend>
            {userId && userId !== "create" ? "Update User" : "Create User"}
          </FieldLegend>
          <FieldDescription>
            {userId && userId !== "create" ?
              "Update account details and role assignment"
            : "Enter account details to register a new user"}
          </FieldDescription>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                name="username"
                placeholder="Username"
                type="text"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                placeholder="youremail@example.com"
                type="email"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                placeholder="Enter your password"
                type="password"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="role">Roles</FieldLabel>
              <Select name="role" items={roleItems}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Roles</SelectLabel>
                    {roleItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldDescription>
                Choose a role for this account
              </FieldDescription>
            </Field>
          </FieldGroup>
        </FieldSet>
        <Field orientation="horizontal">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit"}
          </Button>
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
