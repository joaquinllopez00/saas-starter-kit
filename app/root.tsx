import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { captureRemixErrorBoundaryError, withSentry } from "@sentry/remix";
import { clsx } from "clsx";
import { useEffect } from "react";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import { useConfig } from "~/components/marketing/hooks/use-colors";
import { buttonVariants } from "~/components/ui/button";
import { Toaster } from "~/components/ui/toaster";
import { useToast } from "~/components/ui/use-toast";
import { PublicEnv } from "~/components/util/public-env";
import { appConfig } from "~/config/app.server";
import { cn } from "~/lib/utils";
import { getToast } from "~/services/toast/toast.server";
import stylesheet from "~/styles/globals.css?url";
import shadcnThemes from "~/styles/shadcn-themes.css?url";
import { getPublicClientSideEnvVars } from "~/utils/env.server";

import { themeSessionResolver } from "~/utils/theme.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "stylesheet", href: shadcnThemes },
];

// Return the theme from the session storage using the loader
export async function loader({ request }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request);
  const { toast, headers: toastHeaders } = await getToast(request);
  return json(
    {
      theme: getTheme(),
      ENV: getPublicClientSideEnvVars(),
      toast,
      appName: appConfig.name,
    },
    {
      headers: toastHeaders ?? undefined,
    },
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.appName },
    {
      property: "og:title",
      content: data?.appName,
    },
    {
      name: "description",
      content: "Your tagline goes here!",
    },
  ];
};

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
  captureRemixErrorBoundaryError(error);
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body className={"flex h-screen items-center justify-center"}>
        <div className={"flex flex-col items-center gap-2"}>
          <h1 className={"text-3xl font-bold"}>Oh no!</h1>
          <p>Something went wrong.</p>
          <Link
            className={cn("mt-2", buttonVariants({ variant: "default" }))}
            to="/dashboard"
          >
            Go back home
          </Link>
        </div>
      </body>
    </html>
  );
}

function AppWithProviders() {
  const data = useLoaderData<typeof loader>();
  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <App />
    </ThemeProvider>
  );
}

export default withSentry(AppWithProviders);

export function App() {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();
  const [config] = useConfig();
  const { toast } = useToast();

  useEffect(() => {
    if (data.toast) {
      toast({
        title: data.toast.title,
        description: data.toast.description,
      });
    }
  }, [data.toast, toast]);

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <Links />
      </head>
      <body
        className={cn(`theme-${config.theme}`, "bg-background text-foreground")}
      >
        <PublicEnv env={data.ENV} />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <Toaster />
      </body>
    </html>
  );
}
