import type { PutObjectCommandInput } from "@aws-sdk/client-s3";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { captureObservabilityException } from "~/lib/observability";

import type { StorageClient } from "~/services/storage/types";

export class S3Storage implements StorageClient {
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly expires: number = 900; // 15 minutes in seconds

  constructor({
    bucketName,
    endpoint,
    accessKeyId,
    secretAccessKey,
    region = "eu-west-1",
    forcePathStyle,
  }: {
    bucketName: string;
    endpoint?: string;
    accessKeyId: string;
    secretAccessKey: string;
    region?: string;
    forcePathStyle?: boolean;
  }) {
    this.s3 = new S3Client({
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      region,
      forcePathStyle,
    });
    this.bucketName = bucketName;
  }

  async generateSignedUploadUrl(
    fileName: string,
    contentType: string,
    isPublic = false,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        ContentType: contentType,
      });
      const url = await getSignedUrl(this.s3, command, {
        expiresIn: this.expires,
      });
      // // Append content length condition to the URL
      // const contentLengthCondition = `&x-amz-content-length-range=1,${MAX_FILE_UPLOAD_SIZE}`;
      // return url + contentLengthCondition;
      return url;
    } catch (error) {
      captureObservabilityException(error);
      throw new Error("Failed to generate signed URL");
    }
  }

  async generateSignedGetUrl(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      return await getSignedUrl(this.s3, command, {
        expiresIn: this.expires,
      });
    } catch (error) {
      captureObservabilityException(error);
      throw new Error("Failed to generate signed URL");
    }
  }

  async _convertToBuffer(a: AsyncIterable<Uint8Array>) {
    const result = [];
    for await (const chunk of a) {
      result.push(chunk);
    }
    return Buffer.concat(result);
  }

  async uploadFile(
    data: AsyncIterable<Uint8Array>,
    key: string,
    contentType: string,
  ): Promise<string> {
    try {
      const params: PutObjectCommandInput = {
        Bucket: this.bucketName,
        Key: key,
        Body: await this._convertToBuffer(data),
        ContentType: contentType,
      };

      await this.s3.send(new PutObjectCommand(params));

      return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
    } catch (error) {
      captureObservabilityException(error);
      throw new Error("Failed to upload file");
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: filePath,
        }),
      );
    } catch (error: unknown) {
      captureObservabilityException(error);
      throw new Error("Failed to delete file");
    }
  }
}
