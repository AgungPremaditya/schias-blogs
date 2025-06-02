import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseService } from '../config/supabase.config';

@Module({
  providers: [UsersService, SupabaseService],
  exports: [UsersService],
})
export class UsersModule {} 