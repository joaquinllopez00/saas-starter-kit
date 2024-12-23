import { LockIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export const ViewOnlyAlert = ({
  title = "View-only",
  children,
}: {
  title?: string;
  children: ReactNode;
}) => {
  return (
    <Alert className={"mb-4"}>
      <LockIcon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
};
