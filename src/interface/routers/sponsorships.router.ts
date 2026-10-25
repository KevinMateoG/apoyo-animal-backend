import { Router } from "express";
import { SponsorshipsUseCase } from "../../application/sponsorships.use-case.ts";
import { prisma } from "../../infrastructure/repository/client.ts";
import { PrismaAnimalRepository } from "../../infrastructure/repository/prisma-animal.repository.ts";
import { PrismaSponsorshipRepository } from "../../infrastructure/repository/prisma-sponsorship.repository.ts";
import { SponsorshipsController } from "../controllers/sponsorships.controller.ts";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware.ts";

const sponsorshipRepository = new PrismaSponsorshipRepository(prisma);
const animalRepository = new PrismaAnimalRepository(prisma);
const sponsorshipsUseCase = new SponsorshipsUseCase(
  sponsorshipRepository,
  animalRepository,
);
const sponsorshipsController = new SponsorshipsController(sponsorshipsUseCase);

const router = Router();

router.post("/", requireAuth, sponsorshipsController.create);
router.get("/mias", requireAuth, sponsorshipsController.listMine);
router.get("/", requireAuth, requireAdmin, sponsorshipsController.listAll);
router.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  sponsorshipsController.updateStatus,
);

export default router;
