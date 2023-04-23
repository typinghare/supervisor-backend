import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import ResponsePacket from './response-packet';

@Injectable()
export default class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const [res] = context.getArgs();

        return next.handle().pipe(map((value: any) => {
            if (value instanceof ResponsePacket) {
                const error = value.getError();
                if (error instanceof HttpException) {
                    res.status = error.getStatus();
                }
                return value.toObject();
            }
            return value;
        }));
    }
}