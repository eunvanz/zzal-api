import { Content } from 'src/contents/contents.entity';
import { TimeRecord } from 'src/entities/time-record.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Tag extends TimeRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Content, { cascade: true })
  @JoinTable()
  contents: Content[];
}
