export interface StorageClient {
  generateSignedUploadUrl(key: string, contentType: string): Promise<string>;

  generateSignedGetUrl(key: string): Promise<string>;

  uploadFile(
    data: AsyncIterable<Uint8Array>,
    key: string,
    contentType: string,
  ): Promise<string>;

  deleteFile(filePath: string): Promise<void>;
}
