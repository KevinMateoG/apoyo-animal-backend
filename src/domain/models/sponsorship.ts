export type SponsorshipType = "ANIMAL" | "GENERAL";
export type SponsorshipFrequency = "SINGLE" | "RECURRING";
export type SponsorshipStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface SponsorshipAnimalSummary {
  id: string;
  name: string;
  speciesId: string;
  speciesCommonName?: string;
}

export interface SponsorshipUserSummary {
  id: string;
  name: string;
  email: string;
}

export interface Sponsorship {
  id: string;
  type: SponsorshipType;
  frequency: SponsorshipFrequency;
  status: SponsorshipStatus;
  amount: number;
  userId: string;
  animalId: string | null;
  donorName: string;
  donorEmail: string;
  donorAddress: string;
  contactConsentAt: Date;
  animal?: SponsorshipAnimalSummary | null;
  user?: SponsorshipUserSummary;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSponsorshipInput {
  type: SponsorshipType;
  frequency: SponsorshipFrequency;
  amount: number;
  userId: string;
  animalId: string | null;
  donorName: string;
  donorEmail: string;
  donorAddress: string;
  contactConsentAt: Date;
}

