import { Content } from 'src/contents/contents.entity';
import { TimeRecord } from 'src/entities/time-record.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Tag extends TimeRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Content, (content) => content.tags)
  contents: Promise<Content[]>;
}
