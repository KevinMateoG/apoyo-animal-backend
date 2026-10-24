import { BadRequestError } from "../../application/errors/app.error.ts";

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateRegisterDto(body: unknown): RegisterDto {
  if (!isRecord(body)) {
    throw new BadRequestError("El cuerpo de la petición debe ser un objeto válido");
  }

  const details: Record<string, string[]> = {};
  const rawName =
    typeof body.name === "string"
      ? body.name.trim()
      : typeof body.nombre === "string"
        ? body.nombre.trim()
        : "";
  const rawEmail =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const rawPassword = typeof body.password === "string" ? body.password : "";

  if (!rawName || rawName.length < 2) {
    details.name = ["El nombre debe tener al menos 2 caracteres"];
  }

  if (!rawEmail) {
    details.email = ["El correo electrónico es obligatorio"];
  } else if (!EMAIL_REGEX.test(rawEmail)) {
    details.email = ["El correo electrónico no tiene un formato válido"];
  }

  if (!rawPassword || rawPassword.length < 8) {
    details.password = ["La contraseña debe tener al menos 8 caracteres"];
  }

  if (Object.keys(details).length > 0) {
    throw new BadRequestError("Datos de registro inválidos", details);
  }

  return {
    name: rawName,
    email: rawEmail,
    password: rawPassword,
  };
}

export function validateLoginDto(body: unknown): LoginDto {
  if (!isRecord(body)) {
    throw new BadRequestError("El cuerpo de la petición debe ser un objeto válido");
  }

  const details: Record<string, string[]> = {};
  const rawEmail =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const rawPassword = typeof body.password === "string" ? body.password : "";

  if (!rawEmail || !EMAIL_REGEX.test(rawEmail)) {
    details.email = ["Ingresa un correo electrónico válido"];
  }

  if (!rawPassword) {
    details.password = ["La contraseña es obligatoria"];
  }

  if (Object.keys(details).length > 0) {
    throw new BadRequestError("Datos de inicio de sesión inválidos", details);
  }

  return {
    email: rawEmail,
    password: rawPassword,
  };
}

