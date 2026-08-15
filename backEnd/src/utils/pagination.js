/**
 * Parse optional ?page= & ?limit= query params into a safe pagination config.
 *
 * Returns { isPaginated, page, limit, offset }:
 *  - isPaginated is false when neither page nor limit was supplied, so callers
 *    keep their existing "return everything" behaviour (backward compatible).
 *  - limit is clamped to MAX_LIMIT so a single client can't request the entire
 *    table in one go and stall the connection pool.
 */

export const MAX_LIMIT = 500;
export const DEFAULT_LIMIT = 100;

export const parsePagination = (query = {}) => {
  const hasPage = query.page !== undefined && query.page !== "";
  const hasLimit = query.limit !== undefined && query.limit !== "";
  if (!hasPage && !hasLimit) {
    return { isPaginated: false, page: 1, limit: null, offset: null };
  }
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT)
  );
  const offset = (page - 1) * limit;
  return { isPaginated: true, page, limit, offset };
};
