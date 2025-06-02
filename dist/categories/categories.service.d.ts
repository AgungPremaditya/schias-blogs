import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SupabaseService } from '../config/supabase.config';
import { Category } from './interfaces/category.interface';
export declare class CategoriesService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    private checkNameExists;
    create(createCategoryDto: CreateCategoryDto): Promise<Category>;
    findAll(): Promise<Category[]>;
    findOne(id: string): Promise<Category>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category>;
    remove(id: string): Promise<void>;
}
