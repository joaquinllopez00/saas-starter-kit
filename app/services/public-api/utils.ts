import { findApiKeyByKey } from "~/services/db/api-keys.server";
import { findOrganizationById } from "~/services/db/organizations.server";
import type { Issue, Organization } from "~/services/db/types";
import { PublicApiIssueSchema } from "~/services/public-api/schemas";

export const getOrganizationFromApiKey = async (
  request: Request,
): Promise<Organization | null> => {
  const apiKeyString = request.headers.get("X-API-Key");
  if (!apiKeyString) {
    return null;
  }
  const apiKey = await findApiKeyByKey(apiKeyString);
  if (!apiKey) {
    return null;
  }
  const organization = await findOrganizationById(apiKey.organizationId);
  if (!organization) {
    return null;
  }
  return organization;
};

// We want a strict public contract for the API response so it doesn't break as we evolve the app.
export const serializeIssueForApi = (issue: Issue) => {
  return PublicApiIssueSchema.parse(issue);
};
