import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { findIssuesByOrganizationId } from "~/services/db/issues.server";
import { PublicApiQueryParams } from "~/services/public-api/schemas";
import {
  getOrganizationFromApiKey,
  serializeIssueForApi,
} from "~/services/public-api/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const organization = await getOrganizationFromApiKey(request);
  if (!organization) {
    return json({ message: "Invalid API key" }, { status: 401 });
  }
  const url = new URL(request.url);
  const parsedParams = PublicApiQueryParams.safeParse({
    limit: url.searchParams.get("limit"),
    offset: url.searchParams.get("offset"),
  });
  const { limit, offset } = parsedParams.success
    ? parsedParams.data
    : {
        limit: 10,
        offset: 0,
      };

  const issues = await findIssuesByOrganizationId(
    organization.id,
    limit,
    offset,
  );

  const issuesList = issues.map(serializeIssueForApi);
  return json({ issues: issuesList });
}
