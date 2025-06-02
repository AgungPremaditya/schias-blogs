import { SupabaseService } from '../config/supabase.config';
export declare class UsersService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    private hashPassword;
    create(createUserDto: {
        email: string;
        password: string;
        username: string;
        firstName?: string;
        lastName?: string;
        bio?: string;
        avatar?: string;
    }): Promise<any>;
    findByEmail(email: string): Promise<any>;
    validatePassword(email: string, password: string): Promise<boolean>;
    uploadAvatar(userId: string, file: Express.Multer.File): Promise<{
        avatarUrl: string;
    }>;
    update(userId: string, updateUserDto: {
        firstName?: string;
        lastName?: string;
        bio?: string;
        password?: string;
    }): Promise<any>;
    findById(id: string): Promise<any>;
}
