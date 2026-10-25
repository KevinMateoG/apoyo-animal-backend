import { createHash, createHmac } from "node:crypto";
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

function sha256Hex(data: Buffer | string): string {
  return createHash("sha256").update(data).digest("hex");
}

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return createHmac("sha256", key).update(data).digest();
}

function toAmzDates(date = new Date()): { amzDate: string; dateStamp: string } {
  const iso = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return {
    amzDate: iso,
    dateStamp: iso.slice(0, 8),
  };
}

function encodeRfc3986(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function encodeS3Path(pathValue: string): string {
  return pathValue
    .split("/")
    .map((segment) => encodeRfc3986(segment))
    .join("/");
}

export class R2StorageService implements StorageService {
  private readonly endpoint: string;
  private readonly bucket: string;
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;
  private readonly publicBaseUrl: string;

  constructor() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
    const rawEndpoint =
      process.env.S3_API_ENDPOINT ??
      (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "");

    this.endpoint = rawEndpoint.replace(/\/+$/, "");
    this.bucket = process.env.R2_BUCKET_NAME ?? "";
    this.accessKeyId = process.env.R2_ACCESS_KEY_ID ?? "";
    this.secretAccessKey = process.env.R2_SECRET_ACCESS_KEY ?? "";

    const fallbackApiUrl = (
      process.env.BETTER_AUTH_URL ??
      `http://localhost:${process.env.PORT ?? 3000}`
    ).replace(/\/+$/, "");

    this.publicBaseUrl = (
      process.env.R2_PUBLIC_URL ?? `${fallbackApiUrl}/api/uploads`
    ).replace(/\/+$/, "");
  }

  isConfigured(): boolean {
    return Boolean(
      this.endpoint &&
        this.bucket &&
        this.accessKeyId &&
        this.secretAccessKey,
    );
  }

  private buildSignedHeaders(params: {
    method: "PUT" | "GET" | "DELETE";
    canonicalUri: string;
    payloadHash: string;
    contentType?: string;
  }): Record<string, string> {
    const endpointUrl = new URL(this.endpoint);
    const host = endpointUrl.host;
    const { amzDate, dateStamp } = toAmzDates();
    const region = "auto";
    const service = "s3";

    const headersMap: Record<string, string> = {
      host,
      "x-amz-content-sha256": params.payloadHash,
      "x-amz-date": amzDate,
    };

    if (params.contentType) {
      headersMap["content-type"] = params.contentType;
    }

    const sortedKeys = Object.keys(headersMap).sort();
    const canonicalHeaders = sortedKeys
      .map((key) => `${key}:${headersMap[key].trim()}\n`)
      .join("");
    const signedHeaders = sortedKeys.join(";");

    const canonicalRequest = [
      params.method,
      params.canonicalUri,
      "",
      canonicalHeaders,
      signedHeaders,
      params.payloadHash,
    ].join("\n");

    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      sha256Hex(canonicalRequest),
    ].join("\n");

    const kDate = hmacSha256(`AWS4${this.secretAccessKey}`, dateStamp);
    const kRegion = hmacSha256(kDate, region);
    const kService = hmacSha256(kRegion, service);
    const kSigning = hmacSha256(kService, "aws4_request");
    const signature = createHmac("sha256", kSigning)
      .update(stringToSign)
      .digest("hex");

    const authorization = `AWS4-HMAC-SHA256 Credential=${this.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const requestHeaders: Record<string, string> = {
      Authorization: authorization,
      "x-amz-content-sha256": params.payloadHash,
      "x-amz-date": amzDate,
    };

    if (params.contentType) {
      requestHeaders["Content-Type"] = params.contentType;
    }

    return requestHeaders;
  }

  async uploadFile(input: UploadFileInput): Promise<UploadFileResult> {
    if (!this.isConfigured()) {
      throw new AppError(
        "El almacenamiento Cloudflare R2 no está configurado en el servidor",
        500,
        "STORAGE_NOT_CONFIGURED",
      );
    }

    const cleanKey = input.key.replace(/^\/+/, "");
    const canonicalUri = `/${encodeS3Path(`${this.bucket}/${cleanKey}`)}`;
    const payloadHash = sha256Hex(input.body);
    const headers = this.buildSignedHeaders({
      method: "PUT",
      canonicalUri,
      payloadHash,
      contentType: input.contentType,
    });

    const response = await fetch(`${this.endpoint}${canonicalUri}`, {
      method: "PUT",
      headers,
      body: new Uint8Array(input.body),
    });

    if (!response.ok) {
      throw new AppError(
        `No se pudo subir la imagen a Cloudflare R2 (HTTP ${response.status})`,
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
    if (!this.isConfigured()) {
      return null;
    }

    const cleanKey = key.replace(/^\/+/, "");
    const canonicalUri = `/${encodeS3Path(`${this.bucket}/${cleanKey}`)}`;
    const payloadHash = sha256Hex("");
    const headers = this.buildSignedHeaders({
      method: "GET",
      canonicalUri,
      payloadHash,
    });

    const response = await fetch(`${this.endpoint}${canonicalUri}`, {
      method: "GET",
      headers,
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new AppError(
        `Error al leer el archivo desde Cloudflare R2 (HTTP ${response.status})`,
        502,
        "STORAGE_READ_FAILED",
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return {
      body: Buffer.from(arrayBuffer),
      contentType:
        response.headers.get("content-type") ?? "application/octet-stream",
    };
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    const cleanKey = key.replace(/^\/+/, "");
    const canonicalUri = `/${encodeS3Path(`${this.bucket}/${cleanKey}`)}`;
    const payloadHash = sha256Hex("");
    const headers = this.buildSignedHeaders({
      method: "DELETE",
      canonicalUri,
      payloadHash,
    });

    await fetch(`${this.endpoint}${canonicalUri}`, {
      method: "DELETE",
      headers,
    });
  }
}

