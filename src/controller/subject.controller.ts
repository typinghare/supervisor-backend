import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import SubjectVo from '../vo/subject.vo';
import SubjectService from '../service/subject.service';
import SubjectDto from '../dto/subject.dto';
import ResponsePacket from '../common/response-packet';

@ApiTags('supervisor')
@Controller('/supervisor/subjects')
export default class SubjectController {
    constructor(private subjectService: SubjectService) {
    }

    @Get('/')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'All subjects are fetched.',
        type: [SubjectVo],
    })
    @ApiInternalServerErrorResponse({ description: 'Fail to fetch subjects.' })
    async fetchSubjects(@Query('userId') userId): Promise<ResponsePacket<SubjectVo[]>> {
        try {
            const subjects = await this.subjectService.fetchSubjects(userId);
            return new ResponsePacket('All subjects are fetched.').data(subjects);
        } catch (error) {
            console.log(error.message);
            return new ResponsePacket('Fail to fetch subjects').handle(error);
        }
    }

    @Post('/')
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({
        description: 'Subject has been created.',
        type: null,
    })
    @ApiForbiddenResponse({ description: 'A subject with the same name already exists.' })
    @ApiBadRequestResponse({ description: 'Fail to create the subject.' })
    async createSubject(@Body() subjectDto: SubjectDto): Promise<ResponsePacket> {
        try {
            await this.subjectService.createSubject(subjectDto);
            return new ResponsePacket('Subject has been created.');
        } catch (error) {
            return new ResponsePacket('Fail to create subject.').handle(error);
        }
    }

    @Delete('/:subjectId')
    @HttpCode(HttpStatus.OK)
    @ApiCreatedResponse({
        description: 'The subject has been created.',
    })
    @ApiBadRequestResponse({ description: 'Fail to delete the subject.' })
    async deleteSubject(@Param('subjectId') subjectId): Promise<ResponsePacket> {
        try {
            await this.subjectService.deleteSubject(subjectId);
            return new ResponsePacket('The subject has been deleted.');
        } catch (error) {
            return new ResponsePacket('Fail to delete subject.').handle(error);
        }
    }
}