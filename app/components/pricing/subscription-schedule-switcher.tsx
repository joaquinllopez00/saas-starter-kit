import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import type { SubscriptionSchedule } from "~/services/payments/types";

const ScheduleLabel = ({
  label,
  isSelected,
}: {
  label: string;
  isSelected: boolean;
}) => (
  <Label
    htmlFor="schedule"
    className={isSelected ? "text-foreground" : "text-muted-foreground"}
  >
    {label}
  </Label>
);

export default function SubscriptionScheduleSwitcher({
  schedule,
  setSchedule,
  discountPercentage,
}: {
  schedule: SubscriptionSchedule;
  setSchedule: (schedule: SubscriptionSchedule) => void;
  discountPercentage: number;
}) {
  return (
    <div className="flex items-center space-x-2">
      <ScheduleLabel label="Monthly" isSelected={schedule === "monthly"} />
      <Switch
        type={"submit"}
        name={"schedule"}
        value={schedule === "yearly" ? "monthly" : "yearly"}
        checked={schedule === "yearly"}
        onCheckedChange={(checked) => {
          setSchedule(checked ? "yearly" : "monthly");
        }}
      />
      <ScheduleLabel
        label={`Yearly (save ${discountPercentage}%)`}
        isSelected={schedule === "yearly"}
      />
    </div>
  );
}
