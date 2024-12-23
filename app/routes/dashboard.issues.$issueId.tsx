import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  useFetcher,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { TagIcon } from "lucide-react";
import { z } from "zod";
import {
  issueLabelLabels,
  issuePriorityLabels,
  issueStatusLabels,
} from "~/components/issues/labels";
import type {
  IssueLabel,
  IssuePriority,
  IssueStatus,
} from "~/components/issues/types";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ErrorList } from "~/components/ui/error-list";
import { FormSelect } from "~/components/ui/form/form-select";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  issueLabelEnumValues,
  issuePriorityEnumValues,
  issueStatusEnumValues,
} from "~/drizzle/constants";
import {
  findIssueForUserOrganization,
  updateIssue,
} from "~/services/db/issues.server";
import { redirectWithToast } from "~/services/toast/toast.server";
import {
  parseFormDataAndValidate,
  returnFormErrorsJsonResponse,
} from "~/utils/form.server";
import { getUserIdFromSession } from "~/utils/sessions.server";

const IssueFormSchema = z.object({
  title: z.string(),
  description: z.string(),
  label: z.enum(issueLabelEnumValues),
  status: z.enum(issueStatusEnumValues),
  priority: z.enum(issuePriorityEnumValues),
});

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const parsed = await parseFormDataAndValidate(request, IssueFormSchema);
  if (!parsed.success) {
    return returnFormErrorsJsonResponse(parsed);
  }
  const issueId = params.issueId;
  const userId = await getUserIdFromSession(request);
  const issue = await findIssueForUserOrganization(Number(issueId), userId);
  if (!issue) {
    return redirect("/dashboard/issues");
  }
  await updateIssue(issue.id, {
    title: parsed.data.title,
    status: parsed.data.status,
    priority: parsed.data.priority,
    label: parsed.data.label,
    description: parsed.data.description,
  });
  return redirectWithToast("/dashboard/issues/", {
    title: "Issue updated",
  });
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await getUserIdFromSession(request);
  const issueId = params.issueId;
  const issue = await findIssueForUserOrganization(Number(issueId), userId);
  if (!issue) {
    return redirect("/dashboard/issues");
  }
  return { issue };
};

export default function DashboardIssuesIssueId() {
  const navigate = useNavigate();
  const { issue } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher<typeof action>();
  const isEditMode = searchParams.get("edit") === "1";

  const enterEditMode = () => {
    searchParams.set("edit", "1");
    setSearchParams(searchParams);
  };

  const label = issueLabelLabels.find((label) => label.value === issue.label);
  const status = issueStatusLabels.find(
    (status) => status.value === issue.status,
  );
  const priority = issuePriorityLabels.find(
    (priority) => priority.value === issue.priority,
  );

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          navigate("/dashboard/issues");
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {!isEditMode ? issue.title : `Editing ${issue.title}`}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription asChild>
          <div>
            {!isEditMode ? (
              <div className={"mt-2 flex flex-col gap-6"}>
                {issue.description ? (
                  <span className={"text-foreground"}>{issue.description}</span>
                ) : (
                  <span className={"text-muted-foreground"}>
                    No description
                  </span>
                )}
                <div className={"flex flex-row gap-4"}>
                  <div className={"flex flex-row items-center"}>
                    <TagIcon className={"mr-1 h-4 w-4"} />
                    <Badge variant={"outline"}>{label?.label}</Badge>
                  </div>
                  <div className={"flex flex-row items-center"}>
                    {status?.icon && <status.icon className={"mr-1 h-4 w-4"} />}
                    <Badge variant={"outline"}>{status?.label}</Badge>
                  </div>
                  <div className={"flex flex-row items-center"}>
                    {priority?.icon && (
                      <priority.icon className={"mr-1 h-4 w-4"} />
                    )}
                    <Badge variant={"outline"}>{priority?.label}</Badge>
                  </div>
                </div>
              </div>
            ) : (
              <fetcher.Form
                method={"post"}
                className={"flex flex-col gap-4"}
                id={"update-issue-form"}
              >
                <div className="grid w-full gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" defaultValue={issue.title} />
                  <ErrorList
                    errors={
                      !fetcher.data?.success
                        ? fetcher.data?.fieldErrors.title
                        : []
                    }
                  />
                </div>
                <div className="grid w-full gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={issue.description || ""}
                  />
                  <ErrorList
                    errors={
                      !fetcher.data?.success
                        ? fetcher.data?.fieldErrors.description
                        : []
                    }
                  />
                </div>
                <FormSelect
                  label={"Label"}
                  name={"label"}
                  options={issueLabelLabels}
                  defaultValue={issue.label as IssueLabel}
                  errors={
                    !fetcher.data?.success
                      ? fetcher.data?.fieldErrors.label
                      : []
                  }
                />
                <FormSelect
                  label={"Status"}
                  name={"status"}
                  options={issueStatusLabels}
                  defaultValue={issue.status as IssueStatus}
                  errors={
                    !fetcher.data?.success
                      ? fetcher.data?.fieldErrors.status
                      : []
                  }
                />
                <FormSelect
                  label={"Priority"}
                  name={"priority"}
                  options={issuePriorityLabels}
                  defaultValue={issue.priority as IssuePriority}
                  errors={
                    !fetcher.data?.success
                      ? fetcher.data?.fieldErrors.priority
                      : []
                  }
                />
              </fetcher.Form>
            )}
            <ErrorList
              errors={!fetcher.data?.success ? fetcher.data?.formErrors : []}
            />
          </div>
        </DialogDescription>
        <DialogFooter className={"gap-2"}>
          <DialogClose asChild>
            <Button variant={"outline"}>
              {isEditMode ? "Cancel" : "Close"}
            </Button>
          </DialogClose>
          {isEditMode ? (
            <Button
              type="submit"
              variant={"default"}
              form={"update-issue-form"}
              disabled={fetcher.state === "loading"}
              onClick={(event) => {
                fetcher.submit(event.currentTarget.form);
              }}
            >
              Save
            </Button>
          ) : (
            <Button onClick={enterEditMode} variant={"secondary"}>
              Edit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
