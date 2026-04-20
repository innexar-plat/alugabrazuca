import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { AuthGuard } from "@/components/providers/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1 bg-[hsl(var(--muted))]">
        <AuthGuard>{children}</AuthGuard>
      </main>
      <PublicFooter />
    </div>
  );
}
