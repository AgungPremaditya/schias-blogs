"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_config_1 = require("../config/supabase.config");
const slug_utils_1 = require("../utils/slug.utils");
let PostsService = class PostsService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async create(authorId, createPostDto) {
        const baseSlug = (0, slug_utils_1.generateSlug)(createPostDto.title);
        const uniqueSlug = await (0, slug_utils_1.findUniqueSlug)(this.supabaseService, 'posts', baseSlug);
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
        if (error)
            throw error;
        return data;
    }
    async findAll() {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('posts')
            .select('*, category:categories(*), author:users!author_id(*)')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data;
    }
    async findOne(id) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('posts')
            .select('*, category:categories(*), author:users!author_id(*)')
            .eq('id', id)
            .single();
        if (error)
            throw error;
        if (!data) {
            throw new common_1.NotFoundException(`Post with ID "${id}" not found`);
        }
        return data;
    }
    async update(id, authorId, updatePostDto) {
        const { data: existingPost, error: findError } = await this.supabaseService
            .getClient()
            .from('posts')
            .select('author_id, published_at, title, slug')
            .eq('id', id)
            .single();
        if (findError)
            throw findError;
        if (!existingPost) {
            throw new common_1.NotFoundException(`Post with ID "${id}" not found`);
        }
        if (existingPost.author_id !== authorId) {
            throw new common_1.ForbiddenException('You can only update your own posts');
        }
        const updates = {
            ...updatePostDto,
            updated_at: new Date().toISOString(),
        };
        if (updatePostDto.title) {
            const baseSlug = (0, slug_utils_1.generateSlug)(updatePostDto.title);
            if (baseSlug !== existingPost.slug) {
                updates.slug = await (0, slug_utils_1.findUniqueSlug)(this.supabaseService, 'posts', baseSlug);
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
        if (error)
            throw error;
        return data;
    }
    async delete(id, authorId) {
        const { data: existingPost, error: findError } = await this.supabaseService
            .getClient()
            .from('posts')
            .select('author_id')
            .eq('id', id)
            .single();
        if (findError)
            throw findError;
        if (!existingPost) {
            throw new common_1.NotFoundException(`Post with ID "${id}" not found`);
        }
        if (existingPost.author_id !== authorId) {
            throw new common_1.ForbiddenException('You can only delete your own posts');
        }
        const { error } = await this.supabaseService
            .getClient()
            .from('posts')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
    }
    async findByCategory(categoryId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('posts')
            .select('*, category:categories(*), author:users!author_id(*)')
            .eq('category_id', categoryId)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data;
    }
    async findByAuthor(authorId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('posts')
            .select('*, category:categories(*), author:users!author_id(*)')
            .eq('author_id', authorId)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data;
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_config_1.SupabaseService])
], PostsService);
//# sourceMappingURL=posts.service.js.map