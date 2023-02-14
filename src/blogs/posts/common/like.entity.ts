import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LikeStatuses } from '../../../common/like.types';
import { User } from '../../../users/entities/user.entity';

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  addedAt: Date;
  @Column()
  status: LikeStatuses;
  @ManyToOne(() => User, { eager: true })
  user: User;
  @Column()
  userId: number;
}
