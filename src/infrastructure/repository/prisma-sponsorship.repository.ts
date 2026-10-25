import type {
  Animal as PrismaAnimal,
  PrismaClient,
  Species as PrismaSpecies,
  Sponsorship as PrismaSponsorship,
  User as PrismaUser,
} from "@prisma/client";
import type {
  CreateSponsorshipInput,
  Sponsorship,
  SponsorshipStatus,
} from "../../domain/models/sponsorship.ts";
import type { SponsorshipRepository } from "../../domain/repository/sponsorship.repository.ts";

type PrismaSponsorshipWithRelations = PrismaSponsorship & {
  animal?: (PrismaAnimal & { species?: PrismaSpecies }) | null;
  user?: PrismaUser;
};

function toDomainSponsorship(row: PrismaSponsorshipWithRelations): Sponsorship {
  return {
    id: row.id,
    type: row.type,
    frequency: row.frequency,
    status: row.status,
    amount: Number(row.amount),
    userId: row.userId,
    animalId: row.animalId,
    donorName: row.donorName,
    donorEmail: row.donorEmail,
    donorAddress: row.donorAddress,
    contactConsentAt: row.contactConsentAt,
    animal: row.animal
      ? {
          id: row.animal.id,
          name: row.animal.name,
          speciesId: row.animal.speciesId,
          speciesCommonName: row.animal.species?.commonName,
        }
      : null,
    user: row.user
      ? {
          id: row.user.id,
          name: row.user.name,
          email: row.user.email,
        }
      : undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaSponsorshipRepository implements SponsorshipRepository {
  private readonly db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  async create(data: CreateSponsorshipInput): Promise<Sponsorship> {
    const row = await this.db.sponsorship.create({
      data: {
        type: data.type,
        frequency: data.frequency,
        amount: data.amount,
        userId: data.userId,
        animalId: data.animalId,
        donorName: data.donorName,
        donorEmail: data.donorEmail,
        donorAddress: data.donorAddress,
        contactConsentAt: data.contactConsentAt,
      },
      include: {
        animal: { include: { species: true } },
        user: true,
      },
    });
    return toDomainSponsorship(row);
  }

  async findByUserId(userId: string): Promise<Sponsorship[]> {
    const rows = await this.db.sponsorship.findMany({
      where: { userId },
      include: {
        animal: { include: { species: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toDomainSponsorship);
  }

  async findAll(): Promise<Sponsorship[]> {
    const rows = await this.db.sponsorship.findMany({
      include: {
        animal: { include: { species: true } },
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toDomainSponsorship);
  }

  async findById(id: string): Promise<Sponsorship | null> {
    const row = await this.db.sponsorship.findUnique({
      where: { id },
      include: {
        animal: { include: { species: true } },
        user: true,
      },
    });
    return row ? toDomainSponsorship(row) : null;
  }

  async updateStatus(
    id: string,
    status: SponsorshipStatus,
  ): Promise<Sponsorship> {
    const row = await this.db.sponsorship.update({
      where: { id },
      data: { status },
      include: {
        animal: { include: { species: true } },
        user: true,
      },
    });
    return toDomainSponsorship(row);
  }
}
