import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserBanInfo {
  @PrimaryColumn()
  userId: number;
  @OneToOne(() => User, (u) => u.banInfo, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  isBanned: boolean;
  @Column({ nullable: true })
  banDate: Date | null;
  @Column({ nullable: true })
  banReason: string | null;
}
