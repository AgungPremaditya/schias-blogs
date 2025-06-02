import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createCategoryDto: CreateCategoryDto): Promise<import("./interfaces/category.interface").Category>;
    findAll(): Promise<import("./interfaces/category.interface").Category[]>;
    findOne(id: string): Promise<import("./interfaces/category.interface").Category>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<import("./interfaces/category.interface").Category>;
    remove(id: string): Promise<void>;
}
