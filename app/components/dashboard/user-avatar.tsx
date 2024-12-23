import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";

const userAvatarVariants = cva("", {
  variants: {
    size: {
      default: "h-8 w-8",
      lg: "h-12 w-12",
      xl: "h-16 w-16",
    },
    variant: {
      default: "bg-muted",
      secondary: "bg-background",
    },
  },
  defaultVariants: {
    size: "default",
    variant: "default",
  },
});

export type UserAvatarProps = {
  size?: VariantProps<typeof userAvatarVariants>["size"];
  variant?: VariantProps<typeof userAvatarVariants>["variant"];
  profilePictureUrl?: string;
};
export function UserAvatar({
  profilePictureUrl,
  size,
  variant,
}: UserAvatarProps) {
  return (
    <Avatar className={cn(userAvatarVariants({ size: size }))}>
      <AvatarImage src={profilePictureUrl} />
      <AvatarFallback className={cn(userAvatarVariants({ variant: variant }))}>
        <UserIcon
          className={cn(
            size === "xl" ? "h-8 w-8" : size === "lg" ? "h-6 w-6" : "h-4 w-4",
            "text-muted-foreground",
          )}
        />
      </AvatarFallback>
    </Avatar>
  );
}
