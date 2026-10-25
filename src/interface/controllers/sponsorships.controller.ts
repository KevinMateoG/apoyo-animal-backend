import type { NextFunction, Request, Response } from "express";
import {
  BadRequestError,
  UnauthorizedError,
} from "../../application/errors/app.error.ts";
import type { SponsorshipsUseCase } from "../../application/sponsorships.use-case.ts";
import {
  validateCreateSponsorshipDto,
  validateUpdateSponsorshipStatusDto,
} from "../../infrastructure/dtos/sponsorship.dto.ts";

function readIdParam(req: Request): string {
  const rawId = req.params.id;
  if (typeof rawId !== "string" || rawId.trim().length === 0) {
    throw new BadRequestError("El identificador del apadrinamiento no es válido");
  }
  return rawId.trim();
}

export class SponsorshipsController {
  private readonly sponsorshipsUseCase: SponsorshipsUseCase;

  constructor(sponsorshipsUseCase: SponsorshipsUseCase) {
    this.sponsorshipsUseCase = sponsorshipsUseCase;
  }

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const dto = validateCreateSponsorshipDto(req.body);
      const created = await this.sponsorshipsUseCase.create(req.user.id, dto);
      res.status(201).json({ data: created });
    } catch (error) {
      next(error);
    }
  };

  listMine = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const data = await this.sponsorshipsUseCase.listByUser(req.user.id);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  listAll = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.sponsorshipsUseCase.listAll();
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = readIdParam(req);
      const status = validateUpdateSponsorshipStatusDto(req.body);
      const updated = await this.sponsorshipsUseCase.updateStatus(id, status);
      res.status(200).json({ data: updated });
    } catch (error) {
      next(error);
    }
  };
}

