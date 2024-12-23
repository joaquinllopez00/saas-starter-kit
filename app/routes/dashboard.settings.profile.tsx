import DashboardSettingsPageLayout from "~/components/layouts/dashboard-settings-page-layout";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import type { FormEvent } from "react";
import { useState } from "react";
import * as z from "zod";
import { AvatarUpload } from "~/components/dashboard/user-avatar-upload";
import { Button } from "~/components/ui//button";
import { Input } from "~/components/ui//input";
import { ErrorList } from "~/components/ui/error-list";
import { InputDescription } from "~/components/ui/input-description";
import { Label } from "~/components/ui/label";
import { featureConfig } from "~/config/features.server";
import { captureObservabilityException } from "~/lib/observability";
import { findUserById, updateUser } from "~/services/db/users.server";
import { MAX_FILE_UPLOAD_SIZE } from "~/services/storage/constants";
import { returnJsonSuccessWithToast } from "~/services/toast/toast.server";
import {
  parseFormDataAndValidate,
  returnFormErrorsJsonResponse,
} from "~/utils/form.server";
import { getUserIdFromSession } from "~/utils/sessions.server";
import { generateProfilePicUrl } from "~/utils/user.server";

const AccountFormSchema = z.object({
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  profilePictureFileKey: z.string().optional(),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserIdFromSession(request);
  const user = await findUserById(userId);
  await generateProfilePicUrl(user);
  const isStorageEnabled = featureConfig.storage.enabled;
  return { ...user, isStorageEnabled };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const parsed = await parseFormDataAndValidate(request, AccountFormSchema);
  if (!parsed.success) {
    return returnFormErrorsJsonResponse(parsed);
  }
  const userId = await getUserIdFromSession(request);
  await updateUser(userId, {
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    profilePictureFileKey: parsed.data.profilePictureFileKey,
  });
  return returnJsonSuccessWithToast({
    title: "Profile updated",
  });
};

export default function DashboardSettingsProfile() {
  const loaderData = useLoaderData<typeof loader>();
  const formFetcher = useFetcher<typeof action>();
  const presignedUrlFetcher = useFetcher<{ url: string; key: string }>();
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const isPending = formFetcher.state === "submitting";

  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null,
  );
  const handleFileSelect = (file: File) => {
    if (!file) {
      return;
    }
    if (file.size > MAX_FILE_UPLOAD_SIZE) {
      setFileErrors(["File size must be less than 5MB"]);
      return;
    }
    setFileErrors([]);
    setProfilePictureFile(file);
    presignedUrlFetcher.submit(
      {
        fileName: file.name,
        contentType: file.type,
      },
      {
        method: "post",
        action: "/api/storage/presigned-url",
      },
    );
  };
  const handleRemove = () => {
    setProfilePictureFile(null);
    setFileErrors([]);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    if (presignedUrlFetcher.data && profilePictureFile) {
      const presignedUrl = presignedUrlFetcher.data.url;
      try {
        const response = await fetch(presignedUrl, {
          method: "put",
          body: profilePictureFile,
        });
        if (!response.ok) {
          throw new Error("Failed to upload profile picture");
        }
        formData.set("profilePictureFileKey", presignedUrlFetcher.data.key);
      } catch (error) {
        captureObservabilityException(error);
      }
    } else {
      formData.set("profilePictureFileKey", "");
    }
    formFetcher.submit(formData, {
      method: "post",
    });
  };

  return (
    <DashboardSettingsPageLayout
      title={"Profile"}
      subtitle={"Update your account details"}
    >
      <formFetcher.Form
        className={"space-y-8"}
        method={"post"}
        onSubmit={handleSubmit}
      >
        <div className="grid w-full gap-2 md:w-1/2">
          <Label>Email</Label>
          <Input disabled value={loaderData.email} />
          <InputDescription>Email cannot be changed</InputDescription>
        </div>
        <div className={"flex flex-col gap-6 md:flex-row"}>
          <div className="grid w-full gap-2 md:w-1/2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              name="firstName"
              defaultValue={loaderData?.firstName || ""}
            />
            <ErrorList
              errors={
                !formFetcher.data?.success
                  ? formFetcher.data?.fieldErrors.firstName
                  : []
              }
            />
          </div>
          <div className="grid w-full gap-2 md:w-1/2">
            <Label htmlFor="lastName">Last name</Label>
            <Input name="lastName" defaultValue={loaderData?.lastName || ""} />
            <ErrorList
              errors={
                !formFetcher.data?.success
                  ? formFetcher.data?.fieldErrors.lastName
                  : []
              }
            />
          </div>
        </div>
        {loaderData.isStorageEnabled && (
          <div className="flex flex-row items-end">
            <AvatarUpload
              profilePictureUrl={loaderData.profilePictureUrl}
              onFileSelect={handleFileSelect}
              onRemove={handleRemove}
              size="lg"
            />
            <ErrorList errors={fileErrors} />
          </div>
        )}
        <Button type="submit" disabled={isPending || !!fileErrors.length}>
          Update account
        </Button>
      </formFetcher.Form>
    </DashboardSettingsPageLayout>
  );
}
