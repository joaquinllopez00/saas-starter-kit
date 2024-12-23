import type { ActionFunctionArgs } from "@remix-run/node";
import type { ClientActionFunctionArgs } from "@remix-run/react";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";
import { Card, CardContent } from "~/components/ui/card";
import { ErrorList } from "~/components/ui/error-list";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { PasswordSchema } from "~/services/auth/validation-schemas";
import {
  parseFormDataAndValidate,
  returnFormErrorJsonResponse,
  returnFormErrorsJsonResponse,
} from "~/utils/form.server";

import { AuthCardFooter } from "~/components/auth/auth-card-footer";
import { AuthCardHeader } from "~/components/auth/auth-card-header";
import { formValidationClientAction } from "~/components/forms/form-validation-client-action";
import { updateUserPassword } from "~/services/db/user-passwords.server";
import { findUserById } from "~/services/db/users.server";
import {
  deleteVerificationToken,
  findVerificationTokenByCode,
} from "~/services/db/verification-tokens.server";
import { redirectWithToast } from "~/services/toast/toast.server";
import { hashPassword } from "~/utils/passwords";

const ResetPasswordSchema = z
  .object({
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export async function action({ request }: ActionFunctionArgs) {
  const parsed = await parseFormDataAndValidate(request, ResetPasswordSchema);
  if (!parsed.success) {
    return returnFormErrorsJsonResponse(parsed);
  }
  const { password } = parsed.data;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return returnFormErrorJsonResponse<typeof ResetPasswordSchema>(
      "Invalid reset password link",
      400,
    );
  }

  const token = await findVerificationTokenByCode(code, "password-reset");
  if (!token) {
    return returnFormErrorJsonResponse<typeof ResetPasswordSchema>(
      "Invalid reset password link",
      400,
    );
  }

  const user = await findUserById(token.userId);
  const hashedPassword = await hashPassword(password);
  await updateUserPassword(user.id, hashedPassword);

  await deleteVerificationToken(token.id);
  return redirectWithToast("/login", {
    title: "Your password has been successfully reset",
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
    validationSchema: ResetPasswordSchema,
  });

export default function ResetPassword() {
  const actionData = useActionData<typeof action>();

  return (
    <Form method={"post"}>
      <Card>
        <AuthCardHeader
          title={"Reset password"}
          description={"Enter your new password"}
        />
        <CardContent className="grid gap-4">
          <div className={"grid gap-4"}>
            <div className="grid gap-2">
              <Label htmlFor="password">New password</Label>
              <Input name="password" type="password" />
              <ErrorList
                errors={
                  !actionData?.success ? actionData?.fieldErrors.password : []
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input name="confirmPassword" type="password" />
              <ErrorList
                errors={
                  !actionData?.success
                    ? actionData?.fieldErrors.confirmPassword
                    : []
                }
              />
            </div>
            <ErrorList
              errors={!actionData?.success ? actionData?.formErrors : []}
            />
          </div>
        </CardContent>
        <AuthCardFooter
          buttonText={"Reset password"}
          helpLinkText={"Back to login"}
          helpText={"Remember your password?"}
          helpLinkTo={"/login"}
        />
      </Card>
    </Form>
  );
}
