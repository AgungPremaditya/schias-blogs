import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { ImagesService } from '../images/images.service';
export declare class UploadService {
    private cloudinary;
    private imagesService;
    constructor(cloudinary: any, imagesService: ImagesService);
    uploadImage(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse>;
}
