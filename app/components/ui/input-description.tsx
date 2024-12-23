import * as React from "react";

import { cn } from "~/lib/utils";

export interface InputDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

const InputDescription = React.forwardRef<
  HTMLParagraphElement,
  InputDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <p
      className={cn("mt-1 text-sm text-muted-foreground", className)}
      ref={ref}
      {...props}
    />
  );
});

InputDescription.displayName = "InputDescription";

export { InputDescription };
