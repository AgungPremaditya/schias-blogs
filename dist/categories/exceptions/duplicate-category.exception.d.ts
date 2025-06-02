import { ConflictException } from '@nestjs/common';
export declare class DuplicateCategoryException extends ConflictException {
    constructor(name: string);
}
