import type { FeatureProps } from "~/components/marketing/types";

export const Feature = ({ name, description, icon }: FeatureProps) => {
  const Icon = icon;
  return (
    <div key={name} className="relative pl-16">
      <div className="text-base font-semibold text-gray-900">
        <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg text-primary">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className={"text-foreground"}>{name}</div>
      </div>
      <div className="mt-2 text-base leading-7 text-muted-foreground">
        {description}
      </div>
    </div>
  );
};
