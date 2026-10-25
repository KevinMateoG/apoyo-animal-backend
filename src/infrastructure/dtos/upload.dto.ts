import { BadRequestError } from "../../application/errors/app.error.ts";

export type UploadFolder = "animals" | "species";

export interface UploadImageDto {
  fileName: string;
  contentType: string;
  buffer: Buffer;
  folder: UploadFolder;
}

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const MAX_FILE_BYTES = 5 * 1024 * 1024;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getExtensionForMimeType(contentType: string): string {
  return ALLOWED_MIME_TYPES[contentType.toLowerCase()] ?? "jpg";
}

export function validateUploadImageDto(body: unknown): UploadImageDto {
  if (!isRecord(body)) {
    throw new BadRequestError("El cuerpo de la petición debe ser un objeto válido");
  }

  const details: Record<string, string[]> = {};

  const fileName =
    typeof body.fileName === "string" ? body.fileName.trim() : "";
  if (!fileName) {
    details.fileName = ["El nombre del archivo es obligatorio"];
  }

  const contentType =
    typeof body.contentType === "string"
      ? body.contentType.trim().toLowerCase()
      : "";
  if (!contentType || !(contentType in ALLOWED_MIME_TYPES)) {
    details.contentType = [
      "El formato de imagen debe ser JPEG, PNG, WEBP o AVIF",
    ];
  }

  let folder: UploadFolder = "animals";
  if (body.folder !== undefined) {
    if (body.folder !== "animals" && body.folder !== "species") {
      details.folder = ["La carpeta de destino debe ser animals o species"];
    } else {
      folder = body.folder;
    }
  }

  let buffer = Buffer.alloc(0);
  if (typeof body.dataBase64 !== "string" || body.dataBase64.trim().length === 0) {
    details.file = ["El contenido del archivo de imagen es obligatorio"];
  } else {
    const rawBase64 = body.dataBase64.includes(",")
      ? (body.dataBase64.split(",")[1] ?? "")
      : body.dataBase64;
    buffer = Buffer.from(rawBase64, "base64");

    if (buffer.byteLength === 0) {
      details.file = ["El archivo enviado está vacío"];
    } else if (buffer.byteLength > MAX_FILE_BYTES) {
      details.file = ["La imagen no puede superar los 5 MB"];
    }
  }

  if (Object.keys(details).length > 0) {
    throw new BadRequestError("Archivo de imagen inválido", details);
  }

  return {
    fileName,
    contentType,
    buffer,
    folder,
  };
}

