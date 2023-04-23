import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET, tokenContainer, TokenContainerInterface } from './token';

@Injectable()
export default class TokenInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const [req] = context.getArgs();
        const tokenString = req.headers.token;

        tokenContainer.string = tokenString || null;
        if (tokenString) {
            const decoded = jwt.verify(tokenString, JWT_SECRET);
            tokenContainer.payload = <TokenContainerInterface['payload']>decoded;
        } else {
            tokenContainer.payload = undefined;
        }

        return next.handle().pipe(map((value: any) => value));
    }
}