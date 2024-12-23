import { Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import type { ProviderName } from "~/services/auth/types";

import type { IconProperty } from "~/components/types";

export const SocialAuthButton = ({
  provider,
  title,
  icon,
}: {
  provider: ProviderName;
  title: string;
  icon: IconProperty;
}) => {
  const Icon = icon;
  return (
    <Form method={"post"} action={`/auth/${provider}`}>
      <Button variant="outline" className={"w-full"}>
        <Icon className={"mr-2 h-4 w-4"} />
        {title}
      </Button>
    </Form>
  );
};
