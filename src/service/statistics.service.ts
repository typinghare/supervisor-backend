import * as moment from 'moment';
import { Moment } from 'moment/moment';
import { DB } from '../common/database';
import TaskEntity from '../entity/task.entity';
import { Stage } from '../common/enum';

export type SubjectDurationItem = {
    subjectName: string,
    durationSum: number
};

export default class StatisticsService {
    /**
     * Fetches duration aggregation data of last week.
     * @param userId
     */
    public async fetchLastWeekDurationAggregation(userId: number): Promise<{ durationSum: number }[]> {
        const today = moment();
        const lastSevenDays = [today];
        for (let i = 1; i < 7; i++) {
            lastSevenDays.unshift(moment(today).subtract(i, 'days'));
        }

        const ret = [];
        for (let i = 0; i < 7; i++) {
            ret[i] = {
                durationSum: await this.fetchDurationSum(userId, lastSevenDays[i]),
            };
        }

        return ret;
    }

    /**
     *
     * @param userId
     * @param moment
     */
    public async fetchDurationSum(userId: number, moment: Moment): Promise<number> {
        const startDateTime = moment.startOf('day').toDate();
        const endDateTime = moment.endOf('day').toDate();

        const result = await DB.getRepository(TaskEntity)
            .createQueryBuilder('task')
            .select('SUM(task.duration) AS durationSum')
            .where('task.deleted_at IS NULL AND task.user_id = :userId', { userId })
            .andWhere('task.ended_at BETWEEN :startDateTime AND :endDateTime', { startDateTime, endDateTime })
            .getRawOne();

        return result.durationSum ? parseInt(result.durationSum) : 0;
    }

    public async fetchLastWeekSubjectDuration(userId: number): Promise<SubjectDurationItem[]> {
        const today = moment();
        const startDateTime = moment(today).subtract(6, 'days').startOf('day').toDate();
        const endDateTime = today.toDate();

        const result = await DB.getRepository(TaskEntity)
            .createQueryBuilder('task')
            .leftJoinAndSelect('task.category', 'category')
            .leftJoinAndSelect('category.subject', 'subject')
            .select('`subject`.name AS subjectName, SUM(task.duration) AS durationSum')
            .groupBy('subject.name')
            .where({ userId })
            .andWhere('task.deleted_at IS NULL')
            .andWhere('task.stage = :stage', { stage: Stage.ENDED })
            .andWhere('task.ended_at BETWEEN :startDateTime AND :endDateTime', { startDateTime, endDateTime })
            .getRawMany();

        result.forEach(item => {
            item.durationSum = parseInt(item.durationSum);
        });

        return result;
    }
}