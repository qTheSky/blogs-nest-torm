import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LikeStatuses } from '../../../shared/types/like.types';
import { UserEntity } from '../../../users/entities/user.entity';

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  addedAt: Date;
  @Column()
  status: LikeStatuses;
  @ManyToOne(() => UserEntity, { eager: true })
  user: UserEntity;
  @Column()
  userId: number;
}
