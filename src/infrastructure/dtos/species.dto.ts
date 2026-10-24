import { BadRequestError } from "../../application/errors/app.error.ts";
import type {
  CreateSpeciesInput,
  UpdateSpeciesInput,
} from "../../domain/models/species.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRequiredString(
  source: Record<string, unknown>,
  field: string,
  label: string,
  details: Record<string, string[]>,
): string {
  const value = source[field];
  if (typeof value !== "string" || value.trim().length === 0) {
    details[field] = [`El campo ${label} es obligatorio`];
    return "";
  }
  return value.trim();
}

export function validateCreateSpeciesDto(body: unknown): CreateSpeciesInput {
  if (!isRecord(body)) {
    throw new BadRequestError("El cuerpo de la petición debe ser un objeto válido");
  }

  const details: Record<string, string[]> = {};

  const scientificName = readRequiredString(
    body,
    "scientificName",
    "nombre científico",
    details,
  );
  const commonName = readRequiredString(
    body,
    "commonName",
    "nombre común",
    details,
  );
  const description = readRequiredString(
    body,
    "description",
    "descripción",
    details,
  );
  const morphology = readRequiredString(
    body,
    "morphology",
    "morfología",
    details,
  );
  const habitat = readRequiredString(body, "habitat", "hábitat", details);
  const diet = readRequiredString(body, "diet", "dieta", details);
  const imageUrl = readRequiredString(body, "imageUrl", "imagen", details);

  let catalogLinkLabel: string | null | undefined;
  if (body.catalogLinkLabel !== undefined && body.catalogLinkLabel !== null) {
    if (typeof body.catalogLinkLabel !== "string") {
      details.catalogLinkLabel = ["La etiqueta del catálogo debe ser un texto"];
    } else {
      catalogLinkLabel = body.catalogLinkLabel.trim() || null;
    }
  }

  let isVisible: boolean | undefined;
  if (body.isVisible !== undefined) {
    if (typeof body.isVisible !== "boolean") {
      details.isVisible = ["El campo isVisible debe ser booleano"];
    } else {
      isVisible = body.isVisible;
    }
  }

  if (Object.keys(details).length > 0) {
    throw new BadRequestError("Datos de especie inválidos", details);
  }

  return {
    scientificName,
    commonName,
    description,
    morphology,
    habitat,
    diet,
    imageUrl,
    catalogLinkLabel,
    isVisible,
  };
}

export function validateUpdateSpeciesDto(body: unknown): UpdateSpeciesInput {
  if (!isRecord(body)) {
    throw new BadRequestError("El cuerpo de la petición debe ser un objeto válido");
  }

  const details: Record<string, string[]> = {};
  const result: UpdateSpeciesInput = {};

  const stringFields: Array<{
    key:
      | "scientificName"
      | "commonName"
      | "description"
      | "morphology"
      | "habitat"
      | "diet"
      | "imageUrl";
    label: string;
  }> = [
    { key: "scientificName", label: "nombre científico" },
    { key: "commonName", label: "nombre común" },
    { key: "description", label: "descripción" },
    { key: "morphology", label: "morfología" },
    { key: "habitat", label: "hábitat" },
    { key: "diet", label: "dieta" },
    { key: "imageUrl", label: "imagen" },
  ];

  for (const { key, label } of stringFields) {
    if (body[key] !== undefined) {
      const value = body[key];
      if (typeof value !== "string" || value.trim().length === 0) {
        details[key] = [`El campo ${label} no puede estar vacío`];
      } else {
        result[key] = value.trim();
      }
    }
  }

  if (body.catalogLinkLabel !== undefined) {
    if (
      body.catalogLinkLabel !== null &&
      typeof body.catalogLinkLabel !== "string"
    ) {
      details.catalogLinkLabel = ["La etiqueta del catálogo debe ser un texto"];
    } else {
      result.catalogLinkLabel =
        typeof body.catalogLinkLabel === "string"
          ? body.catalogLinkLabel.trim() || null
          : null;
    }
  }

  if (body.isVisible !== undefined) {
    if (typeof body.isVisible !== "boolean") {
      details.isVisible = ["El campo isVisible debe ser booleano"];
    } else {
      result.isVisible = body.isVisible;
    }
  }

  if (Object.keys(details).length > 0) {
    throw new BadRequestError("Datos de actualización de especie inválidos", details);
  }

  if (Object.keys(result).length === 0) {
    throw new BadRequestError(
      "Debes enviar al menos un campo para actualizar la especie",
    );
  }

  return result;
}

