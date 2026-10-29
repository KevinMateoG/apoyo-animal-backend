import { BadRequestError } from "../../application/errors/app.error.ts";
import type {
  SponsorshipFrequency,
  SponsorshipStatus,
  SponsorshipType,
} from "../../domain/models/sponsorship.ts";

export interface CreateSponsorshipDto {
  type: SponsorshipType;
  frequency: SponsorshipFrequency;
  amount: number;
  animalId: string | null;
  donorName: string;
  donorEmail: string;
  donorAddress: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_SPONSORSHIP_AMOUNT = 10_000_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateCreateSponsorshipDto(
  body: unknown,
): CreateSponsorshipDto {
  if (!isRecord(body)) {
    throw new BadRequestError("El cuerpo de la petición debe ser un objeto válido");
  }

  const details: Record<string, string[]> = {};

  let type: SponsorshipType = "ANIMAL";
  if (body.type !== "ANIMAL" && body.type !== "GENERAL") {
    details.type = ["El tipo de apadrinamiento debe ser ANIMAL o GENERAL"];
  } else {
    type = body.type;
  }

  let frequency: SponsorshipFrequency = "RECURRING";
  if (body.frequency !== "SINGLE" && body.frequency !== "RECURRING") {
    details.frequency = ["La frecuencia debe ser SINGLE o RECURRING"];
  } else {
    frequency = body.frequency;
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount < 1) {
    details.amount = ["El monto del aporte debe ser un número mayor o igual a 1"];
  } else if (amount > MAX_SPONSORSHIP_AMOUNT) {
    details.amount = [
      "El monto del aporte no puede superar los $10.000.000 COP",
    ];
  }

  let animalId: string | null = null;
  if (type === "ANIMAL") {
    if (typeof body.animalId !== "string" || body.animalId.trim().length === 0) {
      details.animalId = ["Debes seleccionar el animal que deseas apadrinar"];
    } else {
      animalId = body.animalId.trim();
    }
  }

  const donorName =
    typeof body.donorName === "string" ? body.donorName.trim() : "";
  if (!donorName) {
    details.donorName = ["El nombre del donante es obligatorio"];
  }

  const donorEmail =
    typeof body.donorEmail === "string"
      ? body.donorEmail.trim().toLowerCase()
      : "";
  if (!donorEmail || !EMAIL_REGEX.test(donorEmail)) {
    details.donorEmail = ["El correo del donante debe tener un formato válido"];
  }

  const donorAddress =
    typeof body.donorAddress === "string" ? body.donorAddress.trim() : "";
  if (!donorAddress) {
    details.donorAddress = ["La dirección del donante es obligatoria"];
  }

  if (body.consent !== undefined && body.consent !== true) {
    details.consent = ["Debes aceptar el consentimiento de contacto"];
  }

  if (Object.keys(details).length > 0) {
    throw new BadRequestError("Datos de apadrinamiento inválidos", details);
  }

  return {
    type,
    frequency,
    amount,
    animalId,
    donorName,
    donorEmail,
    donorAddress,
  };
}

export function validateUpdateSponsorshipStatusDto(
  body: unknown,
): SponsorshipStatus {
  if (!isRecord(body)) {
    throw new BadRequestError("El cuerpo de la petición debe ser un objeto válido");
  }

  if (
    body.status !== "PENDING" &&
    body.status !== "CONFIRMED" &&
    body.status !== "CANCELLED"
  ) {
    throw new BadRequestError(
      "El estado debe ser PENDING, CONFIRMED o CANCELLED",
      {
        status: ["El estado debe ser PENDING, CONFIRMED o CANCELLED"],
      },
    );
  }

  return body.status;
}

