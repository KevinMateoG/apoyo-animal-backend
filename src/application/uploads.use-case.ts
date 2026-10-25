import { randomUUID } from "node:crypto";
import {
  getExtensionForMimeType,
  type UploadImageDto,
} from "../infrastructure/dtos/upload.dto.ts";
import type {
  StorageService,
  StoredFileObject,
  UploadFileResult,
} from "../infrastructure/services/storage.service.ts";
import { NotFoundError } from "./errors/app.error.ts";

function sanitizeBaseName(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^/.]+$/, "");
  const slug = withoutExt
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "imagen";
}

export class UploadsUseCase {
  private readonly storageService: StorageService;

  constructor(storageService: StorageService) {
    this.storageService = storageService;
  }

  async uploadImage(input: UploadImageDto): Promise<UploadFileResult> {
    const ext = getExtensionForMimeType(input.contentType);
    const baseName = sanitizeBaseName(input.fileName);
    const uniqueSuffix = randomUUID().slice(0, 8);
    const key = `${input.folder}/${baseName}-${uniqueSuffix}.${ext}`;

    return this.storageService.uploadFile({
      key,
      body: input.buffer,
      contentType: input.contentType,
    });
  }

  async getImage(folder: string, fileName: string): Promise<StoredFileObject> {
    const key = `${folder}/${fileName}`;
    const stored = await this.storageService.getFile(key);
    if (!stored) {
      throw new NotFoundError("Imagen no encontrada en el almacenamiento");
    }
    return stored;
  }
}

