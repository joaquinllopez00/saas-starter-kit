import * as React from "react";
import { cn } from "~/lib/utils";

const List = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border", className)} {...props}>
    <ul className="divide-y divide-secondary">{props.children}</ul>
  </div>
));
List.displayName = "List";

const ListItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn(
      "flex items-center justify-between gap-x-6 px-4 py-5",
      className,
    )}
    {...props}
  />
));

ListItem.displayName = "ListItem";

export { List, ListItem };
