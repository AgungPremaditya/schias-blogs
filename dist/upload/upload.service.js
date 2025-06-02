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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const stream_1 = require("stream");
const images_service_1 = require("../images/images.service");
let UploadService = class UploadService {
    constructor(cloudinary, imagesService) {
        this.cloudinary = cloudinary;
        this.imagesService = imagesService;
    }
    async uploadImage(file) {
        try {
            return await new Promise((resolve, reject) => {
                const uploadStream = this.cloudinary.uploader.upload_stream({
                    folder: 'blog-images',
                }, async (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        return reject(new common_1.InternalServerErrorException('Failed to upload image to Cloudinary'));
                    }
                    try {
                        if (result) {
                            await this.imagesService.create(result.secure_url, result.public_id);
                        }
                        resolve(result);
                    }
                    catch (dbError) {
                        console.error('Database save error:', dbError);
                        reject(new common_1.InternalServerErrorException('Failed to save image information'));
                    }
                });
                const readableStream = new stream_1.Readable({
                    read() {
                        this.push(file.buffer);
                        this.push(null);
                    },
                });
                readableStream.pipe(uploadStream);
            });
        }
        catch (error) {
            console.error('Upload process error:', error);
            throw new common_1.InternalServerErrorException('Failed to process image upload');
        }
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('CLOUDINARY')),
    __metadata("design:paramtypes", [Object, images_service_1.ImagesService])
], UploadService);
//# sourceMappingURL=upload.service.js.map