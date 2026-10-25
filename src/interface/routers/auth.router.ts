import { Router } from "express";
import { AuthUseCase } from "../../application/auth.use-case.ts";
import { prisma } from "../../infrastructure/repository/client.ts";
import { PrismaUserRepository } from "../../infrastructure/repository/prisma-user.repository.ts";
import { BetterAuthService } from "../../infrastructure/services/auth.service.ts";
import { AuthController } from "../controllers/auth.controller.ts";

const userRepository = new PrismaUserRepository(prisma);
const authService = new BetterAuthService(userRepository);
const authUseCase = new AuthUseCase(authService);
const authController = new AuthController(authUseCase);

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;
