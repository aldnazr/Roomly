"use client";

import { IconLock } from "@tabler/icons-react";
import { signOut } from "next-auth/react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSessionStore } from "@/lib/store/session-store";

export function SessionExpiredDialog() {
  const open = useSessionStore((state) => state.open);
  const hideSessionExpired = useSessionStore((state) => state.hideSessionExpired);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) hideSessionExpired();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <IconLock aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>Sesi telah berakhir</AlertDialogTitle>
          <AlertDialogDescription>
            Harap Masuk kembali untuk melanjutkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => signOut({ redirectTo: "/login" })}>
            Masuk kembali
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
