import { floor } from 'lodash';
import * as crypto from 'crypto';
import { DATE_FORMAT } from './constant';
import * as moment from 'moment';

export const getDifferentMinutes = function(date: Date): number {
    return floor((new Date().getTime() - date.getTime()) / 60000);
};

export const getAuthString = function(password: string): string {
    const key = Buffer.from(String(process.env.AUTH_STRING_SECRET));
    const sha256Hash = crypto.createHmac('sha256', key);
    const sha256 = sha256Hash.update(password).digest('base64url');
    return sha256.slice(0, 32);
};

export const getDate = function(dateString: string): Date {
    return moment(dateString, DATE_FORMAT).toDate();
};

export const getDateString = function(date: Date): string {
    return moment(date).format(DATE_FORMAT);
};