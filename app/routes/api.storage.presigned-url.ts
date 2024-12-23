import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { uuidv4 } from "~/lib/string";
import { findUserOrganizations } from "~/services/db/organizations.server";
import { ALLOWED_UPLOAD_FILE_TYPES } from "~/services/storage/constants";
import { storageClient } from "~/services/storage/storage-service.server";
import { sanitizeFilename } from "~/services/storage/utils";
import { getUserIdFromSession } from "~/utils/sessions.server";

const PresignedPostUrlRequestSchema = z.object({
  // We want to prefix with organizationId if the upload is organization-specific
  // rather than user-specific
  organizationId: z.string().transform(Number).optional(),
  fileName: z.string().transform(sanitizeFilename),
  contentType: z
    .string()
    .refine((value) => ALLOWED_UPLOAD_FILE_TYPES.includes(value.toLowerCase())),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  if (!storageClient) {
    return null;
  }
  const form = Object.fromEntries(await request.formData());
  const parsed = PresignedPostUrlRequestSchema.safeParse(form);
  if (!parsed.success) {
    return json({ errors: parsed.error }, { status: 400 });
  }
  const { contentType, fileName, organizationId } = parsed.data;
  const userId = await getUserIdFromSession(request);
  let key = `${userId}/${uuidv4()}-${fileName}`;
  if (organizationId) {
    const memberships = await findUserOrganizations(userId);
    const membership = memberships.find(
      (m) => m.id === parsed.data.organizationId,
    );
    if (!membership) {
      return json(
        { errors: ["You are not a member of that organization."] },
        { status: 400 },
      );
    }
    key = `${organizationId}/${key}`;
  }
  const url = await storageClient.generateSignedUploadUrl(key, contentType);
  return json({ url, key });
};
