import type { IncomingHttpHeaders } from "node:http";
import { fromNodeHeaders } from "better-auth/node";
import {
  ConflictError,
  UnauthorizedError,
} from "../../application/errors/app.error.ts";
import type { AuthenticatedUser, UserRole } from "../../domain/models/user.ts";
import type { UserRepository } from "../../domain/repository/user.repository.ts";
import { auth } from "../auth/better-auth.ts";
import type { LoginDto, RegisterDto } from "../dtos/auth.dto.ts";

export interface AuthSessionResult {
  user: AuthenticatedUser;
  token: string;
}

export interface AuthService {
  register(input: RegisterDto): Promise<AuthSessionResult>;
  login(input: LoginDto): Promise<AuthSessionResult>;
  getUserFromHeaders(
    headers: IncomingHttpHeaders,
  ): Promise<AuthenticatedUser | null>;
}

function normalizeRole(role: unknown): UserRole {
  return role === "admin" ? "admin" : "user";
}

export class BetterAuthService implements AuthService {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async register(input: RegisterDto): Promise<AuthSessionResult> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("El correo electrónico ya está registrado", {
        email: ["El correo electrónico ya está registrado"],
      });
    }

    try {
      const response = await auth.api.signUpEmail({
        body: {
          name: input.name,
          email: input.email,
          password: input.password,
        },
      });

      const dbUser = await this.userRepository.findById(response.user.id);
      const role = dbUser ? dbUser.role : "user";

      return {
        token: response.token ?? "",
        user: {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role,
        },
      };
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      throw new ConflictError("No fue posible registrar el usuario", {
        email: ["El correo electrónico ya está en uso o los datos son inválidos"],
      });
    }
  }

  async login(input: LoginDto): Promise<AuthSessionResult> {
    try {
      const response = await auth.api.signInEmail({
        body: {
          email: input.email,
          password: input.password,
        },
      });

      const dbUser = await this.userRepository.findById(response.user.id);
      const role = dbUser ? dbUser.role : "user";

      return {
        token: response.token,
        user: {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role,
        },
      };
    } catch {
      throw new UnauthorizedError("Credenciales inválidas");
    }
  }

  async getUserFromHeaders(
    headers: IncomingHttpHeaders,
  ): Promise<AuthenticatedUser | null> {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(headers),
      });

      if (!session?.user) {
        return null;
      }

      const dbUser = await this.userRepository.findById(session.user.id);
      if (dbUser) {
        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
        };
      }

      const rawUser = session.user as {
        id: string;
        name: string;
        email: string;
        role?: unknown;
      };

      return {
        id: rawUser.id,
        name: rawUser.name,
        email: rawUser.email,
        role: normalizeRole(rawUser.role),
      };
    } catch {
      return null;
    }
  }
}

