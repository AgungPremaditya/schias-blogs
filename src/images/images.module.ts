import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { SupabaseService } from '../config/supabase.config';

@Module({
  providers: [ImagesService, SupabaseService],
  exports: [ImagesService],
})
export class ImagesModule {} 