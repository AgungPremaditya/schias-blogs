import { SupabaseService } from '../config/supabase.config';

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function findUniqueSlug(
  supabaseService: SupabaseService,
  tableName: string,
  baseSlug: string,
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const { data, error } = await supabaseService
      .getClient()
      .from(tableName)
      .select('id')
      .eq('slug', slug)
      .single();

    if (error && error.code === 'PGRST116') {
      // No record found with this slug, it's unique
      return slug;
    }

    if (error) throw error;

    // If we found a record with this slug, try the next number
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
} 