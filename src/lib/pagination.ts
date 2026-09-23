export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;

export type PaginationInput = {
  page?: number;
  pageSize?: number;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  from: number;
  to: number;
};

export function parsePage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function parsePageSize(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return PAGE_SIZE_OPTIONS.includes(parsed as (typeof PAGE_SIZE_OPTIONS)[number])
    ? parsed
    : DEFAULT_PAGE_SIZE;
}

export function resolvePagination(
  total: number,
  input: PaginationInput = {},
): PaginationMeta {
  const pageSize =
    input.pageSize && PAGE_SIZE_OPTIONS.includes(input.pageSize as (typeof PAGE_SIZE_OPTIONS)[number])
      ? input.pageSize
      : DEFAULT_PAGE_SIZE;
  const requestedPage = input.page && input.page > 0 ? input.page : 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = total === 0 ? 0 : Math.min(page * pageSize, total);

  return { page, pageSize, total, totalPages, from, to };
}
