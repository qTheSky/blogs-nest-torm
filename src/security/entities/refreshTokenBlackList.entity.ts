import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class RefreshTokenBL {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: number;
  @Column()
  refreshToken: string;
  @Column()
  expiresIn: number;
}
