import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { AppError } from "../../application/errors/app.error.ts";

export interface UploadFileInput {
  key: string;
  body: Buffer;
  contentType: string;
}

export interface UploadFileResult {
  key: string;
  url: string;
}

export interface StoredFileObject {
  body: Buffer;
  contentType: string;
}

export interface StorageService {
  isConfigured(): boolean;
  uploadFile(input: UploadFileInput): Promise<UploadFileResult>;
  getFile(key: string): Promise<StoredFileObject | null>;
  deleteFile(key: string): Promise<void>;
}

export class S3StorageService implements StorageService {
  private readonly endpoint: string;
  private readonly region: string;
  private readonly bucket: string;
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;
  private readonly publicBaseUrl: string;
  private readonly client: S3Client | null;

  constructor() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
    const rawEndpoint =
      process.env.AWS_ENDPOINT_URL_S3 ??
      process.env.S3_API_ENDPOINT ??
      (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "");

    this.endpoint = rawEndpoint.replace(/\/+$/, "");
    this.region = process.env.AWS_REGION ?? "auto";
    this.bucket =
      process.env.AWS_S3_BUCKET ??
      process.env.R2_BUCKET_NAME ??
      "apoyo-animal";
    this.accessKeyId =
      process.env.AWS_ACCESS_KEY_ID ?? process.env.R2_ACCESS_KEY_ID ?? "";
    this.secretAccessKey =
      process.env.AWS_SECRET_ACCESS_KEY ??
      process.env.R2_SECRET_ACCESS_KEY ??
      "";

    const fallbackApiUrl = (
      process.env.BETTER_AUTH_URL ??
      `http://localhost:${process.env.PORT ?? 3000}`
    ).replace(/\/+$/, "");

    const customPublicUrl = (
      process.env.S3_PUBLIC_URL ?? process.env.R2_PUBLIC_URL
    )?.trim();
    this.publicBaseUrl = (
      customPublicUrl && customPublicUrl.length > 0
        ? customPublicUrl
        : `${fallbackApiUrl}/api/uploads`
    ).replace(/\/+$/, "");

    this.client = this.isConfigured()
      ? new S3Client({
          region: this.region,
          endpoint: this.endpoint,
          forcePathStyle: true,
          requestChecksumCalculation: "WHEN_REQUIRED",
          credentials: {
            accessKeyId: this.accessKeyId,
            secretAccessKey: this.secretAccessKey,
          },
        })
      : null;
  }

  isConfigured(): boolean {
    return Boolean(
      this.endpoint &&
        this.bucket &&
        this.accessKeyId &&
        this.secretAccessKey,
    );
  }

  async uploadFile(input: UploadFileInput): Promise<UploadFileResult> {
    if (!this.client) {
      throw new AppError(
        "El almacenamiento S3 no está configurado en el servidor",
        500,
        "STORAGE_NOT_CONFIGURED",
      );
    }

    const cleanKey = input.key.replace(/^\/+/, "");

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: cleanKey,
          Body: input.body,
          ContentType: input.contentType,
        }),
      );
    } catch {
      throw new AppError(
        "No se pudo subir la imagen al almacenamiento",
        502,
        "STORAGE_UPLOAD_FAILED",
      );
    }

    return {
      key: cleanKey,
      url: `${this.publicBaseUrl}/${cleanKey}`,
    };
  }

  async getFile(key: string): Promise<StoredFileObject | null> {
    if (!this.client) {
      return null;
    }

    const cleanKey = key.replace(/^\/+/, "");

    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: cleanKey,
        }),
      );

      if (!response.Body) {
        return null;
      }

      const bytes = await response.Body.transformToByteArray();
      return {
        body: Buffer.from(bytes),
        contentType: response.ContentType ?? "application/octet-stream",
      };
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "name" in error &&
        ((error as { name?: string }).name === "NoSuchKey" ||
          (error as { name?: string }).name === "NotFound")
      ) {
        return null;
      }

      throw new AppError(
        "Error al leer el archivo desde el almacenamiento",
        502,
        "STORAGE_READ_FAILED",
      );
    }
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.client) {
      return;
    }

    const cleanKey = key.replace(/^\/+/, "");
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: cleanKey,
      }),
    );
  }
}

export { S3StorageService as R2StorageService };
