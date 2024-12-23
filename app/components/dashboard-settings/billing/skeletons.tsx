import { Skeleton } from "~/components/ui/skeleton";

export const SubscriptionInformationSkeleton = () => {
  return (
    <div>
      <Skeleton className="h-6 w-8 -mt-1" />
      <Skeleton className="h-6 w-36 mt-2" />
      <Skeleton className="h-5 w-12 mt-4" />
      <Skeleton className="h-5 w-64 mt-2" />
    </div>
  );
};

export const SubscriptionBillingPortalSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-8 w-36" />
    </div>
  );
};
