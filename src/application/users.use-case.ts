import type { UserRepository } from "../domain/repository/user.repository.ts";
import { NotFoundError } from "./errors/app.error.ts";
import { mapUserToPublic, type PublicUserResponse } from "./user-mapper.ts";

export class UsersUseCase {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async getById(id: string): Promise<PublicUserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }
    return mapUserToPublic(user);
  }
}

