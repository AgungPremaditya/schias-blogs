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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_config_1 = require("../config/supabase.config");
const slug_utils_1 = require("../utils/slug.utils");
const duplicate_category_exception_1 = require("./exceptions/duplicate-category.exception");
let CategoriesService = class CategoriesService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async checkNameExists(name, excludeId) {
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
            return false;
        }
        if (error)
            throw error;
        return true;
    }
    async create(createCategoryDto) {
        const exists = await this.checkNameExists(createCategoryDto.name);
        if (exists) {
            throw new duplicate_category_exception_1.DuplicateCategoryException(createCategoryDto.name);
        }
        const baseSlug = (0, slug_utils_1.generateSlug)(createCategoryDto.name);
        const uniqueSlug = await (0, slug_utils_1.findUniqueSlug)(this.supabaseService, 'categories', baseSlug);
        const { data, error } = await this.supabaseService
            .getClient()
            .from('categories')
            .insert([{
                ...createCategoryDto,
                slug: uniqueSlug
            }])
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async findAll() {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('categories')
            .select('*, posts(*)');
        if (error)
            throw error;
        return data;
    }
    async findOne(id) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('categories')
            .select('*, posts(*)')
            .eq('id', id)
            .single();
        if (error)
            throw error;
        if (!data) {
            throw new common_1.NotFoundException(`Category with ID "${id}" not found`);
        }
        return data;
    }
    async update(id, updateCategoryDto) {
        if (updateCategoryDto.name) {
            const exists = await this.checkNameExists(updateCategoryDto.name, id);
            if (exists) {
                throw new duplicate_category_exception_1.DuplicateCategoryException(updateCategoryDto.name);
            }
        }
        const updates = { ...updateCategoryDto };
        if (updateCategoryDto.name) {
            const baseSlug = (0, slug_utils_1.generateSlug)(updateCategoryDto.name);
            const currentCategory = await this.findOne(id);
            if (baseSlug !== currentCategory.slug) {
                updates.slug = await (0, slug_utils_1.findUniqueSlug)(this.supabaseService, 'categories', baseSlug);
            }
        }
        const { data, error } = await this.supabaseService
            .getClient()
            .from('categories')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        if (!data) {
            throw new common_1.NotFoundException(`Category with ID "${id}" not found`);
        }
        return data;
    }
    async remove(id) {
        const { error } = await this.supabaseService
            .getClient()
            .from('categories')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_config_1.SupabaseService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map