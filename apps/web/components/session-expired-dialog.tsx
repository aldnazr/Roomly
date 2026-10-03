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
import { useSessionExpired } from "@/lib/store/session-expired";

export function SessionExpiredDialog() {
  const open = useSessionExpired((s) => s.open);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) useSessionExpired.setState({ open: false });
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
