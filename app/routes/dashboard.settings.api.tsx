import { CopyIcon, TrashIcon } from "@radix-ui/react-icons";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { KeyIcon } from "lucide-react";
import { z } from "zod";
import { ViewOnlyAlert } from "~/components/dashboard/view-only-alert";
import DashboardSettingsPageLayout from "~/components/layouts/dashboard-settings-page-layout";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { ErrorList } from "~/components/ui/error-list";
import { Input } from "~/components/ui/input";
import { InputDescription } from "~/components/ui/input-description";
import { Label } from "~/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { toast } from "~/components/ui/use-toast";
import { formatLocalDate } from "~/components/util/date";
import { generateApiKey } from "~/lib/public-api";
import { cn } from "~/lib/utils";
import {
  deleteApiKeyById,
  findApiKeyById,
  findApiKeysByUserOrganizationId,
  insertApiKey,
} from "~/services/db/api-keys.server";
import { validateUserRoleHasPermission } from "~/services/db/permissions.server";
import { findUserWithOrganizationById } from "~/services/db/users.server";
import { returnJsonSuccessWithToast } from "~/services/toast/toast.server";
import {
  parseFormDataAndValidate,
  returnFormErrorJsonResponse,
  returnFormErrorsJsonResponse,
} from "~/utils/form.server";
import { getUserIdFromSession } from "~/utils/sessions.server";

const SaveApiKeySchema = z.object({
  name: z.string().min(1),
  apiKey: z.string().min(64),
});

