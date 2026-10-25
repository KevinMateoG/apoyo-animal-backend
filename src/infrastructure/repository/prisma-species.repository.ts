import type { PrismaClient, Species as PrismaSpecies } from "@prisma/client";
import type {
  CreateSpeciesInput,
  Species,
  UpdateSpeciesInput,
} from "../../domain/models/species.ts";
import type { SpeciesRepository } from "../../domain/repository/species.repository.ts";

function toDomainSpecies(row: PrismaSpecies): Species {
  return {
    id: row.id,
    scientificName: row.scientificName,
    commonName: row.commonName,
    description: row.description,
    morphology: row.morphology,
    habitat: row.habitat,
    diet: row.diet,
    imageUrl: row.imageUrl,
    catalogLinkLabel: row.catalogLinkLabel,
    isVisible: row.isVisible,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaSpeciesRepository implements SpeciesRepository {
  private readonly db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findAll(onlyVisible = true): Promise<Species[]> {
    const rows = await this.db.species.findMany({
      where: onlyVisible ? { isVisible: true } : undefined,
      orderBy: { commonName: "asc" },
    });
    return rows.map(toDomainSpecies);
  }

  async findById(id: string): Promise<Species | null> {
    const row = await this.db.species.findUnique({ where: { id } });
    return row ? toDomainSpecies(row) : null;
  }

  async findByScientificName(scientificName: string): Promise<Species | null> {
    const row = await this.db.species.findUnique({
      where: { scientificName },
    });
    return row ? toDomainSpecies(row) : null;
  }

  async create(data: CreateSpeciesInput): Promise<Species> {
    const row = await this.db.species.create({
      data: {
        scientificName: data.scientificName,
        commonName: data.commonName,
        description: data.description,
        morphology: data.morphology,
        habitat: data.habitat,
        diet: data.diet,
        imageUrl: data.imageUrl,
        catalogLinkLabel: data.catalogLinkLabel ?? null,
        isVisible: data.isVisible ?? true,
      },
    });
    return toDomainSpecies(row);
  }

  async update(id: string, data: UpdateSpeciesInput): Promise<Species> {
    const row = await this.db.species.update({
      where: { id },
      data,
    });
    return toDomainSpecies(row);
  }

  async delete(id: string): Promise<void> {
    await this.db.species.delete({ where: { id } });
  }
}
