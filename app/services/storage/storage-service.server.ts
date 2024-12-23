import { featureConfig } from "~/config/features.server";
import { CloudflareR2Storage } from "~/services/storage/cloudflare-r2-storage.server";
import { S3Storage } from "~/services/storage/s3-storage.server";

import type { StorageClient } from "~/services/storage/types";

const initStorageClient = (): StorageClient | null => {
  if (featureConfig.storage.enabled) {
    if (featureConfig.storage.provider === "s3") {
      return new S3Storage({
        bucketName: process.env.USER_UPLOADS_BUCKET_NAME!,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      });
    } else if (featureConfig.storage.provider === "cloudflare") {
      return new CloudflareR2Storage({
        bucketName: process.env.USER_UPLOADS_BUCKET_NAME!,
        endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_ACCESS_SECRET_KEY!,
      });
    }
  }
  return null;
};

const storageClient = initStorageClient();

export { storageClient };
