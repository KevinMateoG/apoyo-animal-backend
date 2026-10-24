import type { User, UserRole } from "../models/user.ts";

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  updateRole(id: string, role: UserRole): Promise<User>;
}

