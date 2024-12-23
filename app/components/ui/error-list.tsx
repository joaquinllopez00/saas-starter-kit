import type { ZodString } from "zod";

export type ListOfErrors =
  | Array<string | null | undefined>
  | string
  | null
  | undefined
  | ZodString;

export function ErrorList({ errors }: { errors?: ListOfErrors }) {
  return (
    <ul className={"text-xs text-destructive"}>
      {typeof errors === "string" && <li>{errors}</li>}
      {Array.isArray(errors) &&
        errors?.map((error) => <li key={error}>{error}</li>)}
    </ul>
  );
}
