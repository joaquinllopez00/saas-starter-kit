import { Link } from "@remix-run/react";

import type { FeatureKey } from "~/services/payments/types";

export const UpgradeLink = ({ featureKey }: { featureKey: FeatureKey }) => {
  return (
    <Link
      to={`/dashboard/upgrade?feature=${featureKey}`}
      className={"text-primary"}
    >
      upgrade
    </Link>
  );
};
