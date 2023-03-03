import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('UsersBanInfo')
export class UserBanInfo {
  @PrimaryColumn()
  userId: number;
  @OneToOne(() => UserEntity, (u) => u.banInfo, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;

  @Column()
  isBanned: boolean;
  @Column({ nullable: true })
  banDate: Date | null;
  @Column({ nullable: true })
  banReason: string | null;
}
