import type { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../application/errors/app.error.ts";
import type { UploadsUseCase } from "../../application/uploads.use-case.ts";
import { validateUploadImageDto } from "../../infrastructure/dtos/upload.dto.ts";

export class UploadsController {
  private readonly uploadsUseCase: UploadsUseCase;

  constructor(uploadsUseCase: UploadsUseCase) {
    this.uploadsUseCase = uploadsUseCase;
  }

  uploadImage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto = validateUploadImageDto(req.body);
      const uploaded = await this.uploadsUseCase.uploadImage(dto);
      res.status(201).json({
        data: {
          imageUrl: uploaded.url,
          key: uploaded.key,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getImage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const folder = req.params.folder;
      const fileName = req.params.fileName;

      if (
        (folder !== "animals" && folder !== "species") ||
        typeof fileName !== "string" ||
        fileName.trim().length === 0 ||
        fileName.includes("..")
      ) {
        throw new BadRequestError("Ruta de imagen no válida");
      }

      const file = await this.uploadsUseCase.getImage(folder, fileName.trim());
      res.setHeader("Content-Type", file.contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.status(200).send(file.body);
    } catch (error) {
      next(error);
    }
  };
}

