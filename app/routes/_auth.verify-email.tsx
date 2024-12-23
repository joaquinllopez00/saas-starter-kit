import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useEffect } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ErrorList } from "~/components/ui/error-list";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/components/ui/use-toast";
import { verifyTotp } from "~/services/auth/utils";
import { updateEmailVerified } from "~/services/db/user-passwords.server";
import { findUserById } from "~/services/db/users.server";
import {
  findVerificationTokensForUser,
  updateTokenVerified,
} from "~/services/db/verification-tokens.server";
import {
  parseFormDataAndValidate,
  returnFormErrorsJsonResponse,
  returnFormFieldErrorJsonResponse,
} from "~/utils/form.server";
import {
  createUserSession,
  getUserIdFromSession,
  getUserIdFromSessionWithIdentity,
} from "~/utils/sessions.server";

const VerifySchema = z.object({
  code: z
    .string()
    .length(6, { message: "Code must be 6 characters" })
    .regex(/^\d+$/, "Code must be numeric"),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const { userId, authMethod, identityVerified } =
    await getUserIdFromSessionWithIdentity(request);

  if (authMethod === "email" && identityVerified) {
    return redirect("/dashboard");
  }
  const user = await findUserById(userId);
  return { email: user?.email };
}

export async function action({ request }: ActionFunctionArgs) {
  const parsed = await parseFormDataAndValidate(request, VerifySchema);
  if (!parsed.success) {
    return returnFormErrorsJsonResponse(parsed);
  }
  const userId = await getUserIdFromSession(request);
  const { code } = parsed.data;
  const verificationToken = await findVerificationTokensForUser(
    userId,
    "email",
    code,
  );
  if (!verificationToken) {
    return returnFormFieldErrorJsonResponse<typeof VerifySchema>(
      "code",
      "Invalid code",
      400,
    );
  }
  const isValid = verifyTotp(verificationToken.secret, code);
  if (!isValid) {
    return returnFormFieldErrorJsonResponse<typeof VerifySchema>(
      "code",
      "Code expired",
      400,
    );
  }
  await updateTokenVerified(verificationToken.id);
  await updateEmailVerified(userId);
  return createUserSession(userId, "email", "/dashboard");
}

export default function AuthVerify() {
  const navigation = useNavigation();
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const formFetcher = useFetcher<{
    error: Record<string, string> | null;
    message: string;
  }>();

  const { toast } = useToast();

  useEffect(() => {
    if (formFetcher.data) {
      if (formFetcher.data.error) {
        toast({
          title: "Error",
          description: formFetcher.data.error.message,
          variant: "error",
        });
      } else {
        toast({
          title: formFetcher.data.message,
          description: "Another email has been sent to you",
        });
      }
    }
  }, [formFetcher.data, toast]);

  return (
    <>
      <Card>
        <Form method={"post"}>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We've sent an email to{" "}
              <span className={"font-medium"}>{loaderData.email}</span> with a
              confirmation code
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Code</Label>
              <Input name="code" type="text" />
              <ErrorList
                errors={
                  !actionData?.success ? actionData?.fieldErrors.code : []
                }
              />
            </div>
          </CardContent>
          <CardFooter className={"flex flex-col gap-3"}>
            <Button
              type={"submit"}
              disabled={navigation.state === "submitting"}
              className="w-full"
            >
              Verify
            </Button>
          </CardFooter>
        </Form>
      </Card>
      <div className={"mt-2 text-center text-sm text-muted-foreground"}>
        Didn't receive a code?{" "}
        <button
          onClick={() => {
            formFetcher.submit(
              {},
              {
                action: "/api/verification/resend",
                method: "post",
              },
            );
          }}
          className="text-primary"
        >
          Send again
        </button>
      </div>
    </>
  );
}
