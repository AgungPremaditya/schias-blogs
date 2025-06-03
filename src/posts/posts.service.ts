import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { SupabaseService } from '../config/supabase.config';
import { generateSlug, findUniqueSlug } from '../utils/slug.utils';
import { Post, PaginatedPosts } from './interfaces/paginated-posts.interface';

@Injectable()
export class PostsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(authorId: string, createPostDto: CreatePostDto) {
    // Generate unique slug from title
    const baseSlug = generateSlug(createPostDto.title);
    const uniqueSlug = await findUniqueSlug(this.supabaseService, 'posts', baseSlug);

    const { data, error } = await this.supabaseService
      .getClient()
      .from('posts')
      .insert([
        {
          ...createPostDto,
          slug: uniqueSlug,
          author_id: authorId,
          published: createPostDto.published ?? false,
          published_at: createPostDto.published ? new Date().toISOString() : null,
        },
      ])
      .select('*, category:categories(*), author:users!author_id(*)')
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(
    page: number = 1, 
    pageSize: number = 10,
    search?: string
  ): Promise<PaginatedPosts> {
    try {
      // Build the base query for counting
      let baseQuery = this.supabaseService
        .getClient()
        .from('posts')
        .select('*', { count: 'exact', head: true });

      // Add search condition if search term is provided
      if (search) {
        baseQuery = baseQuery.ilike('title', `%${search}%`);
      }

      // Get total count with search applied
      const { count, error: countError } = await baseQuery;

      // If there's an error or no results, return empty array with meta
      if (countError || !count) {
        return {
          data: [],
          meta: {
            total: 0,
            page,
            pageSize,
            totalPages: 0,
          },
        };
      }

      // Calculate pagination values
      const total = count;
      const totalPages = Math.ceil(total / pageSize);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Build the main query for fetching posts
      let selectQuery = this.supabaseService
        .getClient()
        .from('posts')
        .select(`
          id,
          title,
          slug,
          content,
          published,
          published_at,
          author_id,
          category_id,
          category:categories!category_id (
            id,
            name,
            slug
          ),
          author:users!author_id (
            id,
            email,
            avatar,
            username
          )
        `);

      // Apply search if provided
      if (search) {
        selectQuery = selectQuery.ilike('title', `%${search}%`);
      }

      // Get paginated posts with search applied
      const { data: rawData, error } = await selectQuery
        .order('published_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching posts:', error);
        return {
          data: [],
          meta: {
            total: 0,
            page,
            pageSize,
            totalPages: 0,
          },
        };
      }

      if (!rawData) {
        console.log('No posts found');
        return {
          data: [],
          meta: {
            total: 0,
            page,
            pageSize,
            totalPages: 0,
          },
        };
      }

      // Get all post IDs
      const postIds = rawData.map(post => post.id);

      // Fetch cover images separately if there are posts
      let coverImages = {};
      if (postIds.length > 0) {
        const { data: imagesData } = await this.supabaseService
          .getClient()
          .from('posts_images')
          .select(`
            post_id,
            display_order,
            image:images!image_id (
              id,
              url,
              public_id
            )
          `)
          .in('post_id', postIds)
          .is('display_order', null)
          .order('created_at', { ascending: true }); // Get the first uploaded image if multiple nulls

        // Create a map of post_id to cover image
        if (imagesData) {
          coverImages = imagesData.reduce((acc, img) => {
            // Only set the image if we haven't seen this post_id yet
            if (img.image && !acc[img.post_id]) {
              acc[img.post_id] = img.image;
            }
            return acc;
          }, {});
        }
      }

      // Transform the data to ensure category and author are single objects
      const data = rawData.map(post => {
        const transformedPost = {
          ...post,
          category: Array.isArray(post.category) ? post.category[0] || null : post.category,
          author: Array.isArray(post.author) ? post.author[0] || null : post.author,
          cover_image: coverImages[post.id] || null
        };
        return transformedPost;
      });

      return {
        data,
        meta: {
          total,
          page,
          pageSize,
          totalPages,
        },
      };
    } catch (error) {
      // If any error occurs, return empty array with meta
      return {
        data: [],
        meta: {
          total: 0,
          page,
          pageSize,
          totalPages: 0,
        },
      };
    }
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('posts')
      .select('*, category:categories(*), author:users!author_id(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }

    return data;
  }

  async update(
    id: string,
    authorId: string,
    updatePostDto: Partial<CreatePostDto> & { published?: boolean },
  ) {
    // Check if post exists and belongs to the user
    const { data: existingPost, error: findError } = await this.supabaseService
      .getClient()
      .from('posts')
      .select('author_id, published_at, title, slug')
      .eq('id', id)
      .single();

    if (findError) throw findError;
    if (!existingPost) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }
    if (existingPost.author_id !== authorId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    // If post is being published, set published_at
    const updates: Partial<Post> = {
      ...updatePostDto,
    };

    // If title is being updated, generate new slug
    if (updatePostDto.title) {
      const baseSlug = generateSlug(updatePostDto.title);
      // Only update slug if title has actually changed
      if (baseSlug !== existingPost.slug) {
        updates.slug = await findUniqueSlug(this.supabaseService, 'posts', baseSlug);
      }
    }

    if (updatePostDto.published && !existingPost.published_at) {
      updates.published_at = new Date().toISOString();
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select('*, category:categories(*), author:users!author_id(*)')
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string, authorId: string) {
    // Check if post exists and belongs to the user
    const { data: existingPost, error: findError } = await this.supabaseService
      .getClient()
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (findError) throw findError;
    if (!existingPost) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }
    if (existingPost.author_id !== authorId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    const { error } = await this.supabaseService
      .getClient()
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async findByCategory(categoryId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('posts')
      .select('*, category:categories(*), author:users!author_id(*)')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findByAuthor(authorId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('posts')
      .select('*, category:categories(*), author:users!author_id(*)')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
} 