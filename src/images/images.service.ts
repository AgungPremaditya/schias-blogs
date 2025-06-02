import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../config/supabase.config';

interface Image {
  id: string;
  url: string;
  public_id: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class ImagesService {
  constructor(private supabase: SupabaseService) {}

  async create(url: string, publicId: string): Promise<Image> {
    try {
      const { data, error } = await this.supabase.getClient()
        .from('images')
        .insert([
          {
            url,
            public_id: publicId,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new InternalServerErrorException('Failed to create image record');
      }

      return data;
    } catch (error) {
      console.error('Error creating image:', error);
      throw new InternalServerErrorException('Failed to create image record');
    }
  }

  async findAll(): Promise<Image[]> {
    try {
      const { data, error } = await this.supabase.getClient()
        .from('images')
        .select('*');

      if (error) {
        console.error('Supabase error:', error);
        throw new InternalServerErrorException('Failed to fetch images');
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching images:', error);
      throw new InternalServerErrorException('Failed to fetch images');
    }
  }

  async findOne(id: string): Promise<Image | null> {
    try {
      const { data, error } = await this.supabase.getClient()
        .from('images')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new InternalServerErrorException('Failed to fetch image');
      }

      return data;
    } catch (error) {
      console.error('Error fetching image:', error);
      throw new InternalServerErrorException('Failed to fetch image');
    }
  }
} 