import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { UserEmailConfirmation } from './userEmailConfirmation.entity';
import { UserBanInfo } from './userBanInfo.entity';
import { UserPasswordRecoveryEntity } from './userPasswordRecovery.entity';

@Entity('Users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;
  @Column({ collation: 'C' })
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

  @OneToOne(() => UserPasswordRecoveryEntity, (p) => p.user, { cascade: true })
  passwordRecovery: UserPasswordRecoveryEntity;

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

  createPasswordRecovery(): string {
    const passwordRecovery = new UserPasswordRecoveryEntity();
    passwordRecovery.isCodeAlreadyUsed = false;
    passwordRecovery.user = this;
    passwordRecovery.recoveryCode = randomUUID();
    passwordRecovery.expirationDate = add(new Date(), { hours: 1 });

    this.passwordRecovery = passwordRecovery;
    return passwordRecovery.recoveryCode;
  }

  isNewPasswordCanBeSet(passwordRecoveryCode: string): boolean {
    if (this.passwordRecovery.isCodeAlreadyUsed) return false;
    if (passwordRecoveryCode !== this.passwordRecovery.recoveryCode) return false;
    if (this.passwordRecovery.expirationDate < new Date()) return false;
    return true;
  }

  makePasswordRecoveryCodeUsed() {
    this.passwordRecovery.isCodeAlreadyUsed = true;
  }

  updatePasswordHash(newPasswordHash: string, passwordRecoveryCode: string) {
    if (!this.isNewPasswordCanBeSet(passwordRecoveryCode)) {
      throw new Error('New password can`t be set');
    }
    this.passwordHash = newPasswordHash;
  }

  public static create(login: string, email: string, passwordHash: string, isConfirmedEmail: boolean): UserEntity {
    const user = new UserEntity();

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
