import { BadRequestError } from "./errors/app.error.ts";

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 12;

export interface PaginationParams {
  page: number;
  pageSize: number;
  offset: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  pagination: PaginationMeta;
  data: T[];
}

export function parsePagination(query: {
  page?: unknown;
  pageSize?: unknown;
  limit?: unknown;
}): PaginationParams {
  const rawPage = query.page !== undefined ? Number(query.page) : DEFAULT_PAGE;
  const rawSize =
    query.pageSize !== undefined
      ? Number(query.pageSize)
      : query.limit !== undefined
        ? Number(query.limit)
        : DEFAULT_PAGE_SIZE;

  if (!Number.isInteger(rawPage) || rawPage < 1) {
    throw new BadRequestError("El parámetro page debe ser un entero mayor o igual a 1");
  }

  if (!Number.isInteger(rawSize) || rawSize < 1 || rawSize > MAX_PAGE_SIZE) {
    throw new BadRequestError(
      `El tamaño de página debe estar entre 1 y ${MAX_PAGE_SIZE}`,
    );
  }

  return {
    page: rawPage,
    pageSize: rawSize,
    offset: (rawPage - 1) * rawSize,
  };
}

export function buildPaginatedResponse<T>(
  data: T[],
  totalItems: number,
  params: PaginationParams,
): PaginatedResponse<T> {
  const totalPages = Math.max(1, Math.ceil(totalItems / params.pageSize));
  return {
    pagination: {
      page: params.page,
      pageSize: params.pageSize,
      totalItems,
      totalPages,
    },
    data,
  };
}

