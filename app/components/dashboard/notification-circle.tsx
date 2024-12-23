import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "~/lib/utils";

const notificationCircleVariants = cva(
  "justify-center inline-flex items-center rounded-full border text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
      size: {
        default: "h-5 w-5",
        xs: "h-2.5 w-2.5",
        sm: "h-3.5 w-3.5",
        lg: "h-6 w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface NotificationCircleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationCircleVariants> {
  count?: number;
}

function NotificationCircle({
  className,
  variant,
  size,
  count,
  ...props
}: NotificationCircleProps) {
  return (
    <div
      className={cn(
        notificationCircleVariants({ variant, size }),
        "flex items-center justify-center",
        className,
      )}
      {...props}
    >
      {count !== undefined && size !== "sm" && count > 0 && (
        <span className="text-center leading-none">{count}</span>
      )}
    </div>
  );
}

export { NotificationCircle, notificationCircleVariants };
