import { Category } from '../../categories/entities/category.entity';
import { User } from '../../users/entities/user.entity';
export declare class Post {
    id: string;
    title: string;
    content: string;
    imageUrl: string;
    published: boolean;
    category: Category;
    author: User;
    createdAt: Date;
    updatedAt: Date;
}
