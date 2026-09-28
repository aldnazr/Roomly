"use client";

import { useUser } from "@/features/users/use-users";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { TableSkeleton } from "@/features/users/components/table-skeleton";
import { TableUser } from "@/features/users/components/table-user";

export default function UserPage() {
  const { data, isLoading } = useUser();
  const router = useRouter();

  return (
    <div className="flex flex-col items-end gap-4">
      <Button onClick={() => router.push("/user/create")}>Create User</Button>
      {isLoading ?
        <TableSkeleton />
      : <TableUser users={data} />}
    </div>
  );
}
