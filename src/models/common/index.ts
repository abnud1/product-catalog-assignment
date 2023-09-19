export type Paginated<T, K extends string> = {
  [key in K | "totalRecords" | "nextCursor"]: key extends "totalRecords"
    ? number
    : key extends "nextCursor"
    ? string | [string, string | number] | undefined
    : T[];
};
export function sortToNumber(orderSort?: "asc" | "desc"): 1 | -1 {
  return orderSort === "desc" ? -1 : 1;
}
