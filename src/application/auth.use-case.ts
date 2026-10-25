import type { IncomingHttpHeaders } from "node:http";
import type { AuthenticatedUser } from "../domain/models/user.ts";
import type { LoginDto, RegisterDto } from "../infrastructure/dtos/auth.dto.ts";
import type { AuthService } from "../infrastructure/services/auth.service.ts";
import { UnauthorizedError } from "./errors/app.error.ts";
import { mapUserToPublic, type PublicUserResponse } from "./user-mapper.ts";

export interface AuthResponse {
  user: PublicUserResponse;
  token: string;
}

export class AuthUseCase {
  private readonly authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async register(input: RegisterDto): Promise<AuthResponse> {
    const result = await this.authService.register(input);
    return {
      user: mapUserToPublic(result.user),
      token: result.token,
    };
  }

  async login(input: LoginDto): Promise<AuthResponse> {
    const result = await this.authService.login(input);
    return {
      user: mapUserToPublic(result.user),
      token: result.token,
    };
  }

  async authenticateHeaders(
    headers: IncomingHttpHeaders,
  ): Promise<AuthenticatedUser> {
    const user = await this.authService.getUserFromHeaders(headers);
    if (!user) {
      throw new UnauthorizedError("Sesión inválida o no proporcionada");
    }
    return user;
  }
}

