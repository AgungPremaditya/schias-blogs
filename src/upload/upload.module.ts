import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { CloudinaryModule } from '../config/cloudinary.module';
import { ImagesModule } from '../images/images.module';

@Module({
  imports: [CloudinaryModule, ImagesModule],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {} 