import type { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../application/errors/app.error.ts";
import type { SpeciesUseCase } from "../../application/species.use-case.ts";
import {
  validateCreateSpeciesDto,
  validateUpdateSpeciesDto,
} from "../../infrastructure/dtos/species.dto.ts";

function readIdParam(req: Request): string {
  const rawId = req.params.id;
  if (typeof rawId !== "string" || rawId.trim().length === 0) {
    throw new BadRequestError("El identificador de la especie no es válido");
  }
  return rawId.trim();
}

export class SpeciesController {
  private readonly speciesUseCase: SpeciesUseCase;

  constructor(speciesUseCase: SpeciesUseCase) {
    this.speciesUseCase = speciesUseCase;
  }

  list = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const includeHidden = req.query.all === "true";
      const data = await this.speciesUseCase.list(!includeHidden);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = readIdParam(req);
      const species = await this.speciesUseCase.getById(id);
      res.status(200).json({ data: species });
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto = validateCreateSpeciesDto(req.body);
      const created = await this.speciesUseCase.create(dto);
      res.status(201).json({ data: created });
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = readIdParam(req);
      const dto = validateUpdateSpeciesDto(req.body);
      const updated = await this.speciesUseCase.update(id, dto);
      res.status(200).json({ data: updated });
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = readIdParam(req);
      await this.speciesUseCase.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

