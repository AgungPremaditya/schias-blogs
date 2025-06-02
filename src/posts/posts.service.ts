import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { SupabaseService } from '../config/supabase.config';
import { generateSlug, findUniqueSlug } from '../utils/slug.utils';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_id: string;
  category_id?: string;
}

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

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('posts')
      .select('*, category:categories(*), author:users!author_id(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
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
      updated_at: new Date().toISOString(),
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