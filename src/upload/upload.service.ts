import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';
import { ImagesService } from '../images/images.service';

@Injectable()
export class UploadService {
  constructor(
    @Inject('CLOUDINARY') private cloudinary: any,
    private imagesService: ImagesService,
  ) {}

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    try {
      return await new Promise((resolve, reject) => {
        const uploadStream = this.cloudinary.uploader.upload_stream(
          {
            folder: 'blog-images',
          },
          async (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              return reject(new InternalServerErrorException('Failed to upload image to Cloudinary'));
            }
            
            try {
              // Save the image URL to database
              if (result) {
                await this.imagesService.create(result.secure_url, result.public_id);
              }
              resolve(result);
            } catch (dbError) {
              console.error('Database save error:', dbError);
              reject(new InternalServerErrorException('Failed to save image information'));
            }
          },
        );

        const readableStream = new Readable({
          read() {
            this.push(file.buffer);
            this.push(null);
          },
        });

        readableStream.pipe(uploadStream);
      });
    } catch (error) {
      console.error('Upload process error:', error);
      throw new InternalServerErrorException('Failed to process image upload');
    }
  }
} 