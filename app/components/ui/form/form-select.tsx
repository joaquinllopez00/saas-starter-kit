import { ErrorList } from "~/components/ui/error-list";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

// These types are to ensure that `defaultValue` must be one of the values in the `options` array
type Option<T> = {
  value: T;
  label: string;
};

type InferValueTypes<T> = T extends { value: infer V } ? V : never;

type FormSelectProps<T extends Option<any>[]> = {
  label: string;
  name: string;
  defaultValue: InferValueTypes<T[number]>;
  options: T;
  errors?: string[];
  disabled?: boolean;
};

export const FormSelect = <T extends Option<any>[]>({
  label,
  name,
  defaultValue,
  options,
  errors,
  disabled,
}: FormSelectProps<T>) => {
  return (
    <div className="grid w-full gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Select name={name} defaultValue={defaultValue} disabled={disabled}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((label) => (
            <SelectItem
              className={"flex w-full flex-row items-center"}
              key={label.value}
              value={label.value}
            >
              {label.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ErrorList errors={errors} />
    </div>
  );
};
