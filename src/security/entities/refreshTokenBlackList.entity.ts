import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('RefreshTokensBlackList')
export class RefreshTokenBL {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column()
  userId: number;
  @Column()
  refreshToken: string;
  @Column()
  expiresIn: number;
}
