import type { PrismaClient, User as PrismaUser } from "@prisma/client";
import type { User, UserRole } from "../../domain/models/user.ts";
import type { UserRepository } from "../../domain/repository/user.repository.ts";

function toDomainUser(row: PrismaUser): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    emailVerified: row.emailVerified,
    image: row.image,
    role: row.role === "admin" ? "admin" : "user",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaUserRepository implements UserRepository {
  private readonly db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.db.user.findUnique({ where: { id } });
    return row ? toDomainUser(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return row ? toDomainUser(row) : null;
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    const row = await this.db.user.update({
      where: { id },
      data: { role },
    });
    return toDomainUser(row);
  }
}
