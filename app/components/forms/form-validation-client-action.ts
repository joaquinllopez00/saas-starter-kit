import type { ClientActionFunctionArgs } from "@remix-run/react";
import type { ZodSchema } from "zod";

export const formValidationClientAction = async ({
  request,
  serverAction,
  validationSchema,
}: ClientActionFunctionArgs & {
  validationSchema: ZodSchema;
}) => {
  const clonedRequest = request.clone();
  const formPayload = Object.fromEntries(await clonedRequest.formData());
  const submission = validationSchema.safeParse(formPayload);
  if (!submission.success) {
    const errors = submission.error.flatten().fieldErrors;
    return {
      fieldErrors: errors,
      success: false,
    };
  }
  return await serverAction();
};
