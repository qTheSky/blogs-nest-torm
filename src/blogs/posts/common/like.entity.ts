import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { LikeStatuses } from '../../../common/like.types';
import { User } from '../../../users/entities/user.entity';

@Entity()
export class Like {
  @Column()
  addedAt: Date;
  @Column()
  status: LikeStatuses;
  @ManyToOne(() => User, { eager: true })
  user: User;
  @PrimaryColumn()
  userId: number;
}
