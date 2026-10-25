import "dotenv/config";
import cors from "cors";
import express, { type Express, type Request, type Response } from "express";
import {
  errorMiddleware,
  notFoundHandler,
} from "./interface/middlewares/global.handlers.ts";
import animalsRoutes from "./interface/routers/animals.router.ts";
import authRoutes from "./interface/routers/auth.router.ts";
import speciesRoutes from "./interface/routers/species.router.ts";
import sponsorshipsRoutes from "./interface/routers/sponsorships.router.ts";
import usersRoutes from "./interface/routers/users.router.ts";

const app: Express = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  }),
);
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send({
    success: true,
    message: "API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/animals", animalsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/species", speciesRoutes);
app.use("/api/sponsorships", sponsorshipsRoutes);

app.use(notFoundHandler);
app.use(errorMiddleware);

const PORT = process.env["PORT"] || 3000;
app.listen(PORT, () => {
  console.log(`Api running: http://localhost:${PORT}`);
});
