import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../../application/errors/app.error.ts";
import type { UsersUseCase } from "../../application/users.use-case.ts";

export class UsersController {
  private readonly usersUseCase: UsersUseCase;

  constructor(usersUseCase: UsersUseCase) {
    this.usersUseCase = usersUseCase;
  }

  getMe = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const user = await this.usersUseCase.getById(req.user.id);
      res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  };
}

