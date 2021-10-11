import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class TimeRecord {
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
