import type { RefObject } from "react";
import { useEffect } from "react";

export const useResetFormAfterSuccess = (
  formRef: RefObject<HTMLFormElement>,
  fetcherData?: { success: boolean },
) => {
  useEffect(() => {
    if (fetcherData?.success) {
      formRef.current?.reset();
    }
  }, [fetcherData, formRef]);
};
