import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('duration_sum')
export default class DurationSumEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Column({ type: 'bigint', unsigned: true })
  subjectId: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'int' })
  duration: number;
}