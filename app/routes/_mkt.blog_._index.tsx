import { Link, useLoaderData } from "@remix-run/react";

import type { HeadersFunction } from "@remix-run/node";
import { Badge } from "~/components/ui/badge";
import { formatLocalDate } from "~/components/util/date";
import { getPosts } from "~/services/blog/blog.server";

export const loader = async () => {
  const posts = await getPosts();
  return { posts };
};

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": "public, max-age=3600, s-maxage=86400",
  };
};

export default function Blog() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Blog
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Stay up to date with the latest news and updates from our team.
          </p>
          <div className="mt-10 space-y-16 border-t border-secondary pt-10">
            {posts.map((post) => (
              <article
                key={post.id}
                className="flex max-w-xl flex-col items-start justify-between"
              >
                <div className="flex items-center gap-x-4 text-xs">
                  <time
                    dateTime={formatLocalDate(post.date)}
                    className="text-muted-foreground"
                  >
                    {formatLocalDate(post.date)}
                  </time>
                  <Badge variant={"secondary"}>{post.category}</Badge>
                </div>
                <div className="group relative">
                  <h3 className="mt-3 text-lg font-semibold leading-6 text-foreground group-hover:text-muted-foreground">
                    <Link to={post.id}>
                      <span className="absolute inset-0" />
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {post.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
