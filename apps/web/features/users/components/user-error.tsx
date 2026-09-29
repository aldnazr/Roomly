import { Button } from "@/components/ui/button";
import { IconRefresh } from "@tabler/icons-react";

export function UserError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-4 text-center">
      <div>
        <p className="font-medium">Data pengguna belum dapat dimuat</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Periksa koneksi server, lalu coba kembali.
        </p>
      </div>
      <Button variant="outline" onClick={onRetry}>
        <IconRefresh data-icon="inline-start" aria-hidden="true" />
        Coba lagi
      </Button>
    </div>
  );
}