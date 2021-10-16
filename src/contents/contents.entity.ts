import { TimeRecord } from 'src/entities/time-record.entity';
import { Tag } from 'src/tags/tags.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
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

  @Column({ default: 0 })
  viewCnt: number;

  @ManyToMany(() => Tag, { cascade: true })
  @JoinTable()
  tags: Tag[];
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

  @ManyToOne(() => Content, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'content_id' })
  content?: Promise<Content>;
}
