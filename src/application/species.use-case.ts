import type {
  CreateSpeciesInput,
  Species,
  UpdateSpeciesInput,
} from "../domain/models/species.ts";
import type { SpeciesRepository } from "../domain/repository/species.repository.ts";
import { ConflictError, NotFoundError } from "./errors/app.error.ts";

export class SpeciesUseCase {
  private readonly speciesRepository: SpeciesRepository;

  constructor(speciesRepository: SpeciesRepository) {
    this.speciesRepository = speciesRepository;
  }

  async list(onlyVisible = true): Promise<Species[]> {
    return this.speciesRepository.findAll(onlyVisible);
  }

  async getById(id: string): Promise<Species> {
    const species = await this.speciesRepository.findById(id);
    if (!species) {
      throw new NotFoundError("Especie no encontrada");
    }
    return species;
  }

  async create(input: CreateSpeciesInput): Promise<Species> {
    const existing = await this.speciesRepository.findByScientificName(
      input.scientificName,
    );
    if (existing) {
      throw new ConflictError(
        "Ya existe una especie con ese nombre científico",
        {
          scientificName: ["Ya existe una especie con ese nombre científico"],
        },
      );
    }
    return this.speciesRepository.create(input);
  }

  async update(id: string, input: UpdateSpeciesInput): Promise<Species> {
    const current = await this.speciesRepository.findById(id);
    if (!current) {
      throw new NotFoundError("Especie no encontrada");
    }

    if (
      input.scientificName &&
      input.scientificName !== current.scientificName
    ) {
      const duplicate = await this.speciesRepository.findByScientificName(
        input.scientificName,
      );
      if (duplicate && duplicate.id !== id) {
        throw new ConflictError(
          "Ya existe una especie con ese nombre científico",
          {
            scientificName: ["Ya existe una especie con ese nombre científico"],
          },
        );
      }
    }

    return this.speciesRepository.update(id, input);
  }

  async delete(id: string): Promise<void> {
    const current = await this.speciesRepository.findById(id);
    if (!current) {
      throw new NotFoundError("Especie no encontrada");
    }
    await this.speciesRepository.delete(id);
  }
}

