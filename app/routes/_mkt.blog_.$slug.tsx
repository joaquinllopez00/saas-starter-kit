import { ChevronLeftIcon } from "@radix-ui/react-icons";
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { appConfig } from "~/config/app.server";
import { cn } from "~/lib/utils";
import { getPostData } from "~/services/blog/blog.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const postData = await getPostData(params.slug as string);
  return { postData, appName: appConfig.name };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `${data?.postData?.title} - ${data?.appName}` },
    {
      name: "description",
      content: data?.postData?.description,
    },
    {
      name: "keywords",
      content: data?.postData?.tags.join(","),
    },
    {
      property: "og:title",
      content: `${data?.postData?.title} - ${data?.appName}`,
    },
    {
      property: "og:description",
      content: data?.postData?.description,
    },
    {
      name: "twitter:title",
      content: `${data?.postData?.title} - ${data?.appName}`,
    },
    {
      name: "twitter:description",
      content: data?.postData?.description,
    },
  ];
};

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": "public, max-age=3600, s-maxage=86400",
  };
};

export default function Post() {
  const { postData } = useLoaderData<typeof loader>();
  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Link
            to={"/blog"}
            className={
              "flex items-center text-muted-foreground transition hover:underline"
            }
          >
            <ChevronLeftIcon className={"mr-2 h-6 w-6"} />
            Back to blog
          </Link>

          <div className={"mt-8"}>
            <h1
              className={
                "mt-2 scroll-m-20 font-display text-4xl font-bold tracking-tight"
              }
            >
              {postData.title}
            </h1>
            <h2 className={"my-4 text-muted-foreground"}>
              {postData.description}
            </h2>
            <span className={"my-2 text-xs text-muted-foreground"}>
              {/*{postData.humanDate}*/}
            </span>
            <hr className={"my-6 border-secondary"} />
          </div>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ className, ...props }) => (
                <h1
                  className={cn(
                    "mt-2 scroll-m-20 text-4xl font-bold tracking-tight",
                    className,
                  )}
                  {...props}
                />
              ),
              h2: ({ className, ...props }) => (
                <h2
                  className={cn(
                    "mt-10 scroll-m-20 border-b pb-1 text-3xl font-semibold tracking-tight first:mt-0",
                    className,
                  )}
                  {...props}
                />
              ),
              h3: ({ className, ...props }) => (
                <h3
                  className={cn(
                    "mt-8 scroll-m-20 text-2xl font-semibold tracking-tight",
                    className,
                  )}
                  {...props}
                />
              ),
              h4: ({ className, ...props }) => (
                <h4
                  className={cn(
                    "mt-8 scroll-m-20 text-xl font-semibold tracking-tight",
                    className,
                  )}
                  {...props}
                />
              ),
              h5: ({ className, ...props }) => (
                <h5
                  className={cn(
                    "mt-8 scroll-m-20 text-lg font-semibold tracking-tight",
                    className,
                  )}
                  {...props}
                />
              ),
              h6: ({ className, ...props }) => (
                <h6
                  className={cn(
                    "mt-8 scroll-m-20 text-base font-semibold tracking-tight",
                    className,
                  )}
                  {...props}
                />
              ),
              a: ({ className, children, ...props }) => (
                <a
                  className={cn(
                    "font-medium underline underline-offset-4",
                    className,
                  )}
                  {...props}
                >
                  {children}
                </a>
              ),
              p: ({ className, ...props }) => (
                <p
                  className={cn(
                    "leading-7 [&:not(:first-child)]:mt-6",
                    className,
                  )}
                  {...props}
                />
              ),
              ul: ({ className, ...props }) => (
                <ul
                  className={cn("my-6 ml-6 list-disc", className)}
                  {...props}
                />
              ),
              ol: ({ className, ...props }) => (
                <ol
                  className={cn("my-6 ml-6 list-decimal", className)}
                  {...props}
                />
              ),
              li: ({ className, ...props }) => (
                <li className={cn("mt-2", className)} {...props} />
              ),
              blockquote: ({ className, ...props }) => (
                <blockquote
                  className={cn(
                    "mt-6 border-l-2 pl-6 italic [&>*]:text-muted-foreground",
                    className,
                  )}
                  {...props}
                />
              ),
              img: ({
                className,
                alt,
                ...props
              }: React.ImgHTMLAttributes<HTMLImageElement>) => (
                <img
                  className={cn("rounded-md border", className)}
                  alt={alt}
                  {...props}
                />
              ),
              hr: ({ ...props }) => <hr className="my-4 md:my-8" {...props} />,
              table: ({
                className,
                ...props
              }: React.HTMLAttributes<HTMLTableElement>) => (
                <div className="my-6 w-full overflow-y-auto">
                  <table className={cn("w-full", className)} {...props} />
                </div>
              ),
              tr: ({
                className,
                ...props
              }: React.HTMLAttributes<HTMLTableRowElement>) => (
                <tr
                  className={cn("m-0 border-t p-0 even:bg-muted", className)}
                  {...props}
                />
              ),
              th: ({ className, ...props }) => (
                <th
                  className={cn(
                    "border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
                    className,
                  )}
                  {...props}
                />
              ),
              td: ({ className, ...props }) => (
                <td
                  className={cn(
                    "border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
                    className,
                  )}
                  {...props}
                />
              ),
              pre: ({ className, ...props }) => (
                <pre
                  className={cn(
                    "mb-4 mt-6 overflow-x-auto rounded-lg border bg-black py-4",
                    className,
                  )}
                  {...props}
                />
              ),
              code: ({ className, ...props }) => (
                <code
                  className={cn(
                    "relative rounded border px-[0.3rem] py-[0.2rem] font-mono text-sm",
                    className,
                  )}
                  {...props}
                />
              ),
            }}
          >
            {{ postData }.postData.contentRaw}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
