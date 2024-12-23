import { cacheService } from "~/services/cache/cache-service.server";
import type { PublicUser } from "~/services/db/types";
import { storageClient } from "~/services/storage/storage-service.server";

export const generateProfilePicUrl = async (user: PublicUser) => {
  if (user.profilePictureFileKey && storageClient) {
    if (cacheService) {
      const cachedUrl = await cacheService.getItem<string>(
        `profile-pic-url:${user.id}`,
      );
      if (cachedUrl) {
        user.profilePictureUrl = cachedUrl;
        return;
      }
    }
    user.profilePictureUrl = await storageClient.generateSignedGetUrl(
      user.profilePictureFileKey,
    );
    if (cacheService) {
      await cacheService.setItem<string>(
        `profile-pic-url:${user.id}`,
        user.profilePictureUrl,
      );
    }
  }
};
