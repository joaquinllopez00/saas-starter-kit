import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useRef, useState } from "react";
import { z } from "zod";
import { IdentityProvider } from "~/components/dashboard-settings/identity-provider";
import { useResetFormAfterSuccess } from "~/components/forms/hooks/use-reset-form-after-success";
import DashboardSettingsPageLayout from "~/components/layouts/dashboard-settings-page-layout";
import { Alert } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ErrorList } from "~/components/ui/error-list";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { capitalize } from "~/lib/string";
import type { ProviderName } from "~/services/auth/types";
import { PasswordSchema } from "~/services/auth/validation-schemas";
import {
  findUserByIdWithIdentities,
  findUserWithPasswordById,
} from "~/services/db/users.server";
import { returnJsonSuccessWithToast } from "~/services/toast/toast.server";
import {
  parseFormDataAndValidate,
  returnFormErrorsJsonResponse,
  returnFormFieldErrorJsonResponse,
} from "~/utils/form.server";
import { comparePassword } from "~/utils/passwords";
import {
  getUserIdFromSession,
  getUserIdFromSessionWithIdentity,
} from "~/utils/sessions.server";
import { updateEmailPasswordUser } from "~/utils/utils";

const UpdatePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: PasswordSchema,
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { userId, authMethod, providerName } =
    await getUserIdFromSessionWithIdentity(request);
  const user = await findUserByIdWithIdentities(userId);
  return {
    hasPasswordLogin: user?.hasPasswordLogin,
    identities: user.identities,
    authMethod,
    currentlyLoggedInProvider: providerName,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const parsed = await parseFormDataAndValidate(request, UpdatePasswordSchema);
  if (!parsed.success) {
    return returnFormErrorsJsonResponse(parsed);
  }
  const userId = await getUserIdFromSession(request);
  const user = await findUserWithPasswordById(userId);
  if (!user || !user?.passwordHash) {
    return returnFormFieldErrorJsonResponse<typeof UpdatePasswordSchema>(
      "currentPassword",
      "You are using a provider to log in. You cannot update your password.",
    );
  }
  const isCorrectPassword = await comparePassword(
    parsed.data.currentPassword,
    user.passwordHash,
  );
  if (!isCorrectPassword) {
    return returnFormFieldErrorJsonResponse<typeof UpdatePasswordSchema>(
      "currentPassword",
      "Incorrect password",
    );
  }

  await updateEmailPasswordUser({
    userId,
    passwordRaw: parsed.data.newPassword,
  });

  return returnJsonSuccessWithToast({
    title: "Password updated",
  });
};
export default function DashboardSettingsSecurity() {
  const { hasPasswordLogin, identities, currentlyLoggedInProvider } =
    useLoaderData<typeof loader>();
  const canDisconnectProvider =
    (!hasPasswordLogin && identities.length > 1) ||
    (hasPasswordLogin && identities.length === 1);
  const passwordFetcher = useFetcher<typeof action>();
  const disconnectFetcher = useFetcher();
  const isPending = passwordFetcher.state !== "idle";
  const formRef = useRef<HTMLFormElement>(null);
  const [providerToDisconnect, setProviderToDisconnect] =
    useState<ProviderName | null>(null);
  const navigation = useNavigation();

  useResetFormAfterSuccess(formRef, passwordFetcher.data);

  return (
    <DashboardSettingsPageLayout
      title={"Security"}
      subtitle={"Manage your identities and password"}
    >
      {identities.length > 0 && (
        <>
          <div className={"flex flex-col space-y-2 mb-4"}>
            <span className={"text-md font-medium"}>Connected providers</span>
            <ul>
              {identities.map((identity) => (
                <li key={identity.providerName} className={"w-full my-2"}>
                  <IdentityProvider
                    providerName={identity.providerName}
                    createdAt={identity.createdAt}
                    isCurrentlyLoggedInProvider={
                      identity.providerName === currentlyLoggedInProvider
                    }
                    buttonDisabled={!canDisconnectProvider}
                    onDisconnect={() =>
                      setProviderToDisconnect(identity.providerName)
                    }
                  />
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
      {identities.length > 0 && hasPasswordLogin && (
        <Separator className={"mb-4"} />
      )}
      {hasPasswordLogin && (
        <div className={"flex flex-col gap-4"}>
          <span className={"text-md font-medium"}>Password</span>
          <passwordFetcher.Form
            className={"space-y-8"}
            method={"post"}
            ref={formRef}
          >
            <div className="grid w-full gap-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input name="currentPassword" type="password" />
              <ErrorList
                errors={
                  !passwordFetcher.data?.success
                    ? passwordFetcher.data?.fieldErrors.currentPassword
                    : []
                }
              />
            </div>
            <div className="grid w-full gap-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input name="newPassword" type="password" />
              <ErrorList
                errors={
                  !passwordFetcher.data?.success
                    ? passwordFetcher.data?.fieldErrors.newPassword
                    : []
                }
              />
            </div>

            <Button type="submit" disabled={isPending}>
              Update password
            </Button>
          </passwordFetcher.Form>
        </div>
      )}
      <Dialog
        open={providerToDisconnect !== null}
        onOpenChange={() => setProviderToDisconnect(null)}
      >
        {providerToDisconnect && (
          <DialogContent>
            <Form method="post" className={"space-y-4"}>
              <DialogHeader className={"space-y-2"}>
                <DialogTitle>
                  Disconnect {capitalize(providerToDisconnect)}?
                </DialogTitle>
              </DialogHeader>
              <DialogDescription asChild>
                <div>
                  {providerToDisconnect && (
                    <div>
                      You will no longer be able to log in with{" "}
                      {capitalize(providerToDisconnect)}
                    </div>
                  )}
                  {providerToDisconnect === currentlyLoggedInProvider && (
                    <Alert variant={"destructive"} className={"mt-4"}>
                      You are currently logged in with{" "}
                      {capitalize(providerToDisconnect)}. If you disconnect, you
                      will be logged out.
                    </Alert>
                  )}
                </div>
              </DialogDescription>
              <DialogFooter>
                <Button variant={"secondary"}>Cancel</Button>
                <Button
                  disabled={navigation.state === "submitting"}
                  type={"submit"}
                  onClick={() => {
                    disconnectFetcher.submit(
                      {},
                      {
                        method: "post",
                        action: `/api/${providerToDisconnect}/disconnect`,
                      },
                    );
                    setProviderToDisconnect(null);
                  }}
                >
                  Disconnect
                </Button>
              </DialogFooter>
            </Form>
          </DialogContent>
        )}
      </Dialog>
    </DashboardSettingsPageLayout>
  );
}
