import { ChevronLeftIcon } from "@radix-ui/react-icons";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, Outlet, useLoaderData } from "@remix-run/react";
import { Button, buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { userHasSession } from "~/utils/sessions.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const hasSession = await userHasSession(request);
  return { hasSession: hasSession };
}

export default function Auth() {
  const { hasSession } = useLoaderData<typeof loader>();
  return (
    <div
      className={"h-screen bg-secondary px-2 py-6 sm:px-0 md:px-10 md:py-10"}
    >
      <div className={"w-full flex flex-row justify-between"}>
        <Link
          to={"/"}
          className={cn("flex flex-row", buttonVariants({ variant: "ghost" }))}
        >
          <ChevronLeftIcon className={"mr-1"} />
          <span className={"text-red"}>Back</span>
        </Link>
        {hasSession && (
          <Form action={"/logout"} method={"post"}>
            <Button variant={"outline"}>Logout</Button>
          </Form>
        )}
      </div>
      <div
        className={
          "mx-auto flex max-w-md flex-col items-center justify-center pt-8 sm:pt-16 lg:pt-32"
        }
      >
        <div className={"w-full"}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
