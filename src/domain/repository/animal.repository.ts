import type {
  Animal,
  AnimalStatus,
  CreateAnimalInput,
  UpdateAnimalInput,
} from "../models/animal.ts";

export interface AnimalQueryFilters {
  speciesId?: string;
  search?: string;
  status?: AnimalStatus;
  availableForSponsorship?: boolean;
}

export interface AnimalPageResult {
  items: Animal[];
  totalItems: number;
}

export interface AnimalRepository {
  findPage(
    filters: AnimalQueryFilters,
    offset: number,
    limit: number,
  ): Promise<AnimalPageResult>;
  findById(id: string): Promise<Animal | null>;
  create(data: CreateAnimalInput): Promise<Animal>;
  update(id: string, data: UpdateAnimalInput): Promise<Animal>;
  delete(id: string): Promise<void>;
}

