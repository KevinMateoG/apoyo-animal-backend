import type {
  Sponsorship,
  SponsorshipStatus,
} from "../domain/models/sponsorship.ts";
import type { AnimalRepository } from "../domain/repository/animal.repository.ts";
import type { SponsorshipRepository } from "../domain/repository/sponsorship.repository.ts";
import type { CreateSponsorshipDto } from "../infrastructure/dtos/sponsorship.dto.ts";
import { BadRequestError, NotFoundError } from "./errors/app.error.ts";

export class SponsorshipsUseCase {
  private readonly sponsorshipRepository: SponsorshipRepository;
  private readonly animalRepository: AnimalRepository;

  constructor(
    sponsorshipRepository: SponsorshipRepository,
    animalRepository: AnimalRepository,
  ) {
    this.sponsorshipRepository = sponsorshipRepository;
    this.animalRepository = animalRepository;
  }

  async create(
    userId: string,
    input: CreateSponsorshipDto,
  ): Promise<Sponsorship> {
    let animalId: string | null = null;

    if (input.type === "ANIMAL") {
      if (!input.animalId) {
        throw new BadRequestError(
          "Debes seleccionar el animal que deseas apadrinar",
          {
            animalId: ["Debes seleccionar el animal que deseas apadrinar"],
          },
        );
      }

      const animal = await this.animalRepository.findById(input.animalId);
      if (!animal) {
        throw new NotFoundError("El animal seleccionado no existe");
      }

      if (animal.status !== "ACTIVE" || !animal.isAvailableForSponsorship) {
        throw new BadRequestError(
          "El animal seleccionado no está disponible para apadrinamiento",
          {
            animalId: [
              "El animal seleccionado no está disponible para apadrinamiento",
            ],
          },
        );
      }

      animalId = animal.id;
    }

    return this.sponsorshipRepository.create({
      type: input.type,
      frequency: input.frequency,
      amount: input.amount,
      userId,
      animalId,
      donorName: input.donorName,
      donorEmail: input.donorEmail,
      donorAddress: input.donorAddress,
      contactConsentAt: new Date(),
    });
  }

  async listByUser(userId: string): Promise<Sponsorship[]> {
    return this.sponsorshipRepository.findByUserId(userId);
  }

  async listAll(): Promise<Sponsorship[]> {
    return this.sponsorshipRepository.findAll();
  }

  async updateStatus(
    id: string,
    status: SponsorshipStatus,
  ): Promise<Sponsorship> {
    const existing = await this.sponsorshipRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Apadrinamiento no encontrado");
    }
    return this.sponsorshipRepository.updateStatus(id, status);
  }
}
