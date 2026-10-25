import { Router } from "express";
import { UploadsUseCase } from "../../application/uploads.use-case.ts";
import { R2StorageService } from "../../infrastructure/services/storage.service.ts";
import { UploadsController } from "../controllers/uploads.controller.ts";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware.ts";

const storageService = new R2StorageService();
const uploadsUseCase = new UploadsUseCase(storageService);
const uploadsController = new UploadsController(uploadsUseCase);

const router = Router();

router.get("/:folder/:fileName", uploadsController.getImage);
router.post("/", requireAuth, requireAdmin, uploadsController.uploadImage);

export default router;

