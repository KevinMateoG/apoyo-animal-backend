import type { NextFunction, Request, Response } from "express";
import type { AuthUseCase } from "../../application/auth.use-case.ts";
import {
  validateLoginDto,
  validateRegisterDto,
} from "../../infrastructure/dtos/auth.dto.ts";

export class AuthController {
  private readonly authUseCase: AuthUseCase;

  constructor(authUseCase: AuthUseCase) {
    this.authUseCase = authUseCase;
  }

  register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto = validateRegisterDto(req.body);
      const result = await this.authUseCase.register(dto);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto = validateLoginDto(req.body);
      const result = await this.authUseCase.login(dto);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

