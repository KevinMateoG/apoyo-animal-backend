import type { AnimalStatus } from "../domain/models/animal.ts";
import type { AnimalQueryFilters } from "../domain/repository/animal.repository.ts";
import { BadRequestError } from "./errors/app.error.ts";

export function parseAnimalFilters(query: {
  speciesId?: unknown;
  search?: unknown;
  status?: unknown;
  availableForSponsorship?: unknown;
}): AnimalQueryFilters {
  const filters: AnimalQueryFilters = {};

  if (typeof query.speciesId === "string" && query.speciesId.trim().length > 0) {
    filters.speciesId = query.speciesId.trim();
  }

  if (typeof query.search === "string" && query.search.trim().length > 0) {
    filters.search = query.search.trim();
  }

  if (query.status !== undefined) {
    if (query.status !== "ACTIVE" && query.status !== "INACTIVE") {
      throw new BadRequestError("El estado debe ser ACTIVE o INACTIVE");
    }
    filters.status = query.status as AnimalStatus;
  }

  if (query.availableForSponsorship !== undefined) {
    if (
      query.availableForSponsorship === "true" ||
      query.availableForSponsorship === true
    ) {
      filters.availableForSponsorship = true;
    } else if (
      query.availableForSponsorship === "false" ||
      query.availableForSponsorship === false
    ) {
      filters.availableForSponsorship = false;
    } else {
      throw new BadRequestError(
        "El filtro availableForSponsorship debe ser booleano",
      );
    }
  }

  return filters;
}

