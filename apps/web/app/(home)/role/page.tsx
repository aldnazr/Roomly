"use client";

import { fetchRole } from "@/services/roles/fetch-role";
import { useQuery } from "@tanstack/react-query";

export default function RolePage() {
  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["fetchRole"],
    queryFn: fetchRole,
  });

  return (
    <div>
      {data?.data.data.map((e) => (
        <h1 key={e.slug}>{e.name}</h1>
      ))}
    </div>
  );
}
