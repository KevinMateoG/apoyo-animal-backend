export interface Species {
  id: string;
  scientificName: string;
  commonName: string;
  description: string;
  morphology: string;
  habitat: string;
  diet: string;
  imageUrl: string;
  catalogLinkLabel: string | null;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSpeciesInput {
  scientificName: string;
  commonName: string;
  description: string;
  morphology: string;
  habitat: string;
  diet: string;
  imageUrl: string;
  catalogLinkLabel?: string | null;
  isVisible?: boolean;
}

export interface UpdateSpeciesInput {
  scientificName?: string;
  commonName?: string;
  description?: string;
  morphology?: string;
  habitat?: string;
  diet?: string;
  imageUrl?: string;
  catalogLinkLabel?: string | null;
  isVisible?: boolean;
}

