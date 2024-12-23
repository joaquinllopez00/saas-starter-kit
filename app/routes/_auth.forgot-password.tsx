import type { ActionFunctionArgs } from "@remix-run/node";
import type { ClientActionFunctionArgs } from "@remix-run/react";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";
import { Card, CardContent } from "~/components/ui/card";
import { ErrorList } from "~/components/ui/error-list";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { EmailSchema } from "~/services/auth/validation-schemas";
import {
  parseFormDataAndValidate,
  returnFormErrorsJsonResponse,
} from "~/utils/form.server";

import { AuthCardFooter } from "~/components/auth/auth-card-footer";
import { AuthCardHeader } from "~/components/auth/auth-card-header";
import { formValidationClientAction } from "~/components/forms/form-validation-client-action";
import { generateResetToken } from "~/services/auth/utils";
import { findUserByEmailWithIdentities } from "~/services/db/users.server";
import { upsertVerificationToken } from "~/services/db/verification-tokens.server";
import { sendPasswordResetEmail } from "~/services/email/email.server";
import {
  redirectWithToast,
  returnJsonSuccessWithToast,
} from "~/services/toast/toast.server";

const ForgotPasswordSchema = z.object({
  email: EmailSchema,
});

export async function action({ request }: ActionFunctionArgs) {
  const parsed = await parseFormDataAndValidate(request, ForgotPasswordSchema);
  if (!parsed.success) {
    return returnFormErrorsJsonResponse(parsed);
  }
  const { email } = parsed.data;
  const user = await findUserByEmailWithIdentities(email);
  if (!user) {
    return returnJsonSuccessWithToast({
      title: "If an account with that email exists, we sent you an email",
    });
  }
  const resetToken = generateResetToken();
  await upsertVerificationToken(
    user.id,
    "password-reset",
    {
      secret: resetToken,
      code: resetToken,
    },
    60 * 60 * 24, // 24 hours
  );
  const passwordResetLink = `${process.env.APP_URL}/reset-password?code=${resetToken}`;
  sendPasswordResetEmail({
    to: email,
    resetLink: passwordResetLink,
  });

  return redirectWithToast("/login", {
    title: "If an account with that email exists, we sent you an email",
  });
}

export const clientAction = async ({
  request,
  params,
  serverAction,
}: ClientActionFunctionArgs) =>
  formValidationClientAction({
    request,
    serverAction,
    params,
    validationSchema: ForgotPasswordSchema,
  });

export default function ForgotPassword() {
  const actionData = useActionData<typeof action>();

  return (
    <Form method={"post"}>
      <Card>
        <AuthCardHeader
          title={"Forgot password"}
          description={"Enter your email to receive a password reset link"}
        />
        <CardContent className="grid gap-4">
          <div className={"grid gap-4"}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="dustin@hawkins.com"
              />
              <ErrorList
                errors={
                  !actionData?.success ? actionData?.fieldErrors.email : []
                }
              />
            </div>
          </div>
        </CardContent>
        <AuthCardFooter
          buttonText={"Send reset link"}
          helpLinkText={"Back to login"}
          helpText={"Remember your password?"}
          helpLinkTo={"/login"}
        />
      </Card>
    </Form>
  );
}
