import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Session {
  @PrimaryColumn({ unique: true })
  deviceId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @Column()
  issuedAt: Date;

  @Column()
  expiresIn: Date;

  @Column()
  ip: string;

  @Column()
  deviceName: string;

  @Column()
  refreshToken: string;
}
