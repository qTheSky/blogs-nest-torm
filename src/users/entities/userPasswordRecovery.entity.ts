import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('UsersPasswordRecovery')
export class UserPasswordRecoveryEntity {
  @PrimaryColumn()
  userId: number;
  @OneToOne(() => UserEntity, (u) => u.emailConfirmation, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;

  @Column()
  recoveryCode: string;
  @Column()
  expirationDate: Date;
  @Column()
  isCodeAlreadyUsed: boolean;
}
