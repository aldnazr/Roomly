"use client";

import { useRoles } from "@/features/roles/use-roles";
import { useQuery } from "@tanstack/react-query";

export default function RolePage() {
  const { isLoading, isError, error, data } = useRoles();

  return (
    <div>
      {data?.data.map((e) => (
        <h1 key={e.slug}>{e.name}</h1>
      ))}
    </div>
  );
}
