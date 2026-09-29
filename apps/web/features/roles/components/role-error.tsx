import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconRefresh } from "@tabler/icons-react";

export function RoleError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="ring-destructive/20">
      <CardHeader>
        <CardTitle>Role belum dapat dimuat</CardTitle>
        <CardDescription>
          Terjadi kendala saat mengambil data akses. Silakan coba kembali.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={onRetry}>
          <IconRefresh data-icon="inline-start" aria-hidden="true" />
          Coba lagi
        </Button>
      </CardContent>
    </Card>
  );
}