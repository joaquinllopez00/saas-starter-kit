import { Skeleton } from "~/components/ui/skeleton";

export const DashboardSkeleton = () => {
  return (
    <div className={"flex w-full flex-col"}>
      <div
        className={
          "flex w-full flex-row items-center justify-between pr-4 md:pr-6 px-6 pb-4"
        }
      >
        <Skeleton className={"w-20 h-7"} />
      </div>
      <div className={"mt-2 px-4 md:px-6"}>
        <Skeleton className={"w-64 h-8"} />
        <Skeleton className={"mt-4 w-full h-96"} />
      </div>
    </div>
  );
};
