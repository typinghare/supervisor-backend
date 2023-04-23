import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import SubjectVo from '../vo/subject.vo';
import SubjectDto from '../dto/subject.dto';
import { DeleteResult, InsertResult } from 'typeorm';
import UserService from './user.service';
import SubjectEntity from '../entity/subject.entity';
import { DB } from '../common/database';

@Injectable()
export default class SubjectService {
    constructor(private userService: UserService) {
    }

    /**
     * Fetch a subject by a specified id.
     * @param subjectId
     */
    public async fetchSubjectById(subjectId: number): Promise<SubjectEntity> {
        return await DB.getRepository(SubjectEntity)
            .createQueryBuilder()
            .where('id = :subjectId', { subjectId })
            .getOne();
    }

    /**
     * Find all subjects for the given user.
     * @userId
     */
    public async fetchSubjects(userId: number): Promise<SubjectVo[]> {
        return await DB.getRepository(SubjectEntity)
            .createQueryBuilder('subject')
            .select(['subject.id', 'subject.name'])
            .where({ userId })
            .getMany();
    }

    /**
     * Create a subject.
     * @param subjectDto
     */
    public async createSubject(subjectDto: SubjectDto): Promise<InsertResult> {
        const userId = this.userService.getUserId();

        const task = await DB.getRepository(SubjectEntity)
            .createQueryBuilder()
            .where(subjectDto)
            .getOne();

        if (task) {
            throw new HttpException('A subject with the same name already exists.', HttpStatus.FORBIDDEN);
        }

        return await DB.createQueryBuilder()
            .insert()
            .into(SubjectEntity)
            .values({ userId, ...subjectDto })
            .execute();
    }

    /**
     * Delete a subject.
     * @param subjectId
     * @requires token
     */
    public async deleteSubject(subjectId: number): Promise<DeleteResult> {
        const subject = await this.fetchSubjectById(subjectId);

        if (!subject) {
            throw new HttpException('The subject is not found.', HttpStatus.NOT_FOUND);
        }

        if (subject.userId != this.userService.getUserId()) {
            throw new HttpException('You are not allowed to delete a subject that does not belong to you.', HttpStatus.FORBIDDEN);
        }

        return await DB.createQueryBuilder()
            .delete()
            .from(SubjectEntity)
            .where({ id: subjectId })
            .execute();
    }
}