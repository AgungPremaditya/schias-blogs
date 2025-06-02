import { SupabaseService } from '../config/supabase.config';
interface Image {
    id: string;
    url: string;
    public_id: string;
    created_at: Date;
    updated_at: Date;
}
export declare class ImagesService {
    private supabase;
    constructor(supabase: SupabaseService);
    create(url: string, publicId: string): Promise<Image>;
    findAll(): Promise<Image[]>;
    findOne(id: string): Promise<Image | null>;
}
export {};
