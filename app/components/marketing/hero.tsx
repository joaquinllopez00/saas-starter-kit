import { Link } from "@remix-run/react";
import { buttonVariants } from "~/components/ui/button";

export const Hero = () => {
  return (
    <div className={"mt-8 flex flex-col items-center text-center sm:mt-12"}>
      <span
        className={
          "max-w-5xl font-display text-3xl font-semibold text-foreground sm:text-7xl"
        }
      >
        Your tagline goes here!
      </span>
      <p
        className={
          "mt-2 max-w-3xl text-lg text-muted-foreground sm:mt-3 sm:text-xl"
        }
      >
        This is a demo app used to show what a day one Base-kit app looks like.
        Play around with the theme and{" "}
        <span className={"text-primary"}>color switcher</span> in the header to
        see how your app could look.
      </p>
      <div className={"mt-4 sm:mt-6"}>
        <Link
          className={buttonVariants({ variant: "default", size: "lg" })}
          to={"/register"}
        >
          Get started
        </Link>
      </div>
    </div>
  );
};