const DeleteApiKeySchema = z.object({
  id: z.string().transform((value) => parseInt(value, 10)),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await getUserIdFromSession(request);
  const user = await findUserWithOrganizationById(userId);
  const formPayload = Object.fromEntries(await request.formData());
  if (formPayload._action === "create") {
    const apiKey = generateApiKey();
    return { apiKey, success: true as const };
  }
  if (formPayload._action === "save") {
    const parsed = await parseFormDataAndValidate(
      request,
      SaveApiKeySchema,
      formPayload,
    );
    if (!parsed.success) {
      return returnFormErrorsJsonResponse(parsed);
    }
    const { name, apiKey } = parsed.data;
    await insertApiKey({
      key: apiKey,
      organizationId: user.defaultOrganizationId,
      name,
    });
    return returnJsonSuccessWithToast({
      title: "API key saved",
    });
  }
  if (formPayload._action === "delete") {
    const parsed = await parseFormDataAndValidate(
      request,
      DeleteApiKeySchema,
      formPayload,
    );
    if (!parsed.success) {
      return returnFormErrorsJsonResponse(parsed);
    }
    const { id } = parsed.data;
    const apiKey = await findApiKeyById(id);
    if (!apiKey || apiKey.organizationId !== user.defaultOrganizationId) {
      return returnFormErrorJsonResponse<typeof DeleteApiKeySchema>(
        "API key not found",
        400,
      );
    }
    await deleteApiKeyById(id);
    return returnJsonSuccessWithToast({
      title: "API key deleted",
    });
  }
  return null;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserIdFromSession(request);
  const apiKeys = await findApiKeysByUserOrganizationId(userId);
  const canEdit = await validateUserRoleHasPermission(
    userId,
    ["write"],
    "settings",
  );
  return { apiKeys, canEdit };
};

export default function DashboardSettingsSecurity() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const isSaveStep = !!fetcher.data && "apiKey" in fetcher.data;

  const apiKeyResponseValue =
    fetcher.data?.success && "apiKey" in fetcher.data
      ? (fetcher?.data?.apiKey as string)
      : "";

  return (
    <DashboardSettingsPageLayout
      title={"API"}
      subtitle={
        <div>
          Manage your API keys. API documentation is available{" "}
          <Link className={"underline text-primary"} to={"/api/public/v1/docs"}>
            here
          </Link>
        </div>
      }
    >
      {!data.canEdit && (
        <ViewOnlyAlert>
          You don't have permission to create or delete
        </ViewOnlyAlert>
      )}
      {data.canEdit && (
        <>
          {data.apiKeys.length === 0 ? (
            <Alert>
              <KeyIcon className="h-4 w-4" />
              <AlertTitle>No keys yet</AlertTitle>
              <AlertDescription>
                You don't have any API keys yet. Create one below.
              </AlertDescription>
            </Alert>
          ) : (
            <Table className={"space-y-4"}>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell>{apiKey.name}</TableCell>
                    <TableCell>
                      <code
                        className={"text-xs text-muted-foreground"}
                      >{`${"*".repeat(8)}...${apiKey.lastCharacters}`}</code>
                    </TableCell>
                    <TableCell>{formatLocalDate(apiKey.createdAt)}</TableCell>
                    <TableCell>
                      {apiKey.lastUsedAt
                        ? formatLocalDate(apiKey.createdAt)
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <fetcher.Form method={"post"}>
                        <input
                          type="hidden"
                          name="id"
                          value={apiKey.id.toString()}
                        />
                        {data.canEdit && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant={"ghost"}
                                size={"sm"}
                                className={"hover:text-destructive"}
                              >
                                <TrashIcon className={"h-4 w-4"} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <fetcher.Form method={"post"}>
                                <DialogHeader>
                                  <DialogTitle>Delete API Key</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete this API
                                    key? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <input
                                    type="hidden"
                                    name="id"
                                    value={apiKey.id}
                                  />
                                  <Button
                                    type="submit"
                                    value={"delete"}
                                    name={"_action"}
                                  >
                                    Yes, delete
                                  </Button>
                                </DialogFooter>
                              </fetcher.Form>
                            </DialogContent>
                          </Dialog>
                        )}
                      </fetcher.Form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}
      {data.canEdit && (
        <Dialog>
          <DialogTrigger asChild>
            <Button className={"mt-6"} size={"sm"}>
              New API key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <fetcher.Form method={"post"}>
              <DialogHeader>
                <DialogTitle>New API key</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className={cn(isSaveStep ? "hidden" : "grid gap-2")}>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    name="name"
                    placeholder="My API key"
                    className="col-span-3"
                  />
                  <ErrorList
                    errors={
                      !fetcher.data?.success
                        ? // This is awkward to type safely because there are multiple
                          // different actions with different return types. safe to ignore
                          // @ts-expect-error
                          fetcher.data?.fieldErrors?.name
                        : []
                    }
                  />
                </div>
                {isSaveStep && (
                  <div className="grid gap-2">
                    <Label htmlFor="password">API Key</Label>
                    <div className="flex items-center space-x-2">
                      <div className="grid flex-1 gap-2">
                        <Label htmlFor="link" className="sr-only">
                          Link
                        </Label>
                        <Input
                          className="pr-10"
                          defaultValue={apiKeyResponseValue}
                          readOnly
                          name={"apiKey"}
                        />
                      </div>
                      <Button
                        size="icon"
                        variant="secondary"
                        type={"button"}
                        onClick={() => {
                          navigator.clipboard.writeText(apiKeyResponseValue);
                          toast({
                            title: "API key copied to clipboard",
                          });
                        }}
                      >
                        <CopyIcon className="h-4 w-4" />
                        <span className="sr-only">Copy API Key</span>
                      </Button>
                    </div>

                    <InputDescription>
                      This is the only time you can see this API key. Make sure
                      to save it somewhere safe.
                    </InputDescription>
                  </div>
                )}
              </div>
              <DialogFooter>
                {!isSaveStep ? (
                  <Button type="submit" value={"create"} name={"_action"}>
                    Create
                  </Button>
                ) : (
                  <DialogClose asChild>
                    <Button type="submit" value={"save"} name={"_action"}>
                      Save
                    </Button>
                  </DialogClose>
                )}
              </DialogFooter>
            </fetcher.Form>
          </DialogContent>
        </Dialog>
      )}
    </DashboardSettingsPageLayout>
  );
}
