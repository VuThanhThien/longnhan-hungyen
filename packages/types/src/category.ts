/** Public category row (`GET /v1/categories`). ISO date strings from JSON. */
export interface Category {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
