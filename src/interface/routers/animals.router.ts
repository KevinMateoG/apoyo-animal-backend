import { Router } from "express";
import { AnimalsUseCase } from "../../application/animals.use-case.ts";
import { prisma } from "../../infrastructure/repository/client.ts";
import { PrismaAnimalRepository } from "../../infrastructure/repository/prisma-animal.repository.ts";
import { PrismaSpeciesRepository } from "../../infrastructure/repository/prisma-species.repository.ts";
import { AnimalsController } from "../controllers/animals.controller.ts";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware.ts";

const animalRepository = new PrismaAnimalRepository(prisma);
const speciesRepository = new PrismaSpeciesRepository(prisma);
const animalsUseCase = new AnimalsUseCase(animalRepository, speciesRepository);
const animalsController = new AnimalsController(animalsUseCase);

const router = Router();

router.get("/", animalsController.list);
router.get("/:id", animalsController.getById);
router.post("/", requireAuth, requireAdmin, animalsController.create);
router.put("/:id", requireAuth, requireAdmin, animalsController.update);
router.delete("/:id", requireAuth, requireAdmin, animalsController.delete);

export default router;
