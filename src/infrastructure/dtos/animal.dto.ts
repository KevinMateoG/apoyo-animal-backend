import { BadRequestError } from "../../application/errors/app.error.ts";
import type {
  AnimalSex,
  AnimalStatus,
  CreateAnimalInput,
  UpdateAnimalInput,
} from "../../domain/models/animal.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseBirthDate(
  body: Record<string, unknown>,
  details: Record<string, string[]>,
): Date | null | undefined {
  if (body.birthDate !== undefined) {
    if (body.birthDate === null || body.birthDate === "") {
      return null;
    }
    if (typeof body.birthDate !== "string") {
      details.birthDate = ["La fecha de nacimiento debe ser una fecha válida"];
      return undefined;
    }
    const parsed = new Date(body.birthDate);
    if (Number.isNaN(parsed.getTime())) {
      details.birthDate = ["La fecha de nacimiento no tiene un formato válido"];
      return undefined;
    }
    return parsed;
  }

  if (body.ageYears !== undefined || body.age !== undefined) {
    const rawAge = body.ageYears !== undefined ? body.ageYears : body.age;
    const numericAge = Number(rawAge);
    if (!Number.isInteger(numericAge) || numericAge < 0 || numericAge > 100) {
      details.ageYears = ["La edad debe ser un número entero entre 0 y 100"];
      return undefined;
    }
    const currentYear = new Date().getUTCFullYear();
    return new Date(Date.UTC(currentYear - numericAge, 0, 1));
  }

  return undefined;
}

export function validateCreateAnimalDto(body: unknown): CreateAnimalInput {
  if (!isRecord(body)) {
    throw new BadRequestError("El cuerpo de la petición debe ser un objeto válido");
  }

  const details: Record<string, string[]> = {};

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    details.name = ["El nombre del animal es obligatorio"];
  }

  const speciesId =
    typeof body.speciesId === "string" ? body.speciesId.trim() : "";
  if (!speciesId) {
    details.speciesId = ["La especie del animal es obligatoria"];
  }

  let sex: AnimalSex = "MALE";
  if (body.sex !== "MALE" && body.sex !== "FEMALE") {
    details.sex = ["El sexo debe ser MALE o FEMALE"];
  } else {
    sex = body.sex;
  }

  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  if (!description) {
    details.description = ["La descripción del animal es obligatoria"];
  }

  const birthDate = parseBirthDate(body, details);

  let imageUrl: string | null | undefined;
  if (body.imageUrl !== undefined && body.imageUrl !== null) {
    if (typeof body.imageUrl !== "string") {
      details.imageUrl = ["La URL de imagen debe ser un texto"];
    } else {
      imageUrl = body.imageUrl.trim() || null;
    }
  }

  let status: AnimalStatus | undefined;
  if (body.status !== undefined) {
    if (body.status !== "ACTIVE" && body.status !== "INACTIVE") {
      details.status = ["El estado debe ser ACTIVE o INACTIVE"];
    } else {
      status = body.status;
    }
  }

  let isAvailableForSponsorship: boolean | undefined;
  if (body.isAvailableForSponsorship !== undefined) {
    if (typeof body.isAvailableForSponsorship !== "boolean") {
      details.isAvailableForSponsorship = [
        "El campo isAvailableForSponsorship debe ser booleano",
      ];
    } else {
      isAvailableForSponsorship = body.isAvailableForSponsorship;
    }
  }

  if (Object.keys(details).length > 0) {
    throw new BadRequestError("Datos de animal inválidos", details);
  }

  return {
    name,
    speciesId,
    sex,
    birthDate,
    description,
    imageUrl,
    status,
    isAvailableForSponsorship,
  };
}

export function validateUpdateAnimalDto(body: unknown): UpdateAnimalInput {
  if (!isRecord(body)) {
    throw new BadRequestError("El cuerpo de la petición debe ser un objeto válido");
  }

  const details: Record<string, string[]> = {};
  const result: UpdateAnimalInput = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      details.name = ["El nombre del animal no puede estar vacío"];
    } else {
      result.name = body.name.trim();
    }
  }

  if (body.speciesId !== undefined) {
    if (
      typeof body.speciesId !== "string" ||
      body.speciesId.trim().length === 0
    ) {
      details.speciesId = ["La especie del animal no puede estar vacía"];
    } else {
      result.speciesId = body.speciesId.trim();
    }
  }

  if (body.sex !== undefined) {
    if (body.sex !== "MALE" && body.sex !== "FEMALE") {
      details.sex = ["El sexo debe ser MALE o FEMALE"];
    } else {
      result.sex = body.sex;
    }
  }

  if (body.description !== undefined) {
    if (
      typeof body.description !== "string" ||
      body.description.trim().length === 0
    ) {
      details.description = ["La descripción no puede estar vacía"];
    } else {
      result.description = body.description.trim();
    }
  }

  const birthDate = parseBirthDate(body, details);
  if (birthDate !== undefined) {
    result.birthDate = birthDate;
  }

  if (body.imageUrl !== undefined) {
    if (body.imageUrl !== null && typeof body.imageUrl !== "string") {
      details.imageUrl = ["La URL de imagen debe ser un texto"];
    } else {
      result.imageUrl =
        typeof body.imageUrl === "string" ? body.imageUrl.trim() || null : null;
    }
  }

  if (body.status !== undefined) {
    if (body.status !== "ACTIVE" && body.status !== "INACTIVE") {
      details.status = ["El estado debe ser ACTIVE o INACTIVE"];
    } else {
      result.status = body.status;
    }
  }

  if (body.isAvailableForSponsorship !== undefined) {
    if (typeof body.isAvailableForSponsorship !== "boolean") {
      details.isAvailableForSponsorship = [
        "El campo isAvailableForSponsorship debe ser booleano",
      ];
    } else {
      result.isAvailableForSponsorship = body.isAvailableForSponsorship;
    }
  }

  if (Object.keys(details).length > 0) {
    throw new BadRequestError("Datos de actualización de animal inválidos", details);
  }

  if (Object.keys(result).length === 0) {
    throw new BadRequestError(
      "Debes enviar al menos un campo para actualizar el animal",
    );
  }

  return result;
}

