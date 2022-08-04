import { floor } from 'lodash';

export const getDifferentMinutes = function(date: Date): number {
  return floor((new Date().getTime() - date.getTime()) / 60000);
};