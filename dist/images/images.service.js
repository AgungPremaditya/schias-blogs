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
exports.ImagesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_config_1 = require("../config/supabase.config");
let ImagesService = class ImagesService {
    constructor(supabase) {
        this.supabase = supabase;
    }
    async create(url, publicId) {
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
                throw new common_1.InternalServerErrorException('Failed to create image record');
            }
            return data;
        }
        catch (error) {
            console.error('Error creating image:', error);
            throw new common_1.InternalServerErrorException('Failed to create image record');
        }
    }
    async findAll() {
        try {
            const { data, error } = await this.supabase.getClient()
                .from('images')
                .select('*');
            if (error) {
                console.error('Supabase error:', error);
                throw new common_1.InternalServerErrorException('Failed to fetch images');
            }
            return data || [];
        }
        catch (error) {
            console.error('Error fetching images:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch images');
        }
    }
    async findOne(id) {
        try {
            const { data, error } = await this.supabase.getClient()
                .from('images')
                .select('*')
                .eq('id', id)
                .single();
            if (error) {
                console.error('Supabase error:', error);
                throw new common_1.InternalServerErrorException('Failed to fetch image');
            }
            return data;
        }
        catch (error) {
            console.error('Error fetching image:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch image');
        }
    }
};
exports.ImagesService = ImagesService;
exports.ImagesService = ImagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_config_1.SupabaseService])
], ImagesService);
//# sourceMappingURL=images.service.js.map