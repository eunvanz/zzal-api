import { TimeRecord } from 'src/entities/time-record.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Tag extends TimeRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
