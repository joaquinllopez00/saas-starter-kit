import { json } from "@remix-run/node";
import type { TypedResponse } from "@remix-run/server-runtime/dist/responses";
import type { typeToFlattenedError, z, ZodSchema, ZodTypeDef } from "zod";
import { captureObservabilityException } from "~/lib/observability";

type FormFieldErrors<T> = typeToFlattenedError<T>["fieldErrors"];
type FormErrors<T> = typeToFlattenedError<T>["formErrors"];

type FormErrorsJsonResponse<T> = {
  fieldErrors: FormFieldErrors<T>;
  formErrors?: FormErrors<T>;
  success: false;
};

type ParsedFormSuccess<T> = {
  data: T;
  success: true;
};

type ParsedFormError<T> = {
  success: false;
  data: {
    fieldErrors: FormFieldErrors<T>;
    formErrors?: FormErrors<T>;
  };
  init: ResponseInit;
};

export const parseFormDataAndValidate = async <Input, Output>(
  request: Request,
  schema: ZodSchema<Output, ZodTypeDef, Input>,
  incomingFormPayload?: { [p: string]: FormDataEntryValue },
): Promise<ParsedFormSuccess<Output> | ParsedFormError<Input>> => {
  let submission;
  try {
    const formPayload =
      incomingFormPayload || Object.fromEntries(await request.formData());
    submission = schema.safeParse(formPayload);
    if (!submission.success) {
      const errors = submission.error.flatten().fieldErrors;
      return {
        data: { fieldErrors: errors },
        success: false,
        init: { status: 400 },
      };
    }
    return { data: submission.data, success: true };
  } catch (error: unknown) {
    captureObservabilityException(error);
    return { data: { fieldErrors: {} }, success: false, init: { status: 500 } };
  }
};

export const returnFormErrorsJsonResponse = <T>(
  parsed: ParsedFormError<T>,
): TypedResponse<FormErrorsJsonResponse<T>> => {
  return json(
    {
      fieldErrors: parsed.data.fieldErrors,
      formErrors: [],
      success: false,
    },
    parsed.init,
  );
};

export const returnFormFieldErrorJsonResponse = <T extends ZodSchema>(
  key: keyof z.infer<T>,
  message: string,
  status: number = 400,
): TypedResponse<FormErrorsJsonResponse<z.infer<T>>> => {
  return json(
    {
      formErrors: [],
      fieldErrors: {
        [key]: [message],
      } as FormFieldErrors<T>,
      success: false,
    },
    {
      status,
    },
  );
};

export const returnFormErrorJsonResponse = <T extends ZodSchema>(
  message: string | string[],
  status: number = 400,
): TypedResponse<FormErrorsJsonResponse<z.infer<T>>> => {
  return json(
    {
      formErrors: Array.isArray(message) ? message : [message],
      fieldErrors: {},
      success: false,
    },
    { status },
  );
};
