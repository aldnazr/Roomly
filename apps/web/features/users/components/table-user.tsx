import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserResponse } from "@/features/users/types";
import { useUserDelete } from "@/features/users/use-users";
import {
  IconDots,
  IconPencil,
  IconTrash,
  IconUsersGroup,
} from "@tabler/icons-react";
import Link from "next/link";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function TableUser({ users }: { users: UserResponse | undefined }) {
  const { mutate, isPending, isError } = useUserDelete();
  const userList = users?.data ?? [];

  return (
    <div className="flex flex-col gap-3">
      {isError && (
        <p
          role="alert"
          className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          Pengguna gagal dihapus. Silakan coba kembali.
        </p>
      )}

      <Table className="min-w-190">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Pengguna</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-16 text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userList.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={5} className="h-56 text-center">
                <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <IconUsersGroup
                      className="size-5"
                      stroke={1.5}
                      aria-hidden="true"
                    />
                  </span>
                  <p className="font-medium">Belum ada pengguna</p>
                  <p className="text-sm whitespace-normal text-muted-foreground">
                    Tambahkan akun pertama untuk mulai membangun tim.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}

          {userList.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar size="lg">
                    <AvatarFallback className="bg-primary/10 font-medium text-primary">
                      {getInitials(user.name || user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="max-w-52 truncate font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ID {user.id}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {user.email}
              </TableCell>
              <TableCell>
                <code className="rounded-lg bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
                  @{user.username}
                </code>
              </TableCell>
              <TableCell>
                <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium capitalize text-primary">
                  {user.role}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={isPending}
                        aria-label={`Buka aksi untuk ${user.name}`}
                      >
                        <IconDots stroke={1.5} aria-hidden="true" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        render={<Link href={`/user/${user.id}`} />}
                      >
                        <IconPencil stroke={1.5} aria-hidden="true" />
                        Edit pengguna
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        variant="destructive"
                        disabled={isPending}
                        onClick={() => mutate({ id: user.id.toString() })}
                      >
                        <IconTrash stroke={1.5} aria-hidden="true" />
                        {isPending ? "Menghapus..." : "Hapus pengguna"}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
