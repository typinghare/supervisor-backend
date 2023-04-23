import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import CategoryService from '../service/category.service';
import CategoryVo from '../vo/category.vo';
import CategoryDto from '../dto/category.dto';
import ResponsePacket from '../common/response-packet';

@ApiTags('supervisor')
@Controller('/supervisor/categories')
export default class CategoryController {
    public constructor(private categoryService: CategoryService) {
    }

    @Get('/')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'All categories are fetched.',
        type: [CategoryVo],
    })
    @ApiInternalServerErrorResponse({ description: 'Fail to fetch categories.' })
    async fetchCategories(@Query('subjectId') subjectId: number): Promise<ResponsePacket<CategoryVo[]>> {
        try {
            const categories = await this.categoryService.fetchCategories(subjectId);
            return new ResponsePacket('All categories are fetched.').data(categories);
        } catch (error) {
            return new ResponsePacket('Fail to fetch categories.').handle(error);
        }
    }

    @Post('/')
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({
        description: 'The category has been created.',
    })
    @ApiInternalServerErrorResponse({ description: 'Fail to create the category.' })
    async createCategory(@Body() categoryDto: CategoryDto): Promise<ResponsePacket> {
        try {
            await this.categoryService.createCategory(categoryDto);
            return new ResponsePacket('The category has been created.');
        } catch (error) {
            return new ResponsePacket('Fail to create category.').handle(error);
        }
    }

    @Delete('/')
    @HttpCode(HttpStatus.OK)
    @ApiCreatedResponse({
        description: 'The category has been deleted.',
        type: null,
    })
    @ApiBadRequestResponse({ description: 'Fail to delete the category.' })
    async deleteCategory(@Body() categoryDto: CategoryDto): Promise<ResponsePacket<void>> {
        try {
            await this.categoryService.deleteCategory(categoryDto);
            return new ResponsePacket('The category has been deleted.');
        } catch (error) {
            return new ResponsePacket('Fail to delete the category.').handle(error);
        }
    }
}