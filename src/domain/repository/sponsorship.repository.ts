import type {
  CreateSponsorshipInput,
  Sponsorship,
  SponsorshipStatus,
} from "../models/sponsorship.ts";

export interface SponsorshipRepository {
  create(data: CreateSponsorshipInput): Promise<Sponsorship>;
  findByUserId(userId: string): Promise<Sponsorship[]>;
  findAll(): Promise<Sponsorship[]>;
  findById(id: string): Promise<Sponsorship | null>;
  updateStatus(id: string, status: SponsorshipStatus): Promise<Sponsorship>;
}

