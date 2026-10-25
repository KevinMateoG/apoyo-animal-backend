import { Router } from "express";
import { UsersUseCase } from "../../application/users.use-case.ts";
import { prisma } from "../../infrastructure/repository/client.ts";
import { PrismaUserRepository } from "../../infrastructure/repository/prisma-user.repository.ts";
import { UsersController } from "../controllers/users.controller.ts";
import { requireAuth } from "../middlewares/auth.middleware.ts";

const userRepository = new PrismaUserRepository(prisma);
const usersUseCase = new UsersUseCase(userRepository);
const usersController = new UsersController(usersUseCase);

const router = Router();

router.get("/me", requireAuth, usersController.getMe);

export default router;
