export type AnimalSex = "MALE" | "FEMALE";
export type AnimalStatus = "ACTIVE" | "INACTIVE";

export interface AnimalSpeciesSummary {
  id: string;
  scientificName: string;
  commonName: string;
  imageUrl: string;
}

export interface Animal {
  id: string;
  name: string;
  speciesId: string;
  sex: AnimalSex;
  birthDate: Date | null;
  ageYears: number | null;
  description: string;
  imageUrl: string | null;
  status: AnimalStatus;
  isAvailableForSponsorship: boolean;
  species?: AnimalSpeciesSummary;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAnimalInput {
  name: string;
  speciesId: string;
  sex: AnimalSex;
  birthDate?: Date | null;
  description: string;
  imageUrl?: string | null;
  status?: AnimalStatus;
  isAvailableForSponsorship?: boolean;
}

export interface UpdateAnimalInput {
  name?: string;
  speciesId?: string;
  sex?: AnimalSex;
  birthDate?: Date | null;
  description?: string;
  imageUrl?: string | null;
  status?: AnimalStatus;
  isAvailableForSponsorship?: boolean;
}

