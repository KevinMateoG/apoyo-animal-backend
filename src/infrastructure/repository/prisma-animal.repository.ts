import type {
  Animal as PrismaAnimal,
  Prisma,
  PrismaClient,
  Species as PrismaSpecies,
} from "@prisma/client";
import type {
  Animal,
  CreateAnimalInput,
  UpdateAnimalInput,
} from "../../domain/models/animal.ts";
import type {
  AnimalPageResult,
  AnimalQueryFilters,
  AnimalRepository,
} from "../../domain/repository/animal.repository.ts";

type PrismaAnimalWithSpecies = PrismaAnimal & {
  species?: PrismaSpecies;
};

function calculateAgeYears(birthDate: Date | null): number | null {
  if (!birthDate) {
    return null;
  }
  const now = new Date();
  let age = now.getUTCFullYear() - birthDate.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - birthDate.getUTCMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && now.getUTCDate() < birthDate.getUTCDate())
  ) {
    age -= 1;
  }
  return Math.max(0, age);
}

function toDomainAnimal(row: PrismaAnimalWithSpecies): Animal {
  return {
    id: row.id,
    name: row.name,
    speciesId: row.speciesId,
    sex: row.sex,
    birthDate: row.birthDate,
    ageYears: calculateAgeYears(row.birthDate),
    description: row.description,
    imageUrl: row.imageUrl ?? row.species?.imageUrl ?? null,
    status: row.status,
    isAvailableForSponsorship: row.isAvailableForSponsorship,
    species: row.species
      ? {
          id: row.species.id,
          scientificName: row.species.scientificName,
          commonName: row.species.commonName,
          imageUrl: row.species.imageUrl,
        }
      : undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaAnimalRepository implements AnimalRepository {
  private readonly db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findPage(
    filters: AnimalQueryFilters,
    offset: number,
    limit: number,
  ): Promise<AnimalPageResult> {
    const where: Prisma.AnimalWhereInput = {
      status: filters.status ?? "ACTIVE",
    };

    if (filters.speciesId) {
      where.speciesId = filters.speciesId;
    }

    if (filters.availableForSponsorship !== undefined) {
      where.isAvailableForSponsorship = filters.availableForSponsorship;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        {
          species: {
            commonName: { contains: filters.search, mode: "insensitive" },
          },
        },
      ];
    }

    const [rows, totalItems] = await this.db.$transaction([
      this.db.animal.findMany({
        where,
        include: { species: true },
        orderBy: { createdAt: "asc" },
        skip: offset,
        take: limit,
      }),
      this.db.animal.count({ where }),
    ]);

    return {
      items: rows.map(toDomainAnimal),
      totalItems,
    };
  }

  async findById(id: string): Promise<Animal | null> {
    const row = await this.db.animal.findUnique({
      where: { id },
      include: { species: true },
    });
    return row ? toDomainAnimal(row) : null;
  }

  async create(data: CreateAnimalInput): Promise<Animal> {
    const row = await this.db.animal.create({
      data: {
        name: data.name,
        speciesId: data.speciesId,
        sex: data.sex,
        birthDate: data.birthDate ?? null,
        description: data.description,
        imageUrl: data.imageUrl ?? null,
        status: data.status ?? "ACTIVE",
        isAvailableForSponsorship: data.isAvailableForSponsorship ?? true,
      },
      include: { species: true },
    });
    return toDomainAnimal(row);
  }

  async update(id: string, data: UpdateAnimalInput): Promise<Animal> {
    const row = await this.db.animal.update({
      where: { id },
      data,
      include: { species: true },
    });
    return toDomainAnimal(row);
  }

  async delete(id: string): Promise<void> {
    await this.db.animal.delete({ where: { id } });
  }
}
