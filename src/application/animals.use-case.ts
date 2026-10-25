import type {
  Animal,
  CreateAnimalInput,
  UpdateAnimalInput,
} from "../domain/models/animal.ts";
import type {
  AnimalQueryFilters,
  AnimalRepository,
} from "../domain/repository/animal.repository.ts";
import type { SpeciesRepository } from "../domain/repository/species.repository.ts";
import { BadRequestError, NotFoundError } from "./errors/app.error.ts";
import {
  buildPaginatedResponse,
  type PaginatedResponse,
  type PaginationParams,
} from "./pagination.ts";

export class AnimalsUseCase {
  private readonly animalRepository: AnimalRepository;
  private readonly speciesRepository: SpeciesRepository;

  constructor(
    animalRepository: AnimalRepository,
    speciesRepository: SpeciesRepository,
  ) {
    this.animalRepository = animalRepository;
    this.speciesRepository = speciesRepository;
  }

  async list(
    filters: AnimalQueryFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<Animal>> {
    const { items, totalItems } = await this.animalRepository.findPage(
      filters,
      pagination.offset,
      pagination.pageSize,
    );
    return buildPaginatedResponse(items, totalItems, pagination);
  }

  async getById(id: string): Promise<Animal> {
    const animal = await this.animalRepository.findById(id);
    if (!animal) {
      throw new NotFoundError("Animal no encontrado");
    }
    return animal;
  }

  async create(input: CreateAnimalInput): Promise<Animal> {
    const species = await this.speciesRepository.findById(input.speciesId);
    if (!species) {
      throw new BadRequestError("La especie seleccionada no existe", {
        speciesId: ["La especie seleccionada no existe"],
      });
    }

    return this.animalRepository.create({
      ...input,
      imageUrl: input.imageUrl ?? species.imageUrl,
    });
  }

  async update(id: string, input: UpdateAnimalInput): Promise<Animal> {
    const existing = await this.animalRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Animal no encontrado");
    }

    if (input.speciesId && input.speciesId !== existing.speciesId) {
      const species = await this.speciesRepository.findById(input.speciesId);
      if (!species) {
        throw new BadRequestError("La especie seleccionada no existe", {
          speciesId: ["La especie seleccionada no existe"],
        });
      }
    }

    return this.animalRepository.update(id, input);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.animalRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Animal no encontrado");
    }
    await this.animalRepository.delete(id);
  }
}

