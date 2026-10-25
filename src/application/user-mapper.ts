import type {
  AuthenticatedUser,
  User,
  UserRole,
} from "../domain/models/user.ts";

export interface PublicUserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
  createdAt?: Date;
}

export function mapUserToPublic(
  user: User | AuthenticatedUser,
): PublicUserResponse {
  const base: PublicUserResponse = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  if ("image" in user) {
    base.image = user.image;
    base.createdAt = user.createdAt;
  }

  return base;
}

