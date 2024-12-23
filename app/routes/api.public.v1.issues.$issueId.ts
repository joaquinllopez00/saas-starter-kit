import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { findIssueByOrganizationId } from "~/services/db/issues.server";
import { PublicApiIssueIdSchema } from "~/services/public-api/schemas";
import {
  getOrganizationFromApiKey,
  serializeIssueForApi,
} from "~/services/public-api/utils";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const organization = await getOrganizationFromApiKey(request);
  if (!organization) {
    return json({ message: "Invalid API key" }, { status: 401 });
  }
  const data = PublicApiIssueIdSchema.safeParse(params.issueId);
  if (!data.success) {
    return json({ message: "Invalid issue ID" }, { status: 400 });
  }
  const issue = await findIssueByOrganizationId(data.data, organization.id);

  if (!issue) {
    return json({ message: "Issue not found" }, { status: 404 });
  }

  return json({
    ...serializeIssueForApi(issue),
  });
}
