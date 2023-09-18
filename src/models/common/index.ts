export type Paginated<T, K extends string> = {
  [key in K | "totalRecords" | "nextCursor"]: key extends "totalRecords"
    ? number
    : key extends "nextCursor"
    ? string | undefined
    : T[];
};
