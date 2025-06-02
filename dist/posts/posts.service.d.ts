import { CreatePostDto } from './dto/create-post.dto';
import { SupabaseService } from '../config/supabase.config';
export declare class PostsService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    create(authorId: string, createPostDto: CreatePostDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, authorId: string, updatePostDto: Partial<CreatePostDto> & {
        published?: boolean;
    }): Promise<any>;
    delete(id: string, authorId: string): Promise<void>;
    findByCategory(categoryId: string): Promise<any[]>;
    findByAuthor(authorId: string): Promise<any[]>;
}
