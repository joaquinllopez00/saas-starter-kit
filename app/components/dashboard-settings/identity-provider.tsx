import { GithubIcon } from "lucide-react";
import { GoogleIcon } from "~/assets/icons/google-icon";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { formatLocalDate } from "~/components/util/date";
import { capitalize } from "~/lib/string";
import type { ProviderName } from "~/services/auth/types";

export const IdentityProvider = ({
  providerName,
  createdAt,
  onDisconnect,
  isCurrentlyLoggedInProvider,
  buttonDisabled,
}: {
  providerName: ProviderName | "email";
  createdAt: string;
  onDisconnect: () => void;
  isCurrentlyLoggedInProvider: boolean;
  buttonDisabled: boolean;
}) => {
  return (
    <div className="p-4 border rounded-md flex flex-row items-center justify-between">
      <div className={"flex flex-row items-center space-x-2"}>
        {providerName === "github" && <GithubIcon className={"h-5 w-5"} />}
        {providerName === "google" && <GoogleIcon className={"h-5 w-5"} />}
        <div className={"flex flex-col"}>
          <span className={"text-sm"}>{capitalize(providerName)}</span>
          <span className={"text-sm text-muted-foreground"}>
            Connected on {formatLocalDate(createdAt)}
          </span>
        </div>
      </div>
      <div>
        {isCurrentlyLoggedInProvider && (
          <Badge className={"mr-2"}>Current</Badge>
        )}
        <Button
          size={"sm"}
          variant={"secondary"}
          onClick={onDisconnect}
          disabled={buttonDisabled}
        >
          Disconnect
        </Button>
      </div>
    </div>
  );
};
