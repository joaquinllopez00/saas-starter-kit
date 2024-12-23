import { S3Storage } from "~/services/storage/s3-storage.server";

export class CloudflareR2Storage extends S3Storage {
  constructor({
    bucketName,
    endpoint,
    accessKeyId,
    secretAccessKey,
  }: {
    bucketName: string;
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
  }) {
    super({
      bucketName,
      endpoint,
      accessKeyId,
      secretAccessKey,
      region: "auto",
      forcePathStyle: true,
    });
  }
}
