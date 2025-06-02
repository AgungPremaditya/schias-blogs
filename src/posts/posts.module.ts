import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { SupabaseService } from '../config/supabase.config';

@Module({
  controllers: [PostsController],
  providers: [PostsService, SupabaseService],
  exports: [PostsService],
})
export class PostsModule {} 