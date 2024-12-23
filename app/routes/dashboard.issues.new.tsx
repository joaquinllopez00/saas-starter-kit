import type { ActionFunctionArgs } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

import {
  issueLabelLabels,
  issuePriorityLabels,
  issueStatusLabels,
} from "~/components/issues/labels";
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
import { insertIssue } from "~/services/db/issues.server";
import { findUserWithOrganizationById } from "~/services/db/users.server";
import { redirectWithToast } from "~/services/toast/toast.server";
import {
  parseFormDataAndValidate,
  returnFormErrorsJsonResponse,
} from "~/utils/form.server";
import { getUserIdFromSession } from "~/utils/sessions.server";

const NewIssueFormSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(255),
  label: z.enum(issueLabelEnumValues),
  status: z.enum(issueStatusEnumValues),
  priority: z.enum(issuePriorityEnumValues),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const parsed = await parseFormDataAndValidate(request, NewIssueFormSchema);
  if (!parsed.success) {
    return returnFormErrorsJsonResponse(parsed);
  }
  const userId = await getUserIdFromSession(request);
  const user = await findUserWithOrganizationById(userId);
  await insertIssue({
    title: parsed.data.title,
    status: parsed.data.status,
    priority: parsed.data.priority,
    label: parsed.data.label,
    description: parsed.data.description,
    organizationId: user.defaultOrganizationId,
  });
  return redirectWithToast("/dashboard/issues", { title: "Issue created" });
};

export default function DashboardIssuesIssueId() {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();

  return (
    <Dialog open={true} onOpenChange={() => navigate("/dashboard/issues")}>
      <DialogContent>
        <Form method="post" className={"space-y-4"}>
          <DialogHeader className={"space-y-2"}>
            <DialogTitle>New issue</DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <div className={"space-y-4"}>
              <div className="grid w-full gap-2">
                <Label htmlFor="title">Title</Label>
                <Input placeholder={"Get milk"} id="title" name="title" />
                <ErrorList
                  errors={
                    !actionData?.success ? actionData?.fieldErrors.title : []
                  }
                />
              </div>
              <div className="grid w-full gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  placeholder={
                    "Every day when I make my coffee, I have no milk"
                  }
                  id="description"
                  name="description"
                />
                <ErrorList
                  errors={
                    !actionData?.success
                      ? actionData?.fieldErrors.description
                      : []
                  }
                />
              </div>
              <FormSelect
                label={"Label"}
                name={"label"}
                options={issueLabelLabels}
                defaultValue={"bug"}
                errors={
                  !actionData?.success ? actionData?.fieldErrors.label : []
                }
              />
              <FormSelect
                label={"Status"}
                name={"status"}
                options={issueStatusLabels}
                defaultValue={"in progress"}
                errors={
                  !actionData?.success ? actionData?.fieldErrors.status : []
                }
              />
              <FormSelect
                label={"Priority"}
                name={"priority"}
                options={issuePriorityLabels}
                defaultValue={"low"}
                errors={
                  !actionData?.success ? actionData?.fieldErrors.priority : []
                }
              />
            </div>
          </DialogDescription>
          <DialogFooter>
            <Button
              disabled={navigation.state === "submitting"}
              type={"submit"}
            >
              Save
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
