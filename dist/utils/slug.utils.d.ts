import { SupabaseService } from '../config/supabase.config';
export declare function generateSlug(name: string): string;
export declare function findUniqueSlug(supabaseService: SupabaseService, tableName: string, baseSlug: string): Promise<string>;
