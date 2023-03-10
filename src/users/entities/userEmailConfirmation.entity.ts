import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('UsersEmailConfirm')
export class UserEmailConfirmation {
  @PrimaryColumn()
  userId: number;
  @OneToOne(() => UserEntity, (u) => u.emailConfirmation, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;

  @Column()
  confirmationCode: string;
  @Column()
  expirationDate: Date;

  @Column()
  isConfirmed: boolean;
}
