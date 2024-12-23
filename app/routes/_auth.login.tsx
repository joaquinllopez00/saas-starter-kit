import type { ActionFunctionArgs } from "@remix-run/node";
import type { ClientActionFunctionArgs } from "@remix-run/react";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { Card, CardContent } from "~/components/ui/card";
import { ErrorList } from "~/components/ui/error-list";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { EmailSchema } from "~/services/auth/validation-schemas";
import {
  parseFormDataAndValidate,
  returnFormErrorJsonResponse,
  returnFormErrorsJsonResponse,
} from "~/utils/form.server";
import { createUserSession } from "~/utils/sessions.server";

import { json } from "@remix-run/node";
import { AuthCardFooter } from "~/components/auth/auth-card-footer";
import { AuthCardHeader } from "~/components/auth/auth-card-header";
import { SocialAuthButtons } from "~/components/auth/social-auth-buttons";
import { formValidationClientAction } from "~/components/forms/form-validation-client-action";
import { appConfig } from "~/config/app.server";
import { setObservabilityUser } from "~/lib/observability";
import { loginEmailPassword } from "~/utils/utils";

const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string(),
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
  const redirectQueryParam = new URL(request.url).searchParams.get(
    "redirectTo",
  );
  const parsed = await parseFormDataAndValidate(request, LoginSchema);
  if (!parsed.success) {
    return returnFormErrorsJsonResponse(parsed);
  }
  const { email, password } = parsed.data;
  const existingUser = await loginEmailPassword({
    email,
    passwordRaw: password,
  });
  if (!existingUser) {
    return returnFormErrorJsonResponse<typeof LoginSchema>(
      "Email or password is incorrect",
      400,
    );
  }
  setObservabilityUser(existingUser);
  return createUserSession(
    existingUser.id,
    "email",
    redirectQueryParam ?? "/dashboard",
  );
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
    validationSchema: LoginSchema,
  });

export default function AuthLogin() {
  const { enabledAuthProviders } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <Form method={"post"}>
      <Card>
        <AuthCardHeader
          title={"Log in"}
          description={"Log in to your account to continue"}
        />
        <CardContent className="grid gap-4">
          <SocialAuthButtons authProviders={enabledAuthProviders} />
          <div className={"grid gap-4"}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                name="email"
                type="email"
                id={"email"}
                placeholder="test@example.com"
              />
              <ErrorList
                errors={
                  !actionData?.success ? actionData?.fieldErrors.email : []
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input name="password" type="password" id={"password"} />
              <Link
                tabIndex={999}
                to={"/forgot-password"}
                className="text-primary text-sm ml-auto -mb-4"
              >
                Forgot password?
              </Link>
              <ErrorList
                errors={
                  !actionData?.success ? actionData?.fieldErrors.password : []
                }
              />
            </div>
            <ErrorList
              errors={!actionData?.success ? actionData?.formErrors : []}
            />
          </div>
        </CardContent>
        <AuthCardFooter
          buttonText={"Log in"}
          helpLinkText={"Register"}
          helpText={"Don't have an account?"}
          helpLinkTo={"/register"}
        />
      </Card>
    </Form>
  );
}
