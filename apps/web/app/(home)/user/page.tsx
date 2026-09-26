"use client";

import { useUser } from "@/features/users/use-users";
import { TableUser } from "./_components/table-user";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeleton } from "./_components/table-skeleton";

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
