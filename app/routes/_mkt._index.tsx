import type { HeadersFunction } from "@remix-run/node";
import { Faqs } from "~/components/marketing/faqs";
import { Features } from "~/components/marketing/features";
import { Hero } from "~/components/marketing/hero";

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": "public, max-age=3600, s-maxage=86400",
  };
};

export default function Home() {
  return (
    <div className={"flex flex-col"}>
      <Hero />
      <Features />
      <Faqs />
    </div>
  );
}
