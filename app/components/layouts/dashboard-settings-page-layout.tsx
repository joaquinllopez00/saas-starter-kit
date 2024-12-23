import type { ReactNode } from "react";
import { Separator } from "~/components/ui/separator";

export default function DashboardSettingsPageLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string | ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <span className="text-sm text-muted-foreground">{subtitle}</span>
      </div>
      <Separator />
      <div>{children}</div>
    </div>
  );
}
