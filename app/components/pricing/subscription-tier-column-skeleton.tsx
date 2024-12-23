export default function SubscriptionTierColumnSkeleton() {
  return (
    <div className={"rounded-3xl border border-muted p-8 xl:p-10"}>
      <div className={"h-6 w-1/4 animate-pulse rounded bg-secondary"}></div>
      <div
        className={"mt-10 h-4 w-3/4 animate-pulse rounded bg-secondary"}
      ></div>
      <div
        className={"mt-10 h-12 w-2/3 animate-pulse rounded bg-secondary"}
      ></div>
      <div
        className={"mt-6 h-10 w-full animate-pulse rounded bg-secondary"}
      ></div>
      <div
        className={"mt-12 h-4 w-7/12 animate-pulse rounded bg-secondary"}
      ></div>
      <div
        className={"mt-4 h-4 w-9/12 animate-pulse rounded bg-secondary"}
      ></div>
      <div
        className={"mt-4 h-4 w-6/12 animate-pulse rounded bg-secondary"}
      ></div>
      <div
        className={"mt-4 h-4 w-11/12 animate-pulse rounded bg-secondary"}
      ></div>
    </div>
  );
}
