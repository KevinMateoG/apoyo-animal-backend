import type { NextFunction, Request, RequestHandler, Response } from "express";
import { AuthUseCase } from "../../application/auth.use-case.ts";
import {
  ForbiddenError,
  UnauthorizedError,
} from "../../application/errors/app.error.ts";
import type { AuthenticatedUser } from "../../domain/models/user.ts";
import { prisma } from "../../infrastructure/repository/client.ts";
import { PrismaUserRepository } from "../../infrastructure/repository/prisma-user.repository.ts";
import { BetterAuthService } from "../../infrastructure/services/auth.service.ts";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const userRepository = new PrismaUserRepository(prisma);
const authService = new BetterAuthService(userRepository);
const authUseCase = new AuthUseCase(authService);

export const requireAuth: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    req.user = await authUseCase.authenticateHeaders(req.headers);
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    next(new UnauthorizedError("No autenticado"));
    return;
  }

  if (req.user.role !== "admin") {
    next(
      new ForbiddenError(
        "Solo los administradores pueden realizar esta acción",
      ),
    );
    return;
  }

  next();
};
