import { TimeRecord } from 'src/entities/time-record.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Content extends TimeRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userId: string;

  @Column()
  path: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Image, (image) => image.content, { eager: true })
  images: Image[];
}

@Entity()
export class Image extends TimeRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  seq: number;

  @Column()
  contentId: number;

  @Column()
  type: string;

  @Column()
  width: number;

  @Column()
  height: number;

  @ManyToOne(() => Content)
  @JoinColumn({ name: 'content_id' })
  content?: Promise<Content>;
}
