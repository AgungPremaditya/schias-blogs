import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SupabaseService } from '../config/supabase.config';
import { Category } from './interfaces/category.interface';
import { generateSlug, findUniqueSlug } from '../utils/slug.utils';
import { DuplicateCategoryException } from './exceptions/duplicate-category.exception';
import { PaginatedCategories } from './interfaces/paginated-categories.interface';

@Injectable()
export class CategoriesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private async checkNameExists(name: string, excludeId?: string): Promise<boolean> {
    const query = this.supabaseService
      .getClient()
      .from('categories')
      .select('id')
      .ilike('name', name);
    
    if (excludeId) {
      query.neq('id', excludeId);
    }

    const { data, error } = await query.single();

    if (error && error.code === 'PGRST116') {
      return false; // No category found with this name
    }

    if (error) throw error;
    return true; // Category with this name exists
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Check if category with same name exists
    const exists = await this.checkNameExists(createCategoryDto.name);
    if (exists) {
      throw new DuplicateCategoryException(createCategoryDto.name);
    }

    // Generate base slug from name
    const baseSlug = generateSlug(createCategoryDto.name);
    
    // Find a unique slug
    const uniqueSlug = await findUniqueSlug(this.supabaseService, 'categories', baseSlug);

    const { data, error } = await this.supabaseService
      .getClient()
      .from('categories')
      .insert([{
        ...createCategoryDto,
        slug: uniqueSlug
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(
    page: number = 1, 
    pageSize: number = 10,
    search?: string
  ): Promise<PaginatedCategories> {
    // Build the base query
    const baseQuery = this.supabaseService
      .getClient()
      .from('categories');

    // Add search condition if search term is provided
    const countQuery = search 
      ? baseQuery.select('*', { count: 'exact', head: true }).ilike('name', `%${search}%`)
      : baseQuery.select('*', { count: 'exact', head: true });

    // First, get the total count of categories with search applied
    const { count, error: countError } = await countQuery;

    if (countError) throw countError;

    // Calculate pagination values
    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Get paginated categories with post count and search applied
    const selectQuery = this.supabaseService
      .getClient()
      .from('categories')
      .select(`
        id,
        name,
        slug,
        description,
        postCount:posts(count)
      `);

    // Apply search if provided
    if (search) {
      selectQuery.ilike('name', `%${search}%`);
    }

    const { data, error } = await selectQuery
      .order('name', { ascending: true })
      .range(from, to);

    if (error) throw error;

    // Transform the data to ensure postCount is a number
    const transformedData = data?.map(category => ({
      ...category,
      postCount: category.postCount?.[0]?.count || 0
    })) || [];

    return {
      data: transformedData,
      meta: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }

  async findOne(id: string): Promise<Category> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('categories')
      .select(`
        id,
        name,
        slug,
        description,
        postCount:posts(count)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    // Transform the data to ensure postCount is a number
    return {
      ...data,
      postCount: data.postCount?.[0]?.count || 0
    };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    // If name is being updated, check for duplicates
    if (updateCategoryDto.name) {
      const exists = await this.checkNameExists(updateCategoryDto.name, id);
      if (exists) {
        throw new DuplicateCategoryException(updateCategoryDto.name);
      }
    }

    // If name is being updated, generate new slug
    const updates: Partial<Category> = { ...updateCategoryDto };
    
    if (updateCategoryDto.name) {
      const baseSlug = generateSlug(updateCategoryDto.name);
      const currentCategory = await this.findOne(id);
      
      // Only update slug if name has actually changed
      if (baseSlug !== currentCategory.slug) {
        updates.slug = await findUniqueSlug(this.supabaseService, 'categories', baseSlug);
      }
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return data;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
} 