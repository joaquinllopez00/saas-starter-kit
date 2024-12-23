import SubscriptionTierColumnSkeleton from "~/components/pricing/subscription-tier-column-skeleton";

export function SubscriptionTiersPageSkeleton() {
  return (
    <div>
      <div className={"mt-10 flex flex-col items-center"}>
        <div
          className={"h-6 w-[80px] animate-pulse rounded bg-secondary"}
        ></div>
      </div>
      <div className="isolate mx-auto mt-8 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SubscriptionTierColumnSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
