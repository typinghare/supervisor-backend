import StatisticsService, { SubjectDurationItem } from '../service/statistics.service';
import { Controller, Get, Query } from '@nestjs/common';
import ResponsePacket from '../common/response-packet';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('supervisor')
@Controller('/supervisor/statistics')
export default class StatisticsController {
    constructor(private statisticsService: StatisticsService) {
    }

    @Get('duration')
    public async fetchLastWeekDurationAggregation(@Query('userId') userId: number): Promise<ResponsePacket> {
        try {
            const result = await this.statisticsService.fetchLastWeekDurationAggregation(userId);
            return new ResponsePacket('Duration aggregation of last week has been fetched.').data(result);
        } catch (error) {
            return new ResponsePacket('Fail to fetch duration aggregation of last week.').handle(error);
        }
    }

    @Get('subject-duration')
    public async fetchLastWeekSubjectDuration(@Query('userId') userId: number): Promise<ResponsePacket<SubjectDurationItem[]>> {
        try {
            const result = await this.statisticsService.fetchLastWeekSubjectDuration(userId);
            return new ResponsePacket('Subject duration of last week has been fetched.').data(result);
        } catch (error) {
            return new ResponsePacket('Fail to fetch subject duration of last week.').handle(error);
        }
    }
}