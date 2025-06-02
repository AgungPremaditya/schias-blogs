import { Category } from './category.interface';

export interface PaginatedCategories {
  data: Category[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
} 