import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { SupabaseService } from '../config/supabase.config';
import * as bcrypt from 'bcrypt';
import { Express } from 'express';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async create(createUserDto: {
    email: string;
    password: string;
    username: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatar?: string;
  }) {
    const hashedPassword = await this.hashPassword(createUserDto.password);

    const { data: existingUser, error: searchError } = await this.supabaseService
      .getClient()
      .from('users')
      .select('id')
      .eq('email', createUserDto.email)
      .single();

    if (searchError && searchError.code !== 'PGRST116') {
      throw searchError;
    }

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('users')
      .insert([
        {
          ...createUserDto,
          password: hashedPassword,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findByEmail(email: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException(`User with email "${email}" not found`);
      }
      throw error;
    }

    return data;
  }

  async validatePassword(email: string, password: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return bcrypt.compare(password, user.password);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const { data, error } = await this.supabaseService
      .getClient()
      .storage
      .from('avatars')
      .upload(`${userId}/avatar.${file.originalname.split('.').pop()}`, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) throw error;

    const { data: publicUrl } = this.supabaseService
      .getClient()
      .storage
      .from('avatars')
      .getPublicUrl(data.path);

    // Update user with new avatar URL
    const { error: updateError } = await this.supabaseService
      .getClient()
      .from('users')
      .update({ avatar: publicUrl.publicUrl })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { avatarUrl: publicUrl.publicUrl };
  }

  async update(userId: string, updateUserDto: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    password?: string;
  }) {
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('users')
      .update(updateUserDto)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findById(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException(`User with ID "${id}" not found`);
      }
      throw error;
    }

    return data;
  }
} 