import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserEmailConfirmation {
  @PrimaryColumn()
  userId: number;
  @OneToOne(() => User, (u) => u.emailConfirmation, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  confirmationCode: string;
  @Column()
  expirationDate: Date;

  @Column()
  isConfirmed: boolean;
}
