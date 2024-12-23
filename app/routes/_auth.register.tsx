import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { ClientActionFunctionArgs } from "@remix-run/react";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AuthCardFooter } from "~/components/auth/auth-card-footer";
import { AuthCardHeader } from "~/components/auth/auth-card-header";
import { SocialAuthButtons } from "~/components/auth/social-auth-buttons";
import { formValidationClientAction } from "~/components/forms/form-validation-client-action";
import { Card, CardContent } from "~/components/ui/card";
import { ErrorList } from "~/components/ui/error-list";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { appConfig } from "~/config/app.server";
import { featureConfig } from "~/config/features.server";
import { generateTotp } from "~/services/auth/utils";
import {
  EmailSchema,
  PasswordSchema,
} from "~/services/auth/validation-schemas";
import { findUserByEmailWithIdentities } from "~/services/db/users.server";
import { upsertVerificationToken } from "~/services/db/verification-tokens.server";
import { sendSignupVerificationEmail } from "~/services/email/email.server";
import {
  parseFormDataAndValidate,
  returnFormErrorsJsonResponse,
  returnFormFieldErrorJsonResponse,
} from "~/utils/form.server";
import { createUserSession } from "~/utils/sessions.server";
import {
  linkEmailPasswordIdentity,
  registerEmailPasswordUser,
} from "~/utils/utils";

const RegisterSchema = z
  .object({
    email: EmailSchema,
    password: PasswordSchema,
    passwordConfirmation: PasswordSchema,
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"],
  });

export async function loader() {
  return json(
    { enabledAuthProviders: appConfig.auth.providers },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    },
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const parsed = await parseFormDataAndValidate(request, RegisterSchema);
  if (!parsed.success) {
    return returnFormErrorsJsonResponse(parsed);
  }
  const { email, password } = parsed.data;
  const existingUser = await findUserByEmailWithIdentities(email);
  if (existingUser && existingUser.hasPasswordLogin) {
    return returnFormFieldErrorJsonResponse<typeof RegisterSchema>(
      "email",
      "A user already exists with this email",
      400,
    );
  }

  let user;
  // If the user already exists with another identity, link the password identity
  if (existingUser && !existingUser.hasPasswordLogin) {
    await linkEmailPasswordIdentity({
      userId: existingUser.id,
      passwordRaw: password,
    });
    if (!featureConfig.email.enabled) {
      return createUserSession(existingUser.id, "email", "/");
    }
    user = existingUser;
  } else {
    if (!featureConfig.email.enabled) {
      const user = await registerEmailPasswordUser({
        email,
        passwordRaw: password,
        isVerified: true,
      });
      return createUserSession(user.id, "email", "/");
    }
    user = await registerEmailPasswordUser({
      email,
      passwordRaw: password,
    });
  }

  const { secret, code } = generateTotp(email);
  await upsertVerificationToken(user.id, "email", {
    secret,
    code,
  });
  sendSignupVerificationEmail({
    to: user.email,
    confirmationCode: code,
  });
  return createUserSession(user.id, "email", "/verify-email");
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
    validationSchema: RegisterSchema,
  });

export default function AuthRegister() {
  const { enabledAuthProviders } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  return (
    <Form method={"post"}>
      <Card>
        <AuthCardHeader
          title={"Create an account"}
          description={"Enter your email below to create your account"}
        />
        <CardContent className="grid gap-4">
          <SocialAuthButtons authProviders={enabledAuthProviders} />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <div className={"grid gap-4"}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input name="email" type="email" placeholder="test@example.com" />
              <ErrorList
                errors={
                  !actionData?.success ? actionData?.fieldErrors.email : []
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input name="password" type="password" />
              <ErrorList
                errors={
                  !actionData?.success ? actionData?.fieldErrors.password : []
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Confirm password</Label>
              <Input name="passwordConfirmation" type="password" />
              <ErrorList
                errors={
                  !actionData?.success
                    ? actionData?.fieldErrors.passwordConfirmation
                    : []
                }
              />
            </div>
          </div>
        </CardContent>
        <AuthCardFooter
          buttonText={"Create account"}
          helpLinkText={"Log in"}
          helpText={"Already have an account?"}
          helpLinkTo={"/login"}
        />
      </Card>
    </Form>
  );
}
