import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { UserEmailConfirmation } from './userEmailConfirmation.entity';
import { UserBanInfo } from './userBanInfo.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ collation: 'en_US.utf8' })
  login: string;

  @Column()
  passwordHash: string;

  @Column()
  createdAt: Date;

  @OneToOne(() => UserEmailConfirmation, (emailConfirm) => emailConfirm.user, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  emailConfirmation: UserEmailConfirmation;

  @OneToOne(() => UserBanInfo, (banInfo) => banInfo.user, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  banInfo: UserBanInfo;

  isEmailCanBeConfirmed(code: string): boolean {
    if (this.emailConfirmation.isConfirmed) return false;
    if (this.emailConfirmation.confirmationCode !== code) return false;
    if (this.emailConfirmation.expirationDate < new Date()) return false;
    return true;
  }

  confirmEmail(code: string) {
    if (!this.isEmailCanBeConfirmed(code)) throw new Error('cant be confirmed');
    this.emailConfirmation.isConfirmed = true;
  }

  updateConfirmationCode() {
    this.emailConfirmation.confirmationCode = randomUUID();
    this.emailConfirmation.expirationDate = add(new Date(), { hours: 1 });
  }

  ban(banReason: string) {
    this.banInfo.isBanned = true;
    this.banInfo.banDate = new Date();
    this.banInfo.banReason = banReason;
  }

  unBan() {
    this.banInfo.isBanned = false;
    this.banInfo.banDate = null;
    this.banInfo.banReason = null;
  }

  public static create(login: string, email: string, passwordHash: string, isConfirmedEmail: boolean): User {
    const user = new User();

    user.login = login;
    user.email = email;
    user.passwordHash = passwordHash;
    user.createdAt = new Date();

    const emailConfirmation = new UserEmailConfirmation();
    emailConfirmation.expirationDate = add(new Date(), { hours: 1 });
    emailConfirmation.confirmationCode = randomUUID();
    emailConfirmation.isConfirmed = isConfirmedEmail;

    const banInfo = new UserBanInfo();
    banInfo.isBanned = false;
    banInfo.banDate = null;
    banInfo.banReason = null;

    user.emailConfirmation = emailConfirmation;
    user.banInfo = banInfo;
    return user;
  }
}
