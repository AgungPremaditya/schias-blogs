"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const supabase_config_1 = require("../config/supabase.config");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async hashPassword(password) {
        const salt = await bcrypt.genSalt();
        return bcrypt.hash(password, salt);
    }
    async create(createUserDto) {
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
            throw new common_1.ConflictException('User with this email already exists');
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
        if (error)
            throw error;
        return data;
    }
    async findByEmail(email) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                throw new common_1.NotFoundException(`User with email "${email}" not found`);
            }
            throw error;
        }
        return data;
    }
    async validatePassword(email, password) {
        const user = await this.findByEmail(email);
        return bcrypt.compare(password, user.password);
    }
    async uploadAvatar(userId, file) {
        const { data, error } = await this.supabaseService
            .getClient()
            .storage
            .from('avatars')
            .upload(`${userId}/avatar.${file.originalname.split('.').pop()}`, file.buffer, {
            contentType: file.mimetype,
            upsert: true
        });
        if (error)
            throw error;
        const { data: publicUrl } = this.supabaseService
            .getClient()
            .storage
            .from('avatars')
            .getPublicUrl(data.path);
        const { error: updateError } = await this.supabaseService
            .getClient()
            .from('users')
            .update({ avatar: publicUrl.publicUrl })
            .eq('id', userId);
        if (updateError)
            throw updateError;
        return { avatarUrl: publicUrl.publicUrl };
    }
    async update(userId, updateUserDto) {
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
        if (error)
            throw error;
        return data;
    }
    async findById(id) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                throw new common_1.NotFoundException(`User with ID "${id}" not found`);
            }
            throw error;
        }
        return data;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_config_1.SupabaseService])
], UsersService);
//# sourceMappingURL=users.service.js.map