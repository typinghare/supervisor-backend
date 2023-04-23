import { Injectable } from '@nestjs/common';
import CategoryVo from '../vo/category.vo';
import UserService from './user.service';
import { DB } from '../common/database';
import CategoryEntity from '../entity/category.entity';
import { DeleteResult, InsertResult } from 'typeorm';
import CategoryDto from '../dto/category.dto';

@Injectable()
export default class CategoryService {
    constructor(private userService: UserService) {
    }

    /**
     * Find all categories for the given user.
     */
    public async fetchCategories(subjectId: number): Promise<CategoryVo[]> {
        return await DB.getRepository(CategoryEntity)
            .createQueryBuilder('category')
            .select(['category.id', 'category.name', 'category.expectedDuration'])
            .where('subject_id = :subjectId', { subjectId: subjectId })
            .getMany();
    }

    /**
     * Create a category.
     * @param categoryDto
     */
    public async createCategory(categoryDto: CategoryDto): Promise<InsertResult> {
        const userId = this.userService.getUserId();

        return await DB.createQueryBuilder()
            .insert()
            .into(CategoryEntity)
            .values({ userId, ...categoryDto })
            .execute();
    }

    public async deleteCategory(categoryDto: CategoryDto): Promise<DeleteResult> {
        const userId = this.userService.getUserId();

        return await DB.createQueryBuilder()
            .delete()
            .from(CategoryEntity)
            .where('id = :id', { id: categoryDto.id })
            .andWhere('user_id = :userId', { userId })
            .execute();
    }
}