import type { NextFunction, Request, Response } from "express";
import { parseAnimalFilters } from "../../application/animal-filters.ts";
import type { AnimalsUseCase } from "../../application/animals.use-case.ts";
import { BadRequestError } from "../../application/errors/app.error.ts";
import { parsePagination } from "../../application/pagination.ts";
import {
  validateCreateAnimalDto,
  validateUpdateAnimalDto,
} from "../../infrastructure/dtos/animal.dto.ts";

function readIdParam(req: Request): string {
  const rawId = req.params.id;
  if (typeof rawId !== "string" || rawId.trim().length === 0) {
    throw new BadRequestError("El identificador del animal no es válido");
  }
  return rawId.trim();
}

export class AnimalsController {
  private readonly animalsUseCase: AnimalsUseCase;

  constructor(animalsUseCase: AnimalsUseCase) {
    this.animalsUseCase = animalsUseCase;
  }

  list = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const filters = parseAnimalFilters(req.query);
      const pagination = parsePagination(req.query);
      const pageResult = await this.animalsUseCase.list(filters, pagination);
      res.status(200).json(pageResult);
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
      const animal = await this.animalsUseCase.getById(id);
      res.status(200).json({ data: animal });
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
      const dto = validateCreateAnimalDto(req.body);
      const created = await this.animalsUseCase.create(dto);
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
      const dto = validateUpdateAnimalDto(req.body);
      const updated = await this.animalsUseCase.update(id, dto);
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
      await this.animalsUseCase.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

