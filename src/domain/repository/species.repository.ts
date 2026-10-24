import type {
  CreateSpeciesInput,
  Species,
  UpdateSpeciesInput,
} from "../models/species.ts";

export interface SpeciesRepository {
  findAll(onlyVisible?: boolean): Promise<Species[]>;
  findById(id: string): Promise<Species | null>;
  findByScientificName(scientificName: string): Promise<Species | null>;
  create(data: CreateSpeciesInput): Promise<Species>;
  update(id: string, data: UpdateSpeciesInput): Promise<Species>;
  delete(id: string): Promise<void>;
}

