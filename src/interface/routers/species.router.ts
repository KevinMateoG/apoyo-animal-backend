import { Router } from "express";
import { SpeciesUseCase } from "../../application/species.use-case.ts";
import { prisma } from "../../infrastructure/repository/client.ts";
import { PrismaSpeciesRepository } from "../../infrastructure/repository/prisma-species.repository.ts";
import { SpeciesController } from "../controllers/species.controller.ts";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware.ts";

const speciesRepository = new PrismaSpeciesRepository(prisma);
const speciesUseCase = new SpeciesUseCase(speciesRepository);
const speciesController = new SpeciesController(speciesUseCase);

const router = Router();

router.get("/", speciesController.list);
router.get("/:id", speciesController.getById);
router.post("/", requireAuth, requireAdmin, speciesController.create);
router.put("/:id", requireAuth, requireAdmin, speciesController.update);
router.delete("/:id", requireAuth, requireAdmin, speciesController.delete);

export default router;
