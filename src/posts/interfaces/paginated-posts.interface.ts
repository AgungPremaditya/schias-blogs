interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Author {
  id: string;
  email: string;
  avatar: string | null;
  username: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  published_at: string | null;
  author_id: string;
  category_id?: string;
  category?: Category | null;
  author?: Author | null;
}

export interface PaginatedPosts {
  data: Post[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
} 