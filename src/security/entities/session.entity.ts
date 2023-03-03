import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('Sessions')
export class Session {
  @PrimaryColumn({ unique: true })
  deviceId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', eager: true })
  user: UserEntity;

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
